<template>
  <div class="return-requests">
    <section class="card">
      <h2 class="section-title">Return Requests</h2>
      <div class="filter-bar">
        <input
          v-model="filters.orderNumber"
          class="form-input return-requests__filter-input"
          placeholder="Order Number"
          @input="applyFilters"
        />
        <input
          v-model="filters.customerName"
          class="form-input return-requests__filter-input"
          placeholder="Customer Name"
          @input="applyFilters"
        />
        <select v-model="filters.status" class="filter-pill return-requests__filter-picker" @change="applyFilters">
          <option value="">Status: All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </section>

    <section class="card">
      <h2 class="section-title">Request List</h2>
      <div v-if="!filteredRequests.length" class="empty">No return requests</div>
      <div v-else class="list">
        <div
          v-for="request in filteredRequests"
          :key="request.id"
          class="list-item return-requests__item"
          :class="{ 'return-requests__item--active': selectedRequest && selectedRequest.id === request.id }"
          @click="selectRequest(request)"
        >
          <div class="return-requests__item-header">
            <span>{{ request.orderNumber }}</span>
            <span class="tag" :class="request.statusClass">{{ request.statusLabel }}</span>
          </div>
          <div class="return-requests__item-body">
            <span>Customer: {{ request.customerName }}</span>
            <span>Request Date: {{ formatDate(request.requestDate) }}</span>
          </div>
          <div class="return-requests__item-body">
            <span>Reason: {{ request.reason }}</span>
            <span>Amount: ${{ request.amount }}</span>
          </div>
        </div>
      </div>
    </section>

    <section v-if="selectedRequest" class="card">
      <h2 class="section-title">Return Request Details</h2>
      <div class="return-requests__detail">
        <div class="return-requests__detail-section">
          <h3>Request Information</h3>
          <div class="list">
            <div class="list-item">
              <span>Request ID:</span>
              <span>{{ selectedRequest.id }}</span>
            </div>
            <div class="list-item">
              <span>Order Number:</span>
              <span>{{ selectedRequest.orderNumber }}</span>
            </div>
            <div class="list-item">
              <span>Customer:</span>
              <span>{{ selectedRequest.customerName }}</span>
            </div>
            <div class="list-item">
              <span>Request Date:</span>
              <span>{{ formatDateTime(selectedRequest.requestDate) }}</span>
            </div>
            <div class="list-item">
              <span>Status:</span>
              <span class="tag" :class="selectedRequest.statusClass">{{ selectedRequest.statusLabel }}</span>
            </div>
            <div class="list-item">
              <span>Return Amount:</span>
              <span>${{ selectedRequest.amount }}</span>
            </div>
            <div class="list-item">
              <span>Reason:</span>
              <span>{{ selectedRequest.reason }}</span>
            </div>
            <div v-if="selectedRequest.description" class="list-item">
              <span>Description:</span>
              <span>{{ selectedRequest.description }}</span>
            </div>
          </div>
        </div>

        <div v-if="selectedRequest.items && selectedRequest.items.length > 0" class="return-requests__detail-section">
          <h3>Return Items</h3>
          <div class="list">
            <div v-for="(item, idx) in selectedRequest.items" :key="idx" class="list-item return-requests__product-item">
              <div class="return-requests__product-header">
                <span style="font-size: 24px; margin-right: 8px;">{{ getItemIcon(item.productName) }}</span>
                <span style="font-weight: 600;">{{ item.productName }}</span>
              </div>
              <div class="return-requests__product-body">
                <span v-if="item.color">Color: {{ item.color }}</span>
                <span v-if="item.size">Size: {{ item.size }}</span>
                <span>Quantity: {{ item.quantity }}</span>
                <span>Price: ${{ item.price }}</span>
                <span>Subtotal: ${{ (item.price * item.quantity).toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="selectedRequest.status === 'pending'" class="return-requests__actions">
          <button class="btn-primary" type="button" @click="approveRequest">Approve Return</button>
          <button class="btn-secondary" type="button" @click="rejectRequest">Reject Return</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { fetchOrders, approveAfterSales, rejectAfterSales } from '../services/orderService';

const filters = reactive({
  orderNumber: '',
  customerName: '',
  status: ''
});

const requests = ref([]);
const isLoading = ref(false);

const statusClassMap = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  processing: 'info',
  completed: 'success'
};

const loadRequests = async () => {
  isLoading.value = true;
  try {
    const orders = await fetchOrders();
    // Build requests from orders that have after-sales info
    requests.value = orders
      .filter(o => o.afterSales && o.afterSales.type && o.afterSales.reason)
      .map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        requestDate: o.afterSales.createdAt || o.updatedAt || o.createdAt,
        status: o.afterSales.status || 'pending',
        statusLabel: (o.afterSales.status || 'pending').charAt(0).toUpperCase() + (o.afterSales.status || 'pending').slice(1),
        statusClass: statusClassMap[o.afterSales.status || 'pending'] || 'default',
        reason: o.afterSales.reason,
        description: o.remark || '',
        amount: o.totalAmount,
        items: o.items || []
      }));
  } catch (error) {
    window.alert('Failed to load after-sales requests: ' + (error.message || 'Unknown error'));
  } finally {
    isLoading.value = false;
  }
};

