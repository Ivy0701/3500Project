import random
from locust import HttpUser, task, between
from locust.exception import RescheduleTask

# ===================== Test Data (Strict Binding of Salesperson - Exclusive Store) =====================
PRODUCT_IDS = ["PROD-001", "PROD-002", "PROD-003", "PROD-004", "PROD-005", "PROD-006"]
STORE_IDS = [
    "STORE-EAST-01", "STORE-EAST-02",
    "STORE-WEST-01", "STORE-WEST-02",
    "STORE-NORTH-01", "STORE-NORTH-02",
    "STORE-SOUTH-01", "STORE-SOUTH-02"
]

# Each salesperson is only bound to the unique store assigned by the backend (strictly consistent with accessibleLocationIds)
USER_CREDENTIALS = {
    "sales": [
        ("east_store1_sales_01", "123456", ["STORE-EAST-01"]),  # East China salesperson → East Store 1
        ("west_store1_sales_01", "123456", ["STORE-WEST-01"]),  # West China salesperson → West Store 1
        ("north_store1_sales_01", "123456", ["STORE-NORTH-01"]), # North China salesperson → North Store 1
        ("south_store1_sales_01", "123456", ["STORE-SOUTH-01"])  # South China salesperson → South Store 1
    ],
    "centralManager": [
        ("central001", "123456", STORE_IDS),  # Central manager can access all stores
        ("central002", "123456", STORE_IDS)
    ]
}

# ===================== Core Login Function =====================
def get_token(client, account, password, role=None):
    try:
        login_data = {"account": account, "password": password}
        if role:
            login_data["role"] = role
            
        with client.post(
            "/api/auth/login",
            json=login_data,
            catch_response=True,
            timeout=10
        ) as resp:
            print(f"\n===== Login Debug =====\nAccount：{account} | Role：{role}\nStatus Code：{resp.status_code}\nResponse Content：{resp.text}")
            
            if resp.status_code != 200:
                resp.failure(f"Login failed：Account {account} | Status Code {resp.status_code} | Response {resp.text}")
                return None
            
            try:
                data = resp.json()
            except Exception as e:
                resp.failure(f"Login response parsing failed：Account {account} | Error {str(e)} | Response {resp.text}")
                return None
            
            token = data.get("data", {}).get("token") or data.get("token")
            if not token:
                resp.failure(f"No Token in login response：Account {account} | Response {data}")
                return None
            
            resp.success()
            print(f"✅ Login successful：Account {account} | Role：{role} | Token：{token[:20]}...（truncated）")
            return token
    except Exception as e:
        print(f"❌ Login request exception：Account {account} | Error {str(e)}")
        return None

