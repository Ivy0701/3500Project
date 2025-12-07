<template>
  <div class="receiving">
    <section class="card">
      <h2 class="section-title">Inbound Schedules</h2>
      <div class="list" v-if="!loading">
        <div
          v-for="record in formattedPlans"
          :key="record.planNo"
          class="list-item receiving__plan"
          :class="{ 'receiving__plan--active': selectedPlan?.planNo === record.planNo }"
          @click="selectPlan(record)"
        >
          <div class="receiving__plan-header">
            <span>{{ record.planNo }}</span>
            <span class="tag" :class="record.statusClass">{{ record.statusLabel }}</span>
          </div>
          <div class="receiving__plan-body">
            <span>Supplier: {{ record.supplier }}</span>
            <span>Expected Arrival: {{ record.etaText }}</span>
          </div>
          <div class="receiving__plan-meta">
            <span>SKU: {{ record.productSku || 'N/A' }}</span>
            <span>Quantity: {{ record.quantity || record.items }}</span>
          </div>
          <div class="receiving__plan-meta">
            <span>Dock: {{ record.dock }}</span>
            <span>Items: {{ record.items }} SKU</span>
          </div>
        </div>
        <p v-if="!formattedPlans.length" class="empty-hint">No inbound schedules</p>
      </div>
    </section>

    <section class="card">
      <h2 class="section-title">Receiving Checklist</h2>
      <div v-if="selectedPlan && selectedPlan.status !== 'ARRIVED'" class="receiving__summary">
        <div><strong>Plan:</strong> {{ selectedPlan.planNo }}</div>
        <div><strong>Supplier:</strong> {{ selectedPlan.supplier }}</div>
        <div><strong>Product SKU:</strong> {{ selectedPlan.productSku || 'N/A' }}</div>
        <div><strong>Quality Level:</strong> {{ selectedPlan.qualityLevel }}</div>
      </div>
      <form v-if="selectedPlan && selectedPlan.status !== 'ARRIVED'" class="receiving__form" @submit.prevent="completeReceiving">
        <div class="form-group">
          <label class="form-label" for="received">Received Quantity</label>
          <input id="received" v-model.number="receivingRecord.received" class="form-input" type="number" min="0" />
        </div>
        <div class="form-group">
          <label class="form-label" for="storage">Storage Location</label>
          <select id="storage" v-model="receivingRecord.storage" class="filter-pill">
            <option value="">Select location</option>
            <option v-for="option in storageOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="remark">Remark</label>
          <textarea id="remark" v-model="receivingRecord.remark" class="form-textarea" rows="3" />
        </div>
        <button class="btn-primary" type="submit">Complete Receiving</button>
      </form>
    </section>

    <section class="card">
      <h2 class="section-title">Recent Receiving Logs</h2>
      <div class="timeline">
        <div v-for="log in formattedLogs" :key="log._id || log.id" class="timeline-item">
          <span class="timeline-dot" :class="`timeline-dot--${log.status}`" />
          <div class="timeline-content">
            <span class="timeline-title">{{ log.title }}</span>
            <span class="timeline-desc">{{ log.desc }}</span>
            <span class="timeline-time">{{ log.time }}</span>
          </div>
        </div>
        <p v-if="!formattedLogs.length" class="empty-hint">No receiving logs yet</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { useInventoryStore } from '../store/inventoryStore';
import {
  fetchReceivingSchedules,
  fetchReceivingLogs,
  completeReceiving as completeReceivingApi
} from '../services/receivingService';

const inventoryStore = useInventoryStore();

const inboundPlans = ref([]);
const logs = ref([]);
const loading = ref(false);

const selectedPlan = ref(null);

const receivingRecord = reactive({
  received: 0,
  storage: '',
  remark: ''
});

const storageOptions = [
  { label: 'East Warehouse', value: 'WH-EAST' },
  { label: 'West Warehouse', value: 'WH-WEST' },
  { label: 'North Warehouse', value: 'WH-NORTH' },
  { label: 'South Warehouse', value: 'WH-SOUTH' },
  { label: 'East Store 1', value: 'STORE-EAST-01' },
  { label: 'East Store 2', value: 'STORE-EAST-02' },
  { label: 'West Store 1', value: 'STORE-WEST-01' },
  { label: 'West Store 2', value: 'STORE-WEST-02' },
  { label: 'South Store 1', value: 'STORE-SOUTH-01' },
  { label: 'South Store 2', value: 'STORE-SOUTH-02' },
  { label: 'North Store 1', value: 'STORE-NORTH-01' },
  { label: 'North Store 2', value: 'STORE-NORTH-02' }
];