const filteredRequests = computed(() => {
  return requests.value.filter((request) => {
    const matchOrderNumber = !filters.orderNumber || request.orderNumber.toLowerCase().includes(filters.orderNumber.toLowerCase());
    const matchCustomer = !filters.customerName || request.customerName.toLowerCase().includes(filters.customerName.toLowerCase());
    const matchStatus = !filters.status || request.status === filters.status;
    return matchOrderNumber && matchCustomer && matchStatus;
  });
});

const selectedRequest = ref(null);

const applyFilters = () => {
  // Filters are applied via computed property
  if (filteredRequests.value.length > 0 && !selectedRequest.value) {
    selectedRequest.value = filteredRequests.value[0];
  }
};

const selectRequest = (request) => {
  selectedRequest.value = request;
};

const approveRequest = async () => {
  if (!selectedRequest.value) return;
  if (!window.confirm('Are you sure you want to approve this after-sales request?')) {
    return;
  }
  try {
    await approveAfterSales(selectedRequest.value.id);
    window.alert('After-sales request approved');
    await loadRequests();
    applyFilters();
  } catch (error) {
    window.alert('Failed to approve request: ' + (error.message || 'Unknown error'));
  }
};

const rejectRequest = async () => {
  if (!selectedRequest.value) return;
  const reason = window.prompt('Please provide a reason for rejection:');
  if (!reason) return;
  try {
    await rejectAfterSales(selectedRequest.value.id, { reason });
    window.alert('After-sales request rejected');
    await loadRequests();
    applyFilters();
  } catch (error) {
    window.alert('Failed to reject request: ' + (error.message || 'Unknown error'));
  }
};

const formatDate = (value) => {
  if (!value) return '--';
  return new Date(value).toLocaleDateString('en-US');
};

const formatDateTime = (value) => {
  if (!value) return '--';
  return new Date(value).toLocaleString('en-US', { hour12: false });
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

onMounted(() => {
  loadRequests();
});
</script>

<style scoped>
.return-requests {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
}

.return-requests__filter-input {
  flex: 1;
  min-width: 220px;
}

.return-requests__filter-picker {
  min-width: 180px;
}

.return-requests__item {
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
}

.return-requests__item--active {
  border: 1px solid rgba(43, 181, 192, 0.4);
}

.return-requests__item-header,
.return-requests__item-body {
  display: flex;
  justify-content: space-between;
}

.return-requests__item-body {
  color: var(--color-text-muted);
  font-size: 14px;
}

.return-requests__detail {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.return-requests__detail-section h3 {
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 600;
}

.return-requests__product-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.return-requests__product-header {
  display: flex;
  align-items: center;
  font-size: 16px;
}

.return-requests__product-body {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 14px;
  color: var(--color-text-muted);
}

.return-requests__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.return-requests__actions .btn-primary,
.return-requests__actions .btn-secondary {
  flex: 1 1 160px;
}

@media (max-width: 960px) {
  .return-requests {
    grid-template-columns: 1fr;
  }
}
</style>

