<template>
  <div class="dispatch">
    <section class="card">
      <h2 class="section-title">{{ $t('dispatch.pendingTitle') }}</h2>
      <div class="list">
        <div
          v-for="order in pendingShipments"
          :key="order.transferId"
          class="list-item dispatch__order"
          :class="{ 'dispatch__order--active': selectedShipment?.transferId === order.transferId }"
          @click="selectShipment(order)"
        >
          <div class="dispatch__order-header">
            <span>{{ order.transferId }}</span>
            <span class="tag" :class="formatStatusClass(order.status)">{{ formatStatusLabel(order.status) }}</span>
          </div>
          <div class="dispatch__order-body">
            <span>SKU: {{ order.productSku }}</span>
            <span>Destination: {{ order.toLocationName }}</span>
            <span>Items: {{ order.quantity }} SKU</span>
          </div>
          <div class="dispatch__order-meta">
            <span>Planned Departure: {{ order.dispatchInfo?.departure || 'Not set' }}</span>
            <span>Carrier: {{ order.dispatchInfo?.carrier || '--' }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="card">
      <h2 class="section-title">{{ $t('dispatch.arrangementTitle') }}</h2>
      <div v-if="selectedShipment" class="dispatch__summary">
        <div><strong>Order:</strong> {{ selectedShipment.transferId }}</div>
        <div><strong>Destination:</strong> {{ selectedShipment.toLocationName }}</div>
        <div><strong>Status:</strong> {{ formatStatusLabel(selectedShipment.status) }}</div>
      </div>
      <form class="dispatch__form" @submit.prevent="confirmDispatch" novalidate>
        <div class="form-group">
          <label class="form-label" for="productSku">Product SKU *</label>
          <input
            id="productSku"
            v-model="dispatchPlan.productSku"
            class="form-input"
            placeholder="PROD-001"
            title="Please enter Product SKU"
          />
        </div>
        <div class="form-group">
          <label class="form-label" for="transferFrom">Transfer From *</label>
          <select id="transferFrom" v-model="dispatchPlan.transferFrom" class="filter-pill" title="Please select a warehouse">
            <option value="">Select warehouse</option>
            <option v-for="warehouse in warehouses" :key="warehouse" :value="warehouse">
              {{ warehouse }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="transferTo">Transfer To *</label>
          <select id="transferTo" v-model="dispatchPlan.transferTo" class="filter-pill" title="Please select a store">
            <option value="">Select store</option>
            <option v-for="store in stores" :key="store" :value="store">
              {{ store }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="dispatchQuantity">Dispatch Quantity *</label>
          <input
            id="dispatchQuantity"
            v-model.number="dispatchPlan.dispatchQuantity"
            class="form-input"
            type="number"
            min="1"
            placeholder="Enter quantity"
            title="Please enter dispatch quantity (must be greater than 0)"
          />
        </div>
        <div class="form-group">
          <label class="form-label" for="carrier">Carrier *</label>
          <select id="carrier" v-model="dispatchPlan.carrier" class="filter-pill" title="Please select a carrier">
            <option value="">Select carrier</option>
            <option v-for="carrier in carriers" :key="carrier" :value="carrier">
              {{ carrier }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="departure">Departure Time *</label>
          <input id="departure" v-model="dispatchPlan.departure" class="form-input" type="datetime-local" title="Please select departure time" />
        </div>
        <div class="form-group">
          <label class="form-label" for="remark">Remark</label>
          <textarea
            id="remark"
            v-model="dispatchPlan.remark"
            class="form-textarea"
            rows="3"
            placeholder="Handling notes"
          />
        </div>
        <button class="btn-primary" type="submit">{{ $t('dispatch.confirmDispatch') }}</button>
      </form>
    </section>

    <section class="card">
      <h2 class="section-title">{{ $t('dispatch.historyTitle') }}</h2>
      <div class="timeline">
        <div v-for="record in history" :key="record.id" class="timeline-item">
          <span class="timeline-dot" />
          <div class="timeline-content">
            <span class="timeline-title">{{ record.title }}</span>
            <span class="timeline-desc">{{ record.desc }}</span>
            <span class="timeline-time">{{ record.time }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { useInventoryStore } from '../store/inventoryStore';
import { useAppStore } from '../store/appStore';
import { fetchTransfers, dispatchTransfer } from '../services/transferService';

const inventoryStore = useInventoryStore();
const appStore = useAppStore();

const carriers = ['Sunshine Logistics', 'East Freight', 'Atlas Transport'];

const warehouseLocationMap = {
  'West Warehouse': 'WH-WEST',
  'East Warehouse': 'WH-EAST',
  'North Warehouse': 'WH-NORTH',
  'South Warehouse': 'WH-SOUTH'
};

const storeLocationMap = {
  'West Store 1': 'STORE-WEST-01',
  'West Store 2': 'STORE-WEST-02',
  'East Store 1': 'STORE-EAST-01',
  'East Store 2': 'STORE-EAST-02',
  'North Store 1': 'STORE-NORTH-01',
  'North Store 2': 'STORE-NORTH-02',
  'South Store 1': 'STORE-SOUTH-01',
  'South Store 2': 'STORE-SOUTH-02',
  'East Warehouse': 'WH-EAST',
  'West Warehouse': 'WH-WEST',
  'North Warehouse': 'WH-NORTH',
  'South Warehouse': 'WH-SOUTH'
};

const warehouses = Object.keys(warehouseLocationMap);
const stores = Object.keys(storeLocationMap);

const transfers = ref([]);
const loading = ref(false);

const statusLabelMap = {
  PENDING: 'Pending',
  IN_TRANSIT: 'In Transit',
  COMPLETED: 'Completed'
};

const statusClassMap = {
  PENDING: 'warning',
  IN_TRANSIT: 'info',
  COMPLETED: 'success'
};

const formatStatusLabel = (status) => statusLabelMap[status] || status;
const formatStatusClass = (status) => statusClassMap[status] || 'default';

const pendingShipments = computed(() => transfers.value.filter((item) => item.status === 'PENDING'));
const selectedShipment = ref(null);

const dispatchPlan = reactive({
  productSku: '',
  transferFrom: '',
  transferTo: '',
  dispatchQuantity: null,
  carrier: '',
  departure: '',
  remark: ''
});

const history = computed(() => {
  return transfers.value
    .flatMap((transfer) =>
      (transfer.history || []).map((entry) => ({
        id: `${transfer.transferId}-${entry.createdAt}`,
        title: `${transfer.transferId} ${entry.status}`,
        desc: entry.note || `${transfer.productSku} ${transfer.quantity} units`,
        time: new Date(entry.createdAt || entry.timestamp).toLocaleString(),
        createdAt: entry.createdAt || entry.timestamp
      }))
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);
});

const selectShipment = (order) => {
  selectedShipment.value = order;
  dispatchPlan.productSku = order.productSku;
  dispatchPlan.transferFrom =
    Object.keys(warehouseLocationMap).find((key) => warehouseLocationMap[key] === order.fromLocationId) ||
    order.fromLocationName ||
    '';
  dispatchPlan.transferTo =
    Object.keys(storeLocationMap).find((key) => storeLocationMap[key] === order.toLocationId) ||
    order.toLocationName ||
    '';
  dispatchPlan.dispatchQuantity = order.quantity;
  dispatchPlan.carrier = '';
  dispatchPlan.departure = '';
  dispatchPlan.remark = '';
};

const loadTransfers = async () => {
  loading.value = true;
  try {
    const locationId = appStore.user.assignedLocationId || 'WH-EAST';
    transfers.value = await fetchTransfers(locationId);
    selectedShipment.value = pendingShipments.value[0] || null;
    if (selectedShipment.value) {
      selectShipment(selectedShipment.value);
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const confirmDispatch = async () => {
  if (!selectedShipment.value) {
    window.alert('Please select a shipment order');
    return;
  }

  // Validate required fields with specific error messages
  if (!dispatchPlan.productSku) {
    window.alert('Please enter Product SKU');
    document.getElementById('productSku')?.focus();
    return;
  }

  if (!dispatchPlan.transferFrom) {
    window.alert('Please select a warehouse');
    document.getElementById('transferFrom')?.focus();
    return;
  }

  if (!dispatchPlan.transferTo) {
    window.alert('Please select a store');
    document.getElementById('transferTo')?.focus();
    return;
  }

  if (!dispatchPlan.dispatchQuantity || dispatchPlan.dispatchQuantity <= 0) {
    window.alert('Please enter a valid dispatch quantity (must be greater than 0)');
    document.getElementById('dispatchQuantity')?.focus();
    return;
  }

  if (!dispatchPlan.carrier) {
    window.alert('Please select a carrier');
    document.getElementById('carrier')?.focus();
    return;
  }

  if (!dispatchPlan.departure) {
    window.alert('Please select departure time');
    document.getElementById('departure')?.focus();
    return;
  }

  try {
    await dispatchTransfer(selectedShipment.value.transferId, {
      carrier: dispatchPlan.carrier,
      departure: dispatchPlan.departure,
      remark: dispatchPlan.remark
    });
  inventoryStore.addDispatchUpdate({
      transferFrom: selectedShipment.value.fromLocationId,
      transferTo: selectedShipment.value.toLocationId,
    quantity: dispatchPlan.dispatchQuantity,
      orderNo: selectedShipment.value.transferId,
      timestamp: new Date().toISOString()
  });
    await loadTransfers();
    window.alert('Dispatch completed successfully');
  } catch (error) {
    window.alert(error.message || 'Failed to dispatch order');
  }
};

onMounted(() => {
  loadTransfers();
});
</script>

<style scoped>
.dispatch {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
}

.dispatch__order {
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
}

.dispatch__order--active {
  border: 1px solid rgba(43, 181, 192, 0.4);
}

.dispatch__order-header,
.dispatch__order-body,
.dispatch__order-meta {
  display: flex;
  justify-content: space-between;
}

.dispatch__order-meta {
  color: #9ca3af;
  font-size: 13px;
}

.dispatch__summary {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  border-radius: 12px;
  background: var(--color-background);
  margin-bottom: 12px;
}

.dispatch__form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (max-width: 960px) {
  .dispatch {
    grid-template-columns: 1fr;
  }
}
</style>


