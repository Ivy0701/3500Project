<template>
  <div class="orders">
    <section class="card">
      <h2 class="section-title">Create Order</h2>
      <form class="orders__form" @submit.prevent="createOrder">
        <div class="form-group">
          <label class="form-label" for="customer">Customer Name</label>
          <input id="customer" v-model="newOrder.customer" class="form-input" placeholder="Enter customer name" />
        </div>
        <div class="form-group">
          <label class="form-label" for="product">Select Product</label>
          <select id="product" v-model="newOrder.productName" class="filter-pill" @change="onProductChange">
            <option value="">Please select product</option>
            <option v-for="product in products" :key="product.id" :value="product.name">
              {{ product.name }} - ${{ product.price }}
            </option>
          </select>
        </div>
        <div v-if="selectedProductForOrder" class="form-group">
          <label class="form-label">Color</label>
          <select v-model="newOrder.color" class="filter-pill">
            <option value="">Please select color</option>
            <option v-for="color in selectedProductForOrder.colors" :key="color" :value="color">
              {{ color }}
            </option>
          </select>
        </div>
        <div v-if="selectedProductForOrder" class="form-group">
          <label class="form-label">Size</label>
          <select v-model="newOrder.size" class="filter-pill">
            <option value="">Please select size</option>
            <option v-for="size in selectedProductForOrder.sizes" :key="size" :value="size">
              {{ size }}
            </option>
          </select>
        </div>
        <div class="orders__form-row">
          <div class="form-group">
            <label class="form-label" for="quantity">Quantity</label>
            <input
              id="quantity"
              v-model.number="newOrder.quantity"
              class="form-input"
              type="number"
              min="0"
              placeholder="0"
            />
          </div>
          <div class="form-group">
            <label class="form-label" for="discount">Discount</label>
            <input
              id="discount"
              v-model.number="newOrder.discount"
              class="form-input"
              type="number"
              min="0"
              max="100"
              placeholder="0%"
            />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="remark">Remark</label>
          <textarea id="remark" v-model="newOrder.remark" class="form-textarea" rows="3" placeholder="Enter order remarks" />
        </div>
        <div class="orders__hint">
          <span>Current Stock: {{ inventoryHint }}</span>
          <span v-if="inventoryWarning" class="orders__hint-warning">{{ inventoryWarning }}</span>
        </div>
        <button class="btn-primary orders__submit" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Creating...' : 'Create Order' }}
        </button>
      </form>
    </section>

    <p v-if="errorMessage" class="orders__error">{{ errorMessage }}</p>

    <section class="card">
      <h2 class="section-title">Order List</h2>
      <div class="orders__tabs">
        <button
          v-for="tab in statusTabs"
          :key="tab.status"
          class="orders__tab"
          :class="{ 'orders__tab--active': tab.status === activeStatus }"
          type="button"
          @click="changeStatus(tab.status)"
        >
          {{ tab.label }} ({{ tab.count }})
        </button>
      </div>
      <div v-if="isLoading" class="empty">Loading orders...</div>
      <div v-else-if="!filteredOrders.length" class="empty">
        {{ activeStatus === 'all' ? 'No orders' : 'No orders with this status' }}
      </div>
      <div v-else class="list">
        <div
          v-for="order in filteredOrders"
          :key="order.id"
          class="list-item orders__item"
          :class="{ 'orders__item--active': selectedOrder && selectedOrder.id === order.id }"
          @click="selectOrder(order)"
        >
          <div class="orders__item-header">
            <span>{{ order.orderNumber || order.id }}</span>
            <span class="tag" :class="order.statusClass">{{ order.statusLabel }}</span>
          </div>
          <div class="orders__item-body">
            <span>{{ order.customerName || order.customer }}</span>
            <span>Amount: ${{ formatAmount(order.totalAmount || order.amount) }}</span>
          </div>
          <div class="orders__item-time" style="font-size: 12px; color: var(--color-text-muted); margin-top: 4px;">
            Order Time: {{ formatDateTime(order.createTime || order.createdAt) }}
          </div>
          <div v-if="order.items && order.items.length > 0" class="orders__item-products">
            <div v-for="(item, idx) in order.items" :key="idx" class="orders__product-item">
              <span>{{ item.productName || item.name }}</span>
              <span v-if="item.color || item.size" class="orders__product-spec">
                {{ item.color ? `Color: ${item.color}` : '' }}{{ item.color && item.size ? ' | ' : '' }}{{ item.size ? `Size: ${item.size}` : '' }}
              </span>
              <span>Quantity: {{ item.quantity }}</span>
            </div>
          </div>
          <div class="orders__item-meta">
            <span>Inventory Check: {{ order.inventoryStatus }}</span>
            <span>Updated: {{ formatDateTime(order.updatedAt) }}</span>
          </div>
        </div>
      </div>
    </section>

    <section v-if="selectedOrder" class="card">
      <h2 class="section-title">Order Details</h2>
      <div style="margin-bottom: 16px; padding: 12px; background: var(--color-background); border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
          <span><strong>Order Number:</strong>{{ selectedOrder.orderNumber || selectedOrder.id }}</span>
          <span><strong>Order Time:</strong>{{ formatDateTime(selectedOrder.createTime || selectedOrder.createdAt) }}</span>
        </div>
        <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
          <span><strong>Customer:</strong>{{ selectedOrder.customerName || selectedOrder.customer }}</span>
          <span><strong>Order Status:</strong><span class="tag" :class="selectedOrder.statusClass">{{ selectedOrder.statusLabel }}</span></span>
        </div>
      </div>
      <div v-if="selectedOrder.items && selectedOrder.items.length > 0" class="orders__detail-items">
        <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600;">Product Information</h3>
        <div v-for="(item, idx) in selectedOrder.items" :key="idx" class="orders__detail-item">
          <div class="orders__detail-item-header">
            <span style="font-size: 24px; margin-right: 8px;">{{ getItemIcon(item.productName || item.name) }}</span>
            <span style="font-weight: 600;">{{ item.productName || item.name }}</span>
          </div>
          <div class="orders__detail-item-body">
            <span v-if="item.color">Color: {{ item.color }}</span>
            <span v-if="item.size">Size: {{ item.size }}</span>
            <span>Quantity: {{ item.quantity }}</span>
            <span>Unit Price: ${{ formatAmount(item.price) }}</span>
            <span>Subtotal: ${{ formatAmount(item.price * item.quantity) }}</span>
          </div>
        </div>
      </div>
      <div v-if="selectedOrder.shippingAddress" class="orders__detail-address" style="margin-top: 16px;">
        <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600;">Shipping Address</h3>
        <div class="list">
          <div class="list-item">
            <span>Recipient: {{ selectedOrder.shippingAddress.name }}</span>
            <span>Phone: {{ selectedOrder.shippingAddress.phone }}</span>
          </div>
          <div class="list-item">
            <span>Address: {{ selectedOrder.shippingAddress.street }}, {{ selectedOrder.shippingAddress.state }} {{ selectedOrder.shippingAddress.zipCode }}</span>
          </div>
        </div>
      </div>
      <div class="timeline" style="margin-top: 16px;">
        <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600;">Order Timeline</h3>
        <div v-for="step in selectedOrder.timeline" :key="step.time" class="timeline-item">
          <span class="timeline-dot" />
          <div class="timeline-content">
            <span class="timeline-title">{{ step.title }}</span>
            <span v-if="step.title === 'After-sales Rejected' && selectedOrder.afterSales && selectedOrder.afterSales.rejectionReason" class="timeline-reason" style="font-size: 13px; color: var(--color-danger); margin-top: 4px; display: block;">
              Reason: {{ selectedOrder.afterSales.rejectionReason }}
            </span>
            <span class="timeline-time">{{ formatDateTime(step.time) }}</span>
          </div>
        </div>
      </div>
      <div class="orders__actions">
        <button v-if="selectedOrder.status === 'pending'" class="btn-primary" type="button" @click="confirmOrder">Confirm Order</button>
        <button v-if="selectedOrder.status === 'processing'" class="btn-primary" type="button" @click="shipOrder">Ship Order</button>
        <button v-if="['pending', 'processing'].includes(selectedOrder.status)" class="btn-secondary" type="button" @click="cancelOrder">Cancel Order</button>
        <button class="btn-secondary" type="button" @click="printOrder">Print Order</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { fetchOrders, createOrder as createOrderRequest, confirmOrder as confirmOrderApi, cancelOrder as cancelOrderApi, shipOrder as shipOrderApi } from '../services/orderService.js';