const statusLabelMap = {
  PENDING: 'Pending',
  IN_TRANSIT: 'In Transit',
  ARRIVED: 'Arrived'
};

const statusClassMap = {
  PENDING: 'warning',
  IN_TRANSIT: 'warning', // 改为黄色
  ARRIVED: 'success'
};

const formatStatusLabel = (status) => statusLabelMap[status] || status;
const formatStatusClass = (status) => statusClassMap[status] || 'default';

const formattedPlans = computed(() =>
  inboundPlans.value.map((plan) => ({
    ...plan,
    statusLabel: formatStatusLabel(plan.status),
    statusClass: formatStatusClass(plan.status),
    etaText: new Date(plan.eta).toLocaleString(),
    productSku: plan.productSku || 'N/A'
  }))
);

const formattedLogs = computed(() =>
  logs.value.map((log) => ({
    ...log,
    title: `${log.planNo} ${log.status === 'warning' ? 'Exception' : 'Completed'}`,
    desc: `SKU: ${log.productSku || 'N/A'} · ${log.received} received @ ${log.storageLocationId}${
      log.issue ? ` (${log.issue})` : ''
    }`,
    time: new Date(log.timestamp).toLocaleString()
  }))
);

const selectPlan = (plan) => {
  selectedPlan.value = plan;
  if (plan && plan.status !== 'ARRIVED') {
    receivingRecord.received = plan.quantity || 0;
    receivingRecord.storage = plan.storageLocationId || '';
  } else {
    receivingRecord.received = 0;
    receivingRecord.storage = '';
  }
};

const loadReceivingData = async () => {
  loading.value = true;
  try {
    const [scheduleData, logData] = await Promise.all([fetchReceivingSchedules(), fetchReceivingLogs()]);
    inboundPlans.value = scheduleData;
    logs.value = logData;
    if (!selectedPlan.value && scheduleData.length > 0) {
      selectedPlan.value = scheduleData[0] || null;
      if (selectedPlan.value) {
        selectPlan(selectedPlan.value);
      }
    } else if (selectedPlan.value) {
      // 更新已选中的计划
      const updated = scheduleData.find(p => p.planNo === selectedPlan.value.planNo);
      if (updated) {
        selectedPlan.value = updated;
        selectPlan(updated);
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const completeReceiving = async () => {
  if (!selectedPlan.value) {
    window.alert('Please select an inbound plan');
    return;
  }
  if (!receivingRecord.received || !receivingRecord.storage) {
    window.alert('Please fill in received quantity and storage location');
    return;
  }

  try {
    await completeReceivingApi(selectedPlan.value.planNo, {
      received: receivingRecord.received,
      storageLocationId: receivingRecord.storage,
      remark: receivingRecord.remark
    });

    inventoryStore.addReceivingUpdate({
      planNo: selectedPlan.value.planNo,
      supplier: selectedPlan.value.supplier,
      received: receivingRecord.received,
      qualified: receivingRecord.received,
      storage: receivingRecord.storage,
      timestamp: new Date().toISOString()
    });

    await loadReceivingData();

    Object.assign(receivingRecord, {
      received: 0,
      storage: '',
      remark: ''
    });

    window.alert('Receiving completed successfully');
  } catch (error) {
    window.alert(error.message || 'Failed to complete receiving');
  }
};

onMounted(() => {
  loadReceivingData();
});
</script>

<style scoped>
.receiving {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
}

.receiving__plan {
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
}

.receiving__plan--active {
  border: 1px solid rgba(43, 181, 192, 0.4);
}

.receiving__plan-header,
.receiving__plan-body,
.receiving__plan-meta {
  display: flex;
  justify-content: space-between;
}

.receiving__plan-meta {
  color: #9ca3af;
  font-size: 13px;
}

.receiving__summary {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: var(--color-background);
  border-radius: 12px;
  margin-bottom: 12px;
}

.receiving__form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.receiving__form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.timeline-dot--success {
  background-color: var(--color-success);
}

.timeline-dot--warning {
  background-color: var(--color-warning);
}

.empty-hint {
  margin: 0;
  padding: 12px 0;
  color: var(--color-text-muted);
  font-size: 14px;
  text-align: center;
}

@media (max-width: 960px) {
  .receiving {
    grid-template-columns: 1fr;
  }
}
</style>