# ===================== Mixed User Class (All Issues Fixed) =====================
class MixedUser(HttpUser):
    host = "http://localhost:4000"
    wait_time = between(1, 3)
    token = None
    role = None
    user_account = None
    accessible_stores = []  # List of stores accessible to current user

    def on_start(self):
        # Randomly select role (70% salesperson, 30% central manager)
        self.role = random.choices(["sales", "centralManager"], weights=[7, 3])[0]
        print(f"\n{'='*40}\n🚀 New user started | Role：{self.role}\n{'='*40}")
        
        if self.role == "sales":
            # Select salesperson account and bind to their exclusive store
            self.user_account, password, stores = random.choice(USER_CREDENTIALS["sales"])
            self.accessible_stores = stores  # Only keep stores assigned by backend
            print(f"📋 Salesperson account：{self.user_account} | Exclusive stores：{self.accessible_stores}")
            
            self.token = get_token(self.client, self.user_account, password, role="sales")
            
        else:  # centralManager role
            self.user_account, password, stores = random.choice(USER_CREDENTIALS["centralManager"])
            self.accessible_stores = stores  # All stores
            print(f"📋 Central manager account：{self.user_account} | Access to all stores")
            
            self.token = get_token(self.client, self.user_account, password, role="centralManager")
        
        if self.token:
            self.client.headers = {"Authorization": f"Bearer {self.token}"}
            print(f"✅ Request header bound：Authorization: Bearer {self.token[:20]}...")
        else:
            print(f"❌ {self.role} role login failed, skipping current user")
            raise RescheduleTask()

    @task(7)  # Higher weight for salesperson tasks
    def sales_query_inventory(self):
        if self.role != "sales":
            return
        
        # Force access only to exclusive stores (resolve 403 permission error)
        if not self.accessible_stores:
            print("⚠️ Warning：Salesperson has no available stores, skipping inventory query")
            return
            
        location_id = random.choice(self.accessible_stores)
        print(f"\n🛒 Salesperson query inventory\nAccount：{self.user_account} | Exclusive store ID：{location_id}")
        
        with self.client.get(
            f"/api/inventory/{location_id}",
            name="/api/inventory/:locationId [Mixed-Sales]",
            catch_response=True,
            timeout=5
        ) as resp:
            print(f"Inventory query response：Status Code {resp.status_code} | Content {resp.text[:200]}...")
            
            if resp.status_code == 200:
                try:
                    data = resp.json()
                    # Check if it's a list (multiple products) or single object
                    if isinstance(data, list):
                        if len(data) > 0 and "locationId" in data[0]:
                            resp.success()
                            print(f"✅ Inventory query successful：{location_id} | Number of products：{len(data)}")
                        else:
                            resp.failure(f"Inventory list data format exception | Response {data}")
                    elif isinstance(data, dict) and "locationId" in data:
                        resp.success()
                        print(f"✅ Inventory query successful：{location_id}")
                    else:
                        resp.failure(f"Inventory data has no locationId field | Response {data}")
                except Exception as e:
                    resp.failure(f"Inventory response parsing failed：{str(e)} | Response {resp.text}")
            elif resp.status_code == 403:
                resp.failure(f"Permission denied：Salesperson has no access to store {location_id}")
            else:
                resp.failure(f"Inventory query failed | Status Code {resp.status_code} | Response {resp.text}")

    @task(4)  # Create order task
    def sales_create_order(self):
        if self.role != "sales":
            return
        
        product_id = random.choice(PRODUCT_IDS)
        qty = random.randint(1, 3)
        
        # Generate random phone number to avoid duplicate order number issues
        random_phone = f"138{random.randint(10000000, 99999999)}"
        
        payload = {
            "items": [{
                "productId": product_id, 
                "productName": product_id, 
                "quantity": qty, 
                "price": 99
            }],
            "shippingAddress": {
                "name": f"Test User {random.randint(1000, 9999)}",
                "phone": random_phone,
                "street": f"Test Street {random.randint(1, 100)}",
                "state": random.choice(["Shanghai", "Beijing", "Guangzhou"]),
                "zipCode": str(random.randint(100000, 999999))
            },
            "totalAmount": 99 * qty,
            "paymentMethod": random.choice(["wechat", "alipay"])
        }
        
        print(f"\n📦 Salesperson create order\nAccount：{self.user_account} | Product ID：{product_id} | Quantity：{qty}")
        
        with self.client.post(
            "/api/orders",
            json=payload,
            name="/api/orders [Mixed-Sales]",
            catch_response=True,
            timeout=10
        ) as resp:
            print(f"Order creation response：Status Code {resp.status_code} | Content {resp.text[:200]}...")
            
            if resp.status_code in [200, 201]:
                try:
                    data = resp.json()
                    order_id = data.get("orderId") or data.get("id") or data.get("data", {}).get("orderId")
                    if order_id:
                        resp.success()
                        print(f"✅ Order creation successful：Order ID {order_id}")
                    else:
                        resp.failure(f"Order data has no orderId/id field | Response {data}")
                except Exception as e:
                    resp.failure(f"Order response parsing failed：{str(e)} | Response {resp.text}")
            elif resp.status_code == 400 and "duplicate" in resp.text.lower():
                resp.failure("Duplicate order number, skipping this request (normal business scenario)")
                print("⚠️ Duplicate order number, continuing to next request...")
            else:
                resp.failure(f"Order creation failed | Status Code {resp.status_code} | Response {resp.text}")

    @task(3)  # Lower weight for manager tasks
    def manager_query_inventory(self):
        if self.role != "centralManager":
            return
        
        # Central manager can access all stores
        location_id = random.choice(self.accessible_stores)
        print(f"\n👔 Central manager query inventory\nAccount：{self.user_account} | Store ID：{location_id}")
        
        with self.client.get(
            f"/api/inventory/{location_id}",
            name="/api/inventory/:locationId [Mixed-Manager]",
            catch_response=True,
            timeout=5
        ) as resp:
            print(f"Manager inventory query response：Status Code {resp.status_code} | Content {resp.text[:200]}...")
            
            if resp.status_code == 200:
                try:
                    data = resp.json()
                    # Check if it's a list or single object
                    if (isinstance(data, list) and len(data) > 0) or (isinstance(data, dict) and "locationId" in data):
                        resp.success()
                        print(f"✅ Manager inventory query successful：{location_id}")
                    else:
                        resp.failure(f"Manager inventory data format exception | Response {data}")
                except Exception as e:
                    resp.failure(f"Manager inventory response parsing failed：{str(e)} | Response {resp.text}")
            else:
                resp.failure(f"Manager inventory query failed | Status Code {resp.status_code} | Response {resp.text}")