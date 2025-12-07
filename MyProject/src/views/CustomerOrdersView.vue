<template>
  <div class="customer-orders">
    <section class="card">
      <h2 class="section-title">Customer Orders</h2>
      <div class="filter-bar">
        <input
          v-model="filters.orderNumber"
          class="form-input customer-orders__filter-input"
          placeholder="Order Number"
          @input="applyFilters"
        />
        <input
          v-model="filters.customerName"
          class="form-input customer-orders__filter-input"
          placeholder="Customer Name"
          @input="applyFilters"
        />
        <select v-model="filters.status" class="filter-pill customer-orders__filter-picker" @change="applyFilters">
          <option value="">Status: All</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          v-model="filters.startDate"
          class="filter-pill customer-orders__filter-input"
          type="date"
          @change="applyFilters"
        />
        <input
          v-model="filters.endDate"
          class="filter-pill customer-orders__filter-input"
          type="date"
          @change="applyFilters"
        />
      </div>
    </section>

    <section class="card">
      <h2 class="section-title">Order List</h2>
      <div v-if="isLoading" class="empty">Loading orders...</div>
      <div v-else-if="!filteredOrders.length" class="empty">No orders found</div>
      <div v-else class="customer-orders__table-wrapper">
        <div class="customer-orders__table">
          <div class="customer-orders__table-header">
            <span class="col col-wide">Order Info</span>
            <span class="col">Customer</span>
            <span class="col">Amount</span>
            <span class="col">Status</span>
            <span class="col">Date</span>
          </div>
          <div
            v-for="order in filteredOrders"
            :key="order.id"
            class="customer-orders__table-row"
            :class="{ 'customer-orders__table-row--active': selectedOrder && selectedOrder.id === order.id }"
            @click="selectOrder(order)"
          >
            <div class="col col-wide">
              <div class="customer-orders__order-name">{{ order.orderNumber || order.id }}</div>
              <div class="customer-orders__order-meta">
                Items: {{ order.items ? order.items.length : 0 }} | Total: ${{ formatAmount(order.totalAmount || order.amount) }}
              </div>
            </div>
            <span class="col">{{ order.customerName || order.customer }}</span>
            <span class="col">${{ formatAmount(order.totalAmount || order.amount) }}</span>
            <span class="col"><span class="tag" :class="order.statusClass">{{ order.statusLabel }}</span></span>
            <span class="col">{{ formatDate(order.createTime || order.createdAt) }}</span>
          </div>
        </div>
      </div>
    </section>

    <section v-if="selectedOrder" class="card">
      <h2 class="section-title">Order Details</h2>
      <div class="customer-orders__detail">
        <div class="customer-orders__detail-section">
          <h3>Order Information</h3>
          <div class="list">
            <div class="list-item">
              <span>Order Number:</span>
              <span>{{ selectedOrder.orderNumber || selectedOrder.id }}</span>
            </div>
            <div class="list-item">
              <span>Customer:</span>
              <span>{{ selectedOrder.customerName || selectedOrder.customer }}</span>
            </div>
            <div class="list-item">
              <span>Order Date:</span>
              <span>{{ formatDateTime(selectedOrder.createTime || selectedOrder.createdAt) }}</span>
            </div>
            <div class="list-item">
              <span>Status:</span>
              <span class="tag" :class="selectedOrder.statusClass">{{ selectedOrder.statusLabel }}</span>
            </div>
            <div class="list-item">
              <span>Total Amount:</span>
              <span>${{ formatAmount(selectedOrder.totalAmount || selectedOrder.amount) }}</span>
            </div>
          </div>
        </div>

        <div v-if="selectedOrder.items && selectedOrder.items.length > 0" class="customer-orders__detail-section">
          <h3>Products</h3>
          <div class="list">
            <div v-for="(item, idx) in selectedOrder.items" :key="idx" class="list-item customer-orders__product-item">
              <div class="customer-orders__product-header">
                <span style="font-size: 24px; margin-right: 8px;">{{ getItemIcon(item.productName || item.name) }}</span>
                <span style="font-weight: 600;">{{ item.productName || item.name }}</span>
              </div>
              <div class="customer-orders__product-body">
                <span>Size: {{ item.size || 'One Size' }}</span>
                <span>Quantity: {{ item.quantity }}</span>
                <span>Price: ${{ formatAmount(item.price) }}</span>
                <span>Subtotal: ${{ formatAmount(item.price * item.quantity) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="selectedOrder.shippingAddress" class="customer-orders__detail-section">
          <h3>Shipping Address</h3>
          <div class="list">
            <div class="list-item">
              <span>Recipient: {{ selectedOrder.shippingAddress.name }}</span>
              <span>Phone: {{ selectedOrder.shippingAddress.phone }}</span>
            </div>
            <div class="list-item">
              <span>{{ selectedOrder.shippingAddress.street }}{{ selectedOrder.shippingAddress.city ? `, ${selectedOrder.shippingAddress.city}` : '' }}, {{ selectedOrder.shippingAddress.state }} {{ selectedOrder.shippingAddress.zipCode }}</span>
            </div>
          </div>
        </div>

        <div v-if="selectedOrder.timeline && selectedOrder.timeline.length > 0" class="customer-orders__detail-section">
          <h3>Order Timeline</h3>
          <div class="timeline">
            <div v-for="(step, idx) in selectedOrder.timeline" :key="idx" class="timeline-item">
              <span class="timeline-dot" />
              <div class="timeline-content">
                <span class="timeline-title">{{ step.title }}</span>
                <span v-if="step.title === 'After-sales Rejected' && selectedOrder.afterSales && selectedOrder.afterSales.rejectionReason" class="timeline-reason">
                  Reason: {{ selectedOrder.afterSales.rejectionReason }}
                </span>
                <span class="timeline-time">{{ formatDateTime(step.time) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="showActions" class="customer-orders__actions">
          <!-- Sales staff: Confirm order button (when status is pending) -->
          <button
            v-if="isSalesStaff && selectedOrder.status === 'pending'"
            class="btn-primary"
            type="button"
            :disabled="isProcessing"
            @click="handleConfirmOrder"
          >
            {{ isProcessing ? 'Confirming...' : 'Confirm Order' }}
          </button>

          <!-- Sales staff: Ship order button (when status is processing) -->
          <button
            v-if="isSalesStaff && selectedOrder.status === 'processing'"
            class="btn-primary"
            type="button"
            :disabled="isProcessing"
            @click="handleShipOrder"
          >
            {{ isProcessing ? 'Shipping...' : 'Ship Order' }}
          </button>
          
          <!-- Customer: Confirm receipt button (when status is shipped) -->
          <button
            v-if="isCustomer && selectedOrder.status === 'shipped'"
            class="btn-primary"
            type="button"
            :disabled="isProcessing"
            @click="handleConfirmReceipt"
          >
            {{ isProcessing ? 'Confirming...' : 'Confirm Receipt' }}
          </button>

          <!-- Customer: Apply after-sales (when shipped or completed and no pending after-sales) -->
          <button
            v-if="isCustomer && ['shipped', 'completed'].includes(selectedOrder.status) && !hasPendingAfterSales"
            class="btn-secondary"
            type="button"
            :disabled="isProcessing"
            @click="openAfterSalesModal"
          >
            Apply After-Sales
          </button>
        </div>

        <!-- After-sales modal -->
        <div v-if="showAfterSalesModal" class="after-sales-modal" @click.self="closeAfterSalesModal">
          <div class="after-sales-modal__content">
            <div class="after-sales-modal__header">
              <h3>Apply After-Sales</h3>
              <button class="after-sales-modal__close" type="button" @click="closeAfterSalesModal">×</button>
            </div>
            <div class="after-sales-modal__body">
              <div class="form-group">
                <label class="form-label">Type *</label>
                <div class="after-sales-modal__type">
                  <label class="radio-label">
                    <input
                      type="radio"
                      value="exchange"
                      v-model="afterSalesForm.type"
                    />
                    Exchange
                  </label>
                  <label class="radio-label">
                    <input
                      type="radio"
                      value="refund"
                      v-model="afterSalesForm.type"
                    />
                    Return & Refund
                  </label>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label" for="afterSalesReason">Reason *</label>
                <textarea
                  id="afterSalesReason"
                  v-model="afterSalesForm.reason"
                  class="form-input"
                  rows="3"
                  placeholder="Please describe the reason for exchange or refund"
                  required
                ></textarea>
              </div>
            </div>
            <div class="after-sales-modal__footer">
              <button class="btn-secondary" type="button" @click="closeAfterSalesModal">Cancel</button>
              <button class="btn-primary" type="button" :disabled="isProcessing" @click="submitAfterSales">
                {{ isProcessing ? 'Submitting...' : 'Submit Request' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { fetchOrders, shipOrder, confirmOrderReceipt, confirmOrder as confirmOrderApi, returnOrder } from '../services/orderService';
import { useAppStore } from '../store/appStore';

const appStore = useAppStore();

const filters = reactive({
  orderNumber: '',
  customerName: '',
  status: '',
  startDate: '',
  endDate: ''
});

const orders = ref([]);
const isLoading = ref(false);
const isProcessing = ref(false);
const selectedOrder = ref(null);

// Check user role
const isSalesStaff = computed(() => appStore.user.role === 'sales');
const isCustomer = computed(() => appStore.user.role === 'customer');

// Show actions if there are available actions for current user and order status
const showActions = computed(() => {
  if (!selectedOrder.value) return false;
  return (
    (isSalesStaff.value && ['pending', 'processing'].includes(selectedOrder.value.status)) ||
    (isCustomer.value && ['shipped', 'completed'].includes(selectedOrder.value.status))
  );
});

const statusLabelMap = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  completed: 'Completed',
  cancelled: 'Cancelled',
  returned: 'Returned',
  after_sales_processing: 'After-sales Processing'
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

const mapOrder = (order) => ({
  ...order,
  statusLabel: order.statusLabel || statusLabelMap[order.status] || order.status,
  statusClass: statusClassMap[order.status] || 'default'
});

const showAfterSalesModal = ref(false);
const afterSalesForm = reactive({
  type: '',
  reason: ''
});

const hasPendingAfterSales = computed(() => {
  if (!selectedOrder.value || !selectedOrder.value.afterSales) return false;
  const info = selectedOrder.value.afterSales;
  // Only treat as pending after-sales if type & reason are present
  return !!info.type && !!info.reason && info.status === 'pending';
});

const filteredOrders = computed(() => {
  return orders.value.filter((order) => {
    const matchOrderNumber = !filters.orderNumber || (order.orderNumber || order.id).toLowerCase().includes(filters.orderNumber.toLowerCase());
    const matchCustomer = !filters.customerName || (order.customerName || order.customer || '').toLowerCase().includes(filters.customerName.toLowerCase());
    const matchStatus = !filters.status || order.status === filters.status;
    const orderDate = new Date(order.createTime || order.createdAt);
    const matchStartDate = !filters.startDate || orderDate >= new Date(filters.startDate);
    const matchEndDate = !filters.endDate || orderDate <= new Date(filters.endDate + 'T23:59:59');
    return matchOrderNumber && matchCustomer && matchStatus && matchStartDate && matchEndDate;
  });
});

const loadOrders = async () => {
  isLoading.value = true;
  try {
    const data = await fetchOrders();
    orders.value = data.map(mapOrder);
    if (orders.value.length > 0 && !selectedOrder.value) {
      selectedOrder.value = orders.value[0];
    }
  } catch (error) {
    console.error('Failed to load orders:', error);
  } finally {
    isLoading.value = false;
  }
};

const applyFilters = () => {
  // Filters are applied via computed property
};

const selectOrder = (order) => {
  selectedOrder.value = order;
};

const formatDate = (value) => {
  if (!value) return '--';
  return new Date(value).toLocaleDateString('en-US');
};

const formatDateTime = (value) => {
  if (!value) return '--';
  return new Date(value).toLocaleString('en-US', { hour12: false });
};

const formatAmount = (value) => {
  if (value == null || value === undefined) return '0.00';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toFixed(2);
};

const getItemIcon = (productName) => {
  if (!productName) return '📦';
  const name = productName.toLowerCase();
  
  // 精确匹配产品名称（与商城保持一致）
  if (name === 'casual t-shirt') return '👕';
  if (name === 'classic denim jeans') return '👖';
  if (name === 'hooded sweatshirt') return '🧥';
  if (name === 'chino pants') return '👔';
  if (name === 'polo shirt') return '👔';
  if (name === 'jogger pants') return '👖';
  
  // 模糊匹配（作为后备方案）
  if (name.includes('polo')) return '👔';
  if (name.includes('chino')) return '👔';
  if (name.includes('jogger')) return '👖';
  if (name.includes('sweatshirt') || name.includes('hood')) return '🧥';
  if (name.includes('t-shirt') || (name.includes('shirt') && !name.includes('polo'))) return '👕';
  if (name.includes('jeans')) return '👖';
  if (name.includes('pants')) return '👖';
  
  return '📦';
};

const handleConfirmOrder = async () => {
  if (!selectedOrder.value) return;

  if (!window.confirm('Are you sure you want to confirm this order? The order status will change to "Processing".')) {
    return;
  }

  isProcessing.value = true;
  try {
    const updatedOrder = await confirmOrderApi(selectedOrder.value.id);
    // Update the order in the list
    const orderIndex = orders.value.findIndex(o => o.id === selectedOrder.value.id);
    if (orderIndex !== -1) {
      orders.value[orderIndex] = mapOrder(updatedOrder);
      selectedOrder.value = mapOrder(updatedOrder);
    }
    window.alert('Order confirmed successfully!');
  } catch (error) {
    window.alert('Failed to confirm order: ' + (error.message || 'Unknown error'));
  } finally {
    isProcessing.value = false;
  }
};

const handleShipOrder = async () => {
  if (!selectedOrder.value) return;
  
  if (!window.confirm('Are you sure you want to ship this order? The order status will change to "Shipped".')) {
    return;
  }
  
  isProcessing.value = true;
  try {
    const updatedOrder = await shipOrder(selectedOrder.value.id);
    // Immediately refresh orders to get latest status from database
    await loadOrders();
    // Update the selected order
    const refreshedOrder = orders.value.find(o => o.id === selectedOrder.value.id);
    if (refreshedOrder) {
      selectedOrder.value = mapOrder(refreshedOrder);
    }
    window.alert('Order has been shipped successfully!');
  } catch (error) {
    window.alert('Failed to ship order: ' + (error.message || 'Unknown error'));
    // Refresh anyway to ensure consistency
    await loadOrders();
  } finally {
    isProcessing.value = false;
  }
};

const handleConfirmReceipt = async () => {
  if (!selectedOrder.value) return;
  
  if (!window.confirm('Are you sure you have received this order? The order status will change to "Completed".')) {
    return;
  }
  
  isProcessing.value = true;
  try {
    const updatedOrder = await confirmOrderReceipt(selectedOrder.value.id);
    // Update the order in the list
    const orderIndex = orders.value.findIndex(o => o.id === selectedOrder.value.id);
    if (orderIndex !== -1) {
      orders.value[orderIndex] = mapOrder(updatedOrder);
      selectedOrder.value = mapOrder(updatedOrder);
    }
    window.alert('Order receipt confirmed successfully!');
  } catch (error) {
    window.alert('Failed to confirm receipt: ' + (error.message || 'Unknown error'));
  } finally {
    isProcessing.value = false;
  }
};

const openAfterSalesModal = () => {
  afterSalesForm.type = '';
  afterSalesForm.reason = '';
  showAfterSalesModal.value = true;
};

const closeAfterSalesModal = () => {
  showAfterSalesModal.value = false;
};

const submitAfterSales = async () => {
  if (!selectedOrder.value) return;
  if (!afterSalesForm.type) {
    window.alert('Please select after-sales type (exchange or refund)');
    return;
  }
  if (!afterSalesForm.reason || !afterSalesForm.reason.trim()) {
    window.alert('Please enter the reason for after-sales');
    return;
  }

  isProcessing.value = true;
  try {
    const updatedOrder = await returnOrder(selectedOrder.value.id, {
      type: afterSalesForm.type,
      reason: afterSalesForm.reason
    });
    const orderIndex = orders.value.findIndex(o => o.id === selectedOrder.value.id);
    if (orderIndex !== -1) {
      orders.value[orderIndex] = mapOrder(updatedOrder);
      selectedOrder.value = mapOrder(updatedOrder);
    }
    window.alert('After-sales request submitted successfully');
    closeAfterSalesModal();
  } catch (error) {
    window.alert('Failed to submit after-sales request: ' + (error.message || 'Unknown error'));
  } finally {
    isProcessing.value = false;
  }
};

onMounted(() => {
  loadOrders();
});
</script>

<style scoped>
.customer-orders {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
}

.customer-orders__filter-input {
  flex: 1;
  min-width: 180px;
}

.customer-orders__filter-picker {
  min-width: 160px;
}

.customer-orders__table-wrapper {
  border-radius: 16px;
  border: 1px solid var(--color-border);
  overflow-x: auto;
  overflow-y: visible;
  -webkit-overflow-scrolling: touch;
}

.customer-orders__table-wrapper::-webkit-scrollbar {
  height: 8px;
}

.customer-orders__table-wrapper::-webkit-scrollbar-track {
  background: var(--color-background);
  border-radius: 4px;
}

.customer-orders__table-wrapper::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}

.customer-orders__table-wrapper::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-muted);
}

.customer-orders__table {
  display: flex;
  flex-direction: column;
  min-width: 800px;
}

.customer-orders__table-header,
.customer-orders__table-row {
  display: grid;
  grid-template-columns: minmax(200px, 2fr) minmax(120px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(120px, 1fr);
  gap: 12px;
  padding: 16px 20px;
  align-items: center;
}

.customer-orders__table-header {
  background-color: var(--color-surface-alt);
  font-weight: 600;
  color: var(--color-text-muted);
}

.customer-orders__table-row {
  border-top: 1px solid var(--color-border);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.customer-orders__table-row:hover {
  background-color: rgba(43, 181, 192, 0.08);
}

.customer-orders__table-row--active {
  background-color: rgba(43, 181, 192, 0.12);
}

.customer-orders__order-name {
  font-weight: 600;
}

.customer-orders__order-meta {
  margin-top: 4px;
  color: #9ca3af;
  font-size: 13px;
}

.customer-orders__detail {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.customer-orders__detail-section h3 {
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 600;
}

.customer-orders__product-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.customer-orders__product-header {
  display: flex;
  align-items: center;
  font-size: 16px;
}

.customer-orders__product-body {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 14px;
  color: var(--color-text-muted);
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.timeline-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--color-brand);
  flex-shrink: 0;
  margin-top: 4px;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.timeline-title {
  font-weight: 600;
  color: var(--color-text);
}

.timeline-time {
  font-size: 13px;
  color: var(--color-text-muted);
}

.timeline-reason {
  font-size: 13px;
  color: var(--color-danger);
  margin-top: 4px;
  display: block;
}

.customer-orders__actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--color-border);
}

.customer-orders__actions .btn-primary {
  min-width: 160px;
}

.after-sales-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2100;
  padding: 20px;
}

.after-sales-modal__content {
  background: var(--color-surface);
  border-radius: 16px;
  width: 100%;
  max-width: 520px;
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.after-sales-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
}

.after-sales-modal__close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--color-text-muted);
}

.after-sales-modal__body {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.after-sales-modal__footer {
  padding: 16px 20px;
  border-top: 1px solid var(--color-border);
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.after-sales-modal__type {
  display: flex;
  gap: 16px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

@media (max-width: 960px) {
  .customer-orders {
    grid-template-columns: 1fr;
  }
}
</style>