// Use the same product data as the customer page
const products = [
  { id: 'PROD-001', name: 'Casual T-Shirt', price: 29.99, colors: ['Black', 'White', 'Blue', 'Red', 'Gray'], sizes: ['S', 'M', 'L', 'XL'] },
  { id: 'PROD-002', name: 'Classic Denim Jeans', price: 59.99, colors: ['Blue', 'Black', 'Gray'], sizes: ['28', '30', '32', '34', '36'] },
  { id: 'PROD-003', name: 'Hooded Sweatshirt', price: 49.99, colors: ['Black', 'Gray', 'Navy', 'Red'], sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
  { id: 'PROD-004', name: 'Chino Pants', price: 54.99, colors: ['Khaki', 'Navy', 'Black', 'Olive'], sizes: ['30', '32', '34', '36', '38'] },
  { id: 'PROD-005', name: 'Polo Shirt', price: 39.99, colors: ['White', 'Black', 'Navy', 'Green', 'Red'], sizes: ['S', 'M', 'L', 'XL'] },
  { id: 'PROD-006', name: 'Jogger Pants', price: 44.99, colors: ['Black', 'Gray', 'Navy', 'Olive'], sizes: ['S', 'M', 'L', 'XL'] }
];

const inventoryMap = {
  'PROD-001': { available: 98 },
  'PROD-002': { available: 65 },
  'PROD-003': { available: 30 },
  'PROD-004': { available: 45 },
  'PROD-005': { available: 75 },
  'PROD-006': { available: 5 }
};

const statusLabelMap = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  completed: 'Completed',
  cancelled: 'Cancelled',
  returned: 'Returned',
  after_sales_processing: 'After-Sales Processing'
};

