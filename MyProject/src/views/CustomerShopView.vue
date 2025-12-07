<template>
  <div class="customer-shop">
    <div class="customer-shop__header">
      <h1>Product List</h1>
      <p>Browse and purchase items you need</p>
    </div>

    <div class="customer-shop__filter">
      <input
        v-model="searchKeyword"
        class="form-input"
        placeholder="Search products..."
        @input="filterProducts"
      />
    </div>

    <div v-if="loading" class="customer-shop__loading">
      <p>Loading...</p>
    </div>

    <div v-else-if="filteredProducts.length === 0" class="customer-shop__empty">
      <p>No products available</p>
    </div>

    <div v-else class="customer-shop__grid">
      <div v-for="product in filteredProducts" :key="product.id" class="product-card">
        <div class="product-card__image">
          <div class="product-card__image-placeholder">{{ product.icon }}</div>
        </div>
        <div class="product-card__content">
          <h3 class="product-card__name">{{ product.name }}</h3>
          <p class="product-card__desc">{{ product.description }}</p>
          <div class="product-card__info">
            <span class="product-card__price">${{ product.price }}</span>
            <span class="product-card__stock">In Stock</span>
          </div>
          <button
            class="btn-primary product-card__btn"
            @click="showProductModal(product)"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>

    <!-- Product Variant Selection Modal -->
    <div v-if="selectedProduct" class="product-modal" @click.self="closeProductModal">
      <div class="product-modal__content">
        <div class="product-modal__header">
          <h2>{{ selectedProduct.name }}</h2>
          <button class="product-modal__close" @click="closeProductModal">×</button>
        </div>
        <div class="product-modal__body">
          <div class="product-modal__image">
            <div class="product-modal__image-placeholder">{{ selectedProduct.icon }}</div>
          </div>
          <div class="product-modal__details">
            <p class="product-modal__desc">{{ selectedProduct.description }}</p>
            <div class="product-modal__price">${{ selectedProduct.price }}</div>
            
            <!-- Size Selection -->
            <div class="product-modal__option">
              <label class="product-modal__label">Size:</label>
              <div class="product-modal__sizes">
                <button
                  v-for="size in selectedProduct.sizes"
                  :key="size"
                  class="size-option"
                  :class="{ 'size-option--selected': selectedSize === size }"
                  @click="selectedSize = size"
                >
                  {{ size }}
                </button>
              </div>
            </div>

            <!-- Quantity Selection -->
            <div class="product-modal__option">
              <label class="product-modal__label">Quantity:</label>
              <div class="product-modal__quantity">
                <button class="quantity-btn" @click="decreaseQuantity">-</button>
                <input
                  v-model.number="quantity"
                  class="quantity-input"
                  type="number"
                  min="1"
                  @input="validateQuantity"
                />
                <button class="quantity-btn" @click="increaseQuantity">+</button>
              </div>
            </div>
          </div>
        </div>
        <div class="product-modal__footer">
          <button class="btn-primary" @click="addToCartWithVariant" :disabled="!canAddToCart">
            Add to Cart
          </button>
        </div>
      </div>
    </div>

    <!-- Cart Modal -->
    <div v-if="showCart" class="cart-modal" @click.self="showCart = false">
      <div class="cart-modal__content">
        <div class="cart-modal__header">
          <h2>Shopping Cart</h2>
          <button class="cart-modal__close" @click="showCart = false">×</button>
        </div>
        <div v-if="cart.length === 0" class="cart-modal__empty">
          <p>Your cart is empty</p>
        </div>
        <div v-else class="cart-modal__list">
          <div v-for="item in cart" :key="item.cartId" class="cart-item">
            <div class="cart-item__info">
              <div class="cart-item__details">
                <span class="cart-item__name">{{ item.name }}</span>
                <span class="cart-item__variant">Size {{ item.size }}</span>
              </div>
              <span class="cart-item__price">${{ item.price }} × {{ item.quantity }}</span>
            </div>
            <div class="cart-item__actions">
              <button class="cart-item__btn" @click="updateQuantity(item.cartId, -1)">-</button>
              <span class="cart-item__quantity">{{ item.quantity }}</span>
              <button class="cart-item__btn" @click="updateQuantity(item.cartId, 1)">+</button>
              <button class="cart-item__remove" @click="removeFromCart(item.cartId)">Remove</button>
            </div>
          </div>
        </div>
        <div v-if="cart.length > 0" class="cart-modal__footer">
          <div class="cart-modal__total">
            Total: <span class="cart-modal__total-amount">${{ cartTotal }}</span>
          </div>
          <div class="cart-modal__footer-buttons">
            <button class="btn-secondary" @click="showCart = false">Continue Shopping</button>
            <button class="btn-primary" @click="checkout">Checkout</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Cart FAB -->
    <button class="cart-fab" @click="showCart = true" v-if="cart.length > 0">
      🛒
      <span class="cart-fab__badge">{{ cartTotalQuantity }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const searchKeyword = ref('');
const loading = ref(false);
const showCart = ref(false);
const cart = ref([]);
const selectedProduct = ref(null);
const selectedSize = ref('');
const quantity = ref(1);
let cartIdCounter = 0;

// Products data - Clothes and Pants
const products = ref([
  {
    id: 'PROD-001',
    name: 'Casual T-Shirt',
    description: 'Comfortable cotton t-shirt, perfect for daily wear',
    price: 29.99,
    sizes: ['One Size'],
    icon: '👕',
    category: 'clothes'
  },
  {
    id: 'PROD-002',
    name: 'Classic Denim Jeans',
    description: 'High-quality denim jeans, durable and stylish',
    price: 59.99,
    sizes: ['One Size'],
    icon: '👖',
    category: 'pants'
  },
  {
    id: 'PROD-003',
    name: 'Hooded Sweatshirt',
    description: 'Warm and cozy sweatshirt with hood',
    price: 49.99,
    sizes: ['One Size'],
    icon: '🧥',
    category: 'clothes'
  },
  {
    id: 'PROD-004',
    name: 'Chino Pants',
    description: 'Smart casual pants for office or weekend',
    price: 54.99,
    sizes: ['One Size'],
    icon: '👔',
    category: 'pants'
  },
  {
    id: 'PROD-005',
    name: 'Polo Shirt',
    description: 'Classic polo shirt, versatile and elegant',
    price: 39.99,
    sizes: ['One Size'],
    icon: '👔',
    category: 'clothes'
  },
  {
    id: 'PROD-006',
    name: 'Jogger Pants',
    description: 'Comfortable jogger pants for sport and leisure',
    price: 44.99,
    sizes: ['One Size'],
    icon: '👖',
    category: 'pants'
  }
]);

const filteredProducts = computed(() => {
  if (!searchKeyword.value) {
    return products.value;
  }
  const keyword = searchKeyword.value.toLowerCase();
  return products.value.filter((p) => 
    p.name.toLowerCase().includes(keyword) ||
    p.description.toLowerCase().includes(keyword)
  );
});

const cartTotal = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
});