const statusClassMap = {
  pending: 'warning',
  processing: 'info',
  shipped: 'info',
  completed: 'success',
  cancelled: 'danger',
  returned: 'danger',
  after_sales_processing: 'info'
};

const newOrder = reactive({
  customer: '',
  productName: '',
  productId: '',
  color: '',
  size: '',
  quantity: 0,
  discount: 0,
  remark: ''
});

const selectedProductForOrder = computed(() => {
  return products.find(p => p.name === newOrder.productName) || null;
});

const inventoryHint = ref('Please select product to view inventory information');
const inventoryWarning = ref('');

const orders = ref([]);
const isLoading = ref(false);
const isSubmitting = ref(false);
const errorMessage = ref('');

const activeStatus = ref('pending');
const selectedOrder = ref(null);

const statusTabs = computed(() => {
  const counter = { pending: 0, processing: 0, shipped: 0, completed: 0, cancelled: 0, returned: 0 };
  orders.value.forEach((order) => {
    if (counter[order.status] !== undefined) {
      counter[order.status] += 1;
    }
  });
  return [
    { status: 'pending', label: 'Pending', count: counter.pending },
    { status: 'processing', label: 'Processing', count: counter.processing },
    { status: 'shipped', label: 'Shipped', count: counter.shipped },
    { status: 'completed', label: 'Completed', count: counter.completed }
  ];
});

const filteredOrders = computed(() => {
  if (activeStatus.value === 'all') {
    return orders.value;
  }
  return orders.value.filter((order) => order.status === activeStatus.value);
});

watch(
  filteredOrders,
  (value) => {
    if (!value.length) {
      selectedOrder.value = null;
      return;
    }
    if (!selectedOrder.value || !value.some((order) => order.id === selectedOrder.value.id)) {
      selectedOrder.value = value[0];
    }
  },
  { immediate: true }
);

const formatDateTime = (value) => {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';

  const pad = (num) => String(num).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const formatAmount = (value) => {
  if (value == null || value === undefined) return '0.00';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toFixed(2);
};

const getItemIcon = (productName) => {
  if (!productName) return '📦';
  const name = productName.toLowerCase();
  
  // Exact match product name (consistent with the mall)
  if (name === 'casual t-shirt') return '👕';
  if (name === 'classic denim jeans') return '👖';
  if (name === 'hooded sweatshirt') return '🧥';
  if (name === 'chino pants') return '👔';
  if (name === 'polo shirt') return '👔';
  if (name === 'jogger pants') return '👖';
  
  // Fuzzy matching (as a fallback)
  if (name.includes('polo')) return '👔';
  if (name.includes('chino')) return '👔';
  if (name.includes('jogger')) return '👖';
  if (name.includes('sweatshirt') || name.includes('hood')) return '🧥';
  if (name.includes('t-shirt') || (name.includes('shirt') && !name.includes('polo'))) return '👕';
  if (name.includes('jeans')) return '👖';
  if (name.includes('pants')) return '👖';
  
  return '📦';
};

const mapOrder = (order) => ({
  ...order,
  statusLabel: order.statusLabel || statusLabelMap[order.status] || order.status,
  statusClass: statusClassMap[order.status] || 'default'
});

const loadOrders = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const data = await fetchOrders();
    orders.value = data.map(mapOrder);
  } catch (error) {
    errorMessage.value = error.message || 'Failed to load order data';
  } finally {
    isLoading.value = false;
  }
};

// Automatically refresh the order list (every 30 seconds)
let refreshInterval = null;

onMounted(() => {
  loadOrders();
  
  // Set automatic refresh
  refreshInterval = setInterval(() => {
    loadOrders();
  }, 30000); // Every 30 seconds refresh
});

// Clear the timer when the component is unloaded
onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});

const onProductChange = () => {
  if (!newOrder.productName) {
    inventoryHint.value = 'Please select product to view inventory information';
    inventoryWarning.value = '';
    newOrder.color = '';
    newOrder.size = '';
    newOrder.productId = '';
    return;
  }
  const product = products.find(p => p.name === newOrder.productName);
  if (product) {
    newOrder.productId = product.id;
    const inventory = inventoryMap[product.id] || { available: 0 };
    inventoryHint.value = `Available Stock: ${inventory.available}`;
    inventoryWarning.value =
      inventory.available < 10 ? 'Insufficient stock, please confirm replenishment plan' : '';
  }
};

const resetForm = () => {
  newOrder.customer = '';
  newOrder.productName = '';
  newOrder.productId = '';
  newOrder.color = '';
  newOrder.size = '';
  newOrder.quantity = 0;
  newOrder.discount = 0;
  newOrder.remark = '';
  inventoryHint.value = 'Please select product to view inventory information';
  inventoryWarning.value = '';
};

const createOrder = async () => {
  if (!newOrder.customer || !newOrder.productName || !newOrder.quantity || !newOrder.color || !newOrder.size) {
    window.alert('Please fill in complete order information (including product, color, size)');
    return;
  }
  isSubmitting.value = true;
  try {
    const product = products.find(p => p.name === newOrder.productName);
    if (!product) {
      window.alert('Product does not exist');
      return;
    }
    
    await createOrderRequest({
      items: [{
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: newOrder.quantity,
        color: newOrder.color,
        size: newOrder.size
      }],
      shippingAddress: {
        name: newOrder.customer,
        phone: '',
        street: '',
        state: '',
        zipCode: '',
        notes: ''
      },
      subtotal: product.price * newOrder.quantity * (1 - newOrder.discount / 100),
      totalAmount: product.price * newOrder.quantity * (1 - newOrder.discount / 100),
      remark: newOrder.remark
    });
    window.alert('Order created successfully');
    await loadOrders();
    activeStatus.value = 'pending';
    resetForm();
  } catch (error) {
    window.alert(error.message || 'Failed to create order');
  } finally {
    isSubmitting.value = false;
  }
};

const changeStatus = (status) => {
  activeStatus.value = status;
};

const selectOrder = (order) => {
  selectedOrder.value = order;
};

const confirmOrder = async () => {
  if (!selectedOrder.value) {
    return;
  }
  
  if (!window.confirm('Are you sure you want to confirm this order? Order status will change to "Processing".')) {
    return;
  }
  
  try {
    const updatedOrder = await confirmOrderApi(selectedOrder.value.id);
    window.alert('Order confirmed!');
    // Immediately refresh orders to get latest status
    await loadOrders();
    // Re-select order to update details
    const refreshedOrder = orders.value.find(o => o.id === selectedOrder.value.id);
    if (refreshedOrder) {
      selectedOrder.value = mapOrder(refreshedOrder);
    }
  } catch (error) {
    window.alert('Failed to confirm order: ' + (error.message || 'Unknown error'));
    // Refresh anyway to ensure consistency
    await loadOrders();
  }
};

const shipOrder = async () => {
  if (!selectedOrder.value) {
    return;
  }
  
  if (!window.confirm('Are you sure you want to ship this order? The order status will change to "Shipped" and inventory will be decreased.')) {
    return;
  }
  
  try {
    const updatedOrder = await shipOrderApi(selectedOrder.value.id);
    window.alert('Order has been shipped successfully!');
    // Immediately refresh orders to get latest status
    await loadOrders();
    // Re-select order to update details
    const refreshedOrder = orders.value.find(o => o.id === selectedOrder.value.id);
    if (refreshedOrder) {
      selectedOrder.value = mapOrder(refreshedOrder);
    }
  } catch (error) {
    window.alert('Failed to ship order: ' + (error.message || 'Unknown error'));
    // Refresh anyway to ensure consistency
    await loadOrders();
  }
};

const cancelOrder = async () => {
  if (!selectedOrder.value) {
    return;
  }
  
  if (!window.confirm('Are you sure you want to cancel the order and restore inventory?')) {
    return;
  }
  
  try {
    const updatedOrder = await cancelOrderApi(selectedOrder.value.id);
    window.alert('Order cancelled!');
    // Immediately refresh orders to get latest status
    await loadOrders();
    // If order is cancelled, clear selection
    selectedOrder.value = null;
  } catch (error) {
    window.alert('Failed to cancel order: ' + (error.message || 'Unknown error'));
    // Refresh anyway to ensure consistency
    await loadOrders();
  }
};

const printOrder = () => {
  window.alert('Generating print file (demo)');
};
</script>

<style scoped>
.orders {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
}

.orders > .card:nth-child(1),
.orders > .card:nth-child(2) {
  min-height: 420px;
}

.orders__form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.orders__form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.form-textarea {
  resize: vertical;
}

.orders__hint {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--color-text-muted);
}

.orders__hint-warning {
  color: var(--color-warning);
}

.orders__submit {
  width: 100%;
  margin-top: 8px;
}

.orders__submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.orders__error {
  margin: 0;
  padding: 12px 16px;
  border-radius: 12px;
  background-color: rgba(242, 80, 86, 0.1);
  color: var(--color-danger);
}

.orders__tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.orders__tab {
  padding: 8px 14px;
  border-radius: 20px;
  background-color: var(--color-surface-alt);
  color: var(--color-text-muted);
  border: none;
}

.orders__tab--active {
  background-color: rgba(43, 181, 192, 0.2);
  color: var(--color-brand);
  font-weight: 600;
}

.orders__item {
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
}

.orders__item--active {
  border: 1px solid rgba(43, 181, 192, 0.4);
}

.orders__item-header,
.orders__item-body,
.orders__item-meta {
  display: flex;
  justify-content: space-between;
  color: #9ca3af;
  font-size: 13px;
}

.orders__item-products {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
  padding: 8px;
  background: var(--color-background);
  border-radius: 8px;
}

.orders__product-item {
  display: flex;
  gap: 12px;
  font-size: 14px;
  align-items: center;
}

.orders__product-spec {
  color: var(--color-text-muted);
  font-size: 13px;
}

.orders__detail-items {
  margin-bottom: 16px;
}

.orders__detail-item {
  padding: 12px;
  background: var(--color-background);
  border-radius: 8px;
  margin-bottom: 8px;
}

.orders__detail-item-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 16px;
}

.orders__detail-item-body {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 14px;
  color: var(--color-text-muted);
}

.orders__detail-address {
  padding: 12px;
  background: var(--color-background);
  border-radius: 8px;
}

.orders__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.orders__actions .btn-primary,
.orders__actions .btn-secondary {
  flex: 1 1 160px;
}

@media (max-width: 960px) {
  .orders {
    grid-template-columns: 1fr;
  }
}
</style>