const cartTotalQuantity = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.quantity, 0);
});

const canAddToCart = computed(() => {
  return selectedSize.value && quantity.value > 0;
});

const showProductModal = (product) => {
  selectedProduct.value = product;
  selectedSize.value = product.sizes[0] || 'One Size';
  quantity.value = 1;
};

const closeProductModal = () => {
  selectedProduct.value = null;
  selectedSize.value = '';
  quantity.value = 1;
};

const increaseQuantity = () => {
  quantity.value++;
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const validateQuantity = () => {
  if (quantity.value < 1 || !Number.isInteger(quantity.value) || isNaN(quantity.value)) {
    quantity.value = 1;
  }
};

const addToCartWithVariant = () => {
  if (!canAddToCart.value) {
    window.alert('Please select size and quantity');
    return;
  }

  const cartItem = {
    cartId: `cart-${++cartIdCounter}`,
    id: selectedProduct.value.id,
    name: selectedProduct.value.name,
    price: selectedProduct.value.price,
    size: selectedSize.value,
    quantity: quantity.value,
    icon: selectedProduct.value.icon
  };

  // Check if same product already exists (one-size, no color)
  const existingItem = cart.value.find(
    (item) => item.id === cartItem.id
  );

  if (existingItem) {
    existingItem.quantity += quantity.value;
  } else {
    cart.value.push(cartItem);
  }

  closeProductModal();
  // Show success message instead of automatically opening cart
  // User can continue shopping and check cart when ready
};

const updateQuantity = (cartId, delta) => {
  const item = cart.value.find(item => item.cartId === cartId);
  if (item) {
    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
      removeFromCart(cartId);
    } else {
      item.quantity = newQuantity;
    }
  }
};

const removeFromCart = (cartId) => {
  const index = cart.value.findIndex(item => item.cartId === cartId);
  if (index > -1) {
    cart.value.splice(index, 1);
  }
};

const checkout = () => {
  if (cart.value.length === 0) {
    return;
  }
  // Save cart to localStorage for checkout page
  localStorage.setItem('checkout-cart', JSON.stringify(cart.value));
  // Navigate to checkout page
  router.push('/customer/checkout');
  showCart.value = false;
};

const filterProducts = () => {
  // Filtering is handled by computed property
};

onMounted(() => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 500);
});
</script>

<style scoped>
.customer-shop {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.customer-shop__header {
  text-align: center;
  margin-bottom: 16px;
}

.customer-shop__header h1 {
  margin: 0;
  font-size: 28px;
  color: var(--color-text);
}

.customer-shop__header p {
  margin: 8px 0 0;
  color: var(--color-text-muted);
}

.customer-shop__filter {
  margin-bottom: 16px;
}

.customer-shop__loading,
.customer-shop__empty {
  text-align: center;
  padding: 48px;
  color: var(--color-text-muted);
}

.customer-shop__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.product-card {
  background: var(--color-surface);
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--shadow-soft);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card);
}

.product-card__image {
  width: 100%;
  aspect-ratio: 1;
  background: var(--color-background);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-card__image-placeholder {
  font-size: 64px;
}

.product-card__name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
}

.product-card__desc {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-muted);
  flex: 1;
}

.product-card__info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-card__price {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-brand);
}

.product-card__stock {
  font-size: 14px;
  color: var(--color-text-muted);
}

.product-card__btn {
  width: 100%;
  margin-top: 8px;
}

/* Product Modal */
.product-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.product-modal__content {
  background: var(--color-surface);
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.product-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.product-modal__header h2 {
  margin: 0;
  font-size: 20px;
}

.product-modal__close {
  background: none;
  border: none;
  font-size: 32px;
  color: var(--color-text-muted);
  cursor: pointer;
  line-height: 1;
}

.product-modal__body {
  padding: 24px;
  overflow-y: auto;
  display: flex;
  gap: 24px;
}

.product-modal__image {
  width: 200px;
  height: 200px;
  background: var(--color-background);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.product-modal__image-placeholder {
  font-size: 96px;
}

.product-modal__details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-modal__desc {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-muted);
}

.product-modal__price {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-brand);
}

.product-modal__option {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-modal__label {
  font-weight: 600;
  color: var(--color-text);
  font-size: 14px;
}

.product-modal__colors {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.color-option {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  border: 3px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  position: relative;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option--selected {
  border-color: var(--color-brand);
  box-shadow: 0 0 0 2px rgba(43, 181, 192, 0.2);
}

.color-option__check {
  color: #ffffff;
  font-weight: bold;
  font-size: 20px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.product-modal__sizes {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.size-option {
  min-width: 48px;
  height: 48px;
  padding: 0 16px;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  background: var(--color-surface);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.size-option:hover {
  border-color: var(--color-brand);
}

.size-option--selected {
  border-color: var(--color-brand);
  background: var(--color-brand);
  color: #ffffff;
}

.product-modal__quantity {
  display: flex;
  align-items: center;
  gap: 16px;
}

.quantity-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  background: var(--color-surface);
  cursor: pointer;
  font-size: 18px;
  font-weight: 600;
}

.quantity-value,
.quantity-input {
  min-width: 40px;
  text-align: center;
  font-weight: 600;
  font-size: 18px;
}

.quantity-input {
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 4px 8px;
  background: white;
  outline: none;
}

.quantity-input:focus {
  border-color: #2bb5c0;
}

.product-modal__footer {
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
}

.product-modal__footer .btn-primary {
  width: 100%;
}

/* Cart Modal */
.cart-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.cart-modal__content {
  background: var(--color-surface);
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-card);
}

.cart-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.cart-modal__header h2 {
  margin: 0;
  font-size: 20px;
}

.cart-modal__close {
  background: none;
  border: none;
  font-size: 32px;
  color: var(--color-text-muted);
  cursor: pointer;
  line-height: 1;
}

.cart-modal__list {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cart-modal__empty {
  text-align: center;
  padding: 48px;
  color: var(--color-text-muted);
}

.cart-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: var(--color-background);
  border-radius: 8px;
}

.cart-item__info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.cart-item__details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.cart-item__name {
  font-weight: 500;
}

.cart-item__variant {
  font-size: 12px;
  color: var(--color-text-muted);
}

.cart-item__price {
  color: var(--color-brand);
  font-weight: 600;
  white-space: nowrap;
}

.cart-item__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cart-item__btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: var(--color-surface);
  cursor: pointer;
}

.cart-item__quantity {
  min-width: 32px;
  text-align: center;
  font-weight: 500;
}

.cart-item__remove {
  margin-left: auto;
  padding: 4px 12px;
  background: none;
  border: none;
  color: #f25056;
  cursor: pointer;
  font-size: 14px;
}

.cart-modal__footer {
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cart-modal__footer-buttons {
  display: flex;
  gap: 12px;
}

.cart-modal__footer-buttons .btn-primary,
.cart-modal__footer-buttons .btn-secondary {
  flex: 1;
}

.cart-modal__total {
  font-size: 18px;
  font-weight: 600;
}

.cart-modal__total-amount {
  color: var(--color-brand);
  font-size: 24px;
}

.cart-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-brand);
  color: #ffffff;
  border: none;
  font-size: 24px;
  box-shadow: var(--shadow-card);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 100;
}

.cart-fab__badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #f25056;
  color: #ffffff;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .product-modal__body {
    flex-direction: column;
  }

  .product-modal__image {
    width: 100%;
    height: 200px;
  }
}
</style>