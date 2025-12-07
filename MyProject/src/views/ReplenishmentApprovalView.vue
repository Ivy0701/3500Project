<template>
  <div class="approval">
    <!-- 1. Pending Replenishment Applications -->
    <section class="card approval__pending">
      <h2 class="section-title">Pending Replenishment Applications</h2>
      <div class="approval__table">
        <div class="approval__table-header">
          <span class="col col-wide">Application</span>
          <span class="col">Warehouse</span>
          <span class="col">Quantity</span>
          <span class="col">Status</span>
        </div>
        <div
          v-for="application in applications"
          :key="application.requestId"
          class="approval__table-row"
          :class="{ 'approval__table-row--active': selectedApplication?.requestId === application.requestId }"
          @click="selectApplication(application)"
        >
          <div class="col col-wide">
            <div class="approval__row-title">{{ application.requestId }}</div>
            <div class="approval__row-meta">{{ application.productName }} (SKU: {{ application.productId }}) · Trigger: {{ application.reason }}</div>
          </div>
          <span class="col">{{ application.warehouseName }}</span>
          <span class="col">{{ application.quantity }}</span>
          <span class="col">
            <span class="tag" :class="applicationStatusClass(application.status)">
              {{ applicationStatusLabel(application.status) }}
            </span>
          </span>
        </div>
        <p v-if="!applications.length" class="empty-hint">No pending applications</p>
      </div>
    </section>

    <!-- 2. Application Details -->
    <section class="card approval__details">
      <h2 class="section-title">Application Details</h2>
      <div v-if="selectedApplication" class="approval__detail">
        <div><strong>Product:</strong> {{ selectedApplication.productName }}</div>
        <div><strong>SKU:</strong> {{ selectedApplication.productId }}</div>
        <div><strong>Warehouse:</strong> {{ selectedApplication.warehouseName }}</div>
        <div><strong>Restock Quantity:</strong> {{ selectedApplication.quantity }}</div>
        <div><strong>Suggested Vendor:</strong> {{ selectedApplication.vendor }}</div>
        <div><strong>Expected Arrival:</strong> {{ new Date(selectedApplication.deliveryDate).toLocaleDateString() }}</div>
        <div><strong>Reason:</strong> {{ selectedApplication.reason || 'N/A' }}</div>
      </div>
      <p v-else class="empty-hint">Select an application to view details</p>
      
      <!-- Decision Section -->
      <div
        v-if="selectedApplication && ['PENDING', 'PROCESSING'].includes(selectedApplication.status)"
        class="approval__decision"
      >
        <label class="form-label">Decision</label>
        <div class="approval__decision-actions">
          <button class="btn-primary" type="button" @click="approve(true)">Approve</button>
          <button class="btn-secondary" type="button" @click="approve(false)">Reject</button>
        </div>
        <textarea
          v-model="decisionRemark"
          class="form-textarea"
          rows="3"
          placeholder="Approval remark"
        />
      </div>
    </section>

    <!-- 3. Recent Allocations -->
    <section class="card approval__allocations">
      <h2 class="section-title">Recent Allocations</h2>
      <div class="approval__table">
        <div class="approval__table-header">
          <span class="col col-wide">Transfer ID</span>
          <span class="col">From → To</span>
          <span class="col">Product</span>
          <span class="col">Status</span>
        </div>
        <div
          v-for="transfer in recentAllocations"
          :key="transfer.transferId"
          class="approval__table-row"
        >
          <div class="col col-wide">
            <div class="approval__row-title">{{ transfer.transferId }}</div>
            <div class="approval__row-meta">
              {{ transfer.productSku }} · {{ transfer.quantity }} units · 
              {{ new Date(transfer.createdAt).toLocaleString() }}
            </div>
          </div>
          <span class="col">
            <span v-if="transfer.fromLocationName === '-' && transfer.toLocationName === '-'">-</span>
            <span v-else>{{ transfer.fromLocationName }} → {{ transfer.toLocationName }}</span>
          </span>
          <span class="col">{{ transfer.productName }}</span>
          <span class="col">
            <span class="tag" :class="applicationStatusClass(transfer.requestStatus || transfer.status)">
              {{ applicationStatusLabel(transfer.requestStatus || transfer.status) }}
            </span>
          </span>
        </div>
        <p v-if="!recentAllocations.length" class="empty-hint">No recent allocations</p>
      </div>
    </section>

    <!-- 4. Approval Timeline -->
    <section class="card approval__timeline">
      <h2 class="section-title">Approval Timeline</h2>
      <div v-if="selectedApplication && timeline.length > 0" class="timeline">
        <div v-for="item in timeline" :key="item.id" class="timeline-item">
          <span class="timeline-dot" :class="`timeline-dot--${item.status}`" />
          <div class="timeline-content">
            <span class="timeline-title">{{ item.title }}</span>
            <span class="timeline-desc">{{ item.desc }}</span>
            <span class="timeline-time">{{ item.time }}</span>
          </div>
        </div>
      </div>
      <p v-else class="empty-hint">Select an application to view timeline</p>
    </section>

    <!-- 5. Allocate Commodities -->
    <section class="card approval__allocate">
      <h2 class="section-title">Allocate Commodities</h2>
      <div v-if="allocationFormVisible && selectedApplication && selectedApplication.status === 'APPROVED'">
        <form class="allocation__form" @submit.prevent="allocate">
          <div class="allocation__form-row">
            <div class="form-group">
              <label class="form-label" for="from">Transfer From *</label>
              <select id="from" v-model="transfer.from" class="form-input" required>
                <option value="">Select warehouse</option>
                <option value="Central Warehouse">Central Warehouse</option>
                <option value="East Warehouse">East Warehouse</option>
                <option value="West Warehouse">West Warehouse</option>
                <option value="North Warehouse">North Warehouse</option>
                <option value="South Warehouse">South Warehouse</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="to">Transfer To *</label>
              <select id="to" v-model="transfer.to" class="form-input" required>
                <option value="">Select warehouse</option>
                <option value="East Warehouse">East Warehouse</option>
                <option value="West Warehouse">West Warehouse</option>
                <option value="North Warehouse">North Warehouse</option>
                <option value="South Warehouse">South Warehouse</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="sku">Product SKU *</label>
            <input id="sku" v-model="transfer.sku" class="form-input" disabled />
          </div>
          <div class="form-group">
            <label class="form-label" for="qty">Quantity *</label>
            <input id="qty" v-model.number="transfer.quantity" class="form-input" type="number" min="1" disabled />
          </div>
          <div class="form-group">
            <label class="form-label" for="reason">Reason *</label>
            <textarea id="reason" v-model="transfer.reason" class="form-textarea" rows="3" required />
          </div>
          <button class="btn-primary" type="submit">Create Transfer Order</button>
        </form>
      </div>
      <p v-else class="empty-hint">Approve an application to allocate commodities</p>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import {
  fetchReplenishmentApplications,
  updateReplenishmentApplicationStatus
} from '../services/replenishmentService';
import { createTransferOrder, fetchTransfers } from '../services/transferService';

const statusMap = {
  PENDING: { label: 'Pending', class: 'warning' },
  PROCESSING: { label: 'Processing', class: 'info' },
  APPROVED: { label: 'Approved', class: 'success' },
  IN_TRANSIT: { label: 'In Transit', class: 'info' },
  ARRIVED: { label: 'Arrived', class: 'success' },
  REJECTED: { label: 'Rejected', class: 'danger' },
  COMPLETED: { label: 'Completed', class: 'success' }
};

// Recent Allocations 显示的是补货申请的状态，不是调拨单的状态
const applicationStatusForAllocation = (request) => {
  if (!request) return { label: 'Unknown', class: 'default' };
  // 如果有 requestId，说明这是补货申请关联的调拨单
  // 需要查找对应的补货申请状态
  return statusMap[request.status] || { label: request.status || 'Unknown', class: 'default' };
};

const transferStatusMap = {
  PENDING: { label: 'Pending', class: 'warning' },
  IN_TRANSIT: { label: 'In Transit', class: 'info' },
  COMPLETED: { label: 'Completed', class: 'success' },
  CANCELLED: { label: 'Cancelled', class: 'danger' }
};

const warehouseMap = {
  'Central Warehouse': 'WH-CENTRAL',
  'East Warehouse': 'WH-EAST',
  'West Warehouse': 'WH-WEST',
  'North Warehouse': 'WH-NORTH',
  'South Warehouse': 'WH-SOUTH'
};

const applications = ref([]);
const selectedApplication = ref(null);
const decisionRemark = ref('');
const allocationFormVisible = ref(false);
const loading = ref(false);
const recentAllocations = ref([]);

const transfer = reactive({
  from: 'Central Warehouse',
  to: '',
  sku: '',
  quantity: 0,
  reason: ''
});

const applicationStatusLabel = (status) => statusMap[status]?.label || status;
const applicationStatusClass = (status) => statusMap[status]?.class || 'default';
const transferStatusLabel = (status) => transferStatusMap[status]?.label || status;
const transferStatusClass = (status) => transferStatusMap[status]?.class || 'default';

const timeline = computed(() =>
  (selectedApplication.value?.progress || []).map((step, idx) => ({
    id: `${selectedApplication.value?.requestId || 'req'}-${idx}`,
    title: step.title,
    desc: step.desc,
    time: new Date(step.timestamp).toLocaleString(),
    status: step.status
  }))
);

const loadApplications = async () => {
  loading.value = true;
  try {
    const allApplications = await fetchReplenishmentApplications();
    
    // 去重：根据 requestId 去重，保留最新的记录
    const uniqueApplications = [];
    const seenRequestIds = new Set();
    for (const app of allApplications) {
      if (!seenRequestIds.has(app.requestId)) {
        seenRequestIds.add(app.requestId);
        uniqueApplications.push(app);
      }
    }
    
    // 待审批的申请：PENDING 和 PROCESSING 状态
    const pendingStatuses = ['PENDING', 'PROCESSING'];
    applications.value = uniqueApplications.filter((item) => pendingStatuses.includes(item.status));

    if (!selectedApplication.value) {
      selectedApplication.value = applications.value[0] || null;
    } else {
      const refreshed =
        allApplications.find((item) => item.requestId === selectedApplication.value.requestId) || null;
      selectedApplication.value = refreshed || applications.value[0] || null;
    }

    // 如果选中的申请状态是 APPROVED，显示分配表单
    allocationFormVisible.value = selectedApplication.value?.status === 'APPROVED';
    
    // 如果状态是 APPROVED，自动填充分配表单
    if (allocationFormVisible.value && selectedApplication.value) {
      transfer.from = 'Central Warehouse';
      transfer.to = selectedApplication.value.warehouseName || '';
      transfer.sku = selectedApplication.value.productId || '';
      transfer.quantity = selectedApplication.value.quantity || 0;
      transfer.reason = selectedApplication.value.reason || '';
    }
  } finally {
    loading.value = false;
  }
};

const loadRecentAllocations = async () => {
  try {
    // 加载所有补货申请（已批准或已创建调拨单的）
    const allApplications = await fetchReplenishmentApplications();
    
    // 加载所有调拨单
    const transfers = await fetchTransfers('WH-CENTRAL');
    
    // 创建一个 map，用于快速查找调拨单
    const transferMap = new Map();
    transfers.forEach(transfer => {
      if (transfer.requestId) {
        transferMap.set(transfer.requestId, transfer);
      }
    });
    
    // 组合显示：已批准但未创建调拨单的申请 + 已创建调拨单的申请
    const allocations = [];
    
    // 1. 添加已批准、已创建调拨单或已拒绝的补货申请
    const relevantApplications = allApplications.filter(app => 
      ['APPROVED', 'IN_TRANSIT', 'ARRIVED', 'COMPLETED', 'REJECTED'].includes(app.status)
    );
    
    relevantApplications.forEach(app => {
      const relatedTransfer = transferMap.get(app.requestId);
      
      if (relatedTransfer) {
        // 已创建调拨单：显示调拨单信息，From → To 为实际值
        allocations.push({
          transferId: relatedTransfer.transferId,
          requestId: app.requestId,
          productSku: app.productId,
          productName: app.productName,
          quantity: app.quantity,
          fromLocationName: relatedTransfer.fromLocationName,
          toLocationName: relatedTransfer.toLocationName,
          status: app.status, // 使用补货申请的状态
          createdAt: relatedTransfer.createdAt || app.updatedAt || app.createdAt
        });
      } else if (app.status === 'APPROVED' || app.status === 'REJECTED') {
        // 已批准但未创建调拨单，或已拒绝：显示补货申请信息，From → To 为 "-"
        allocations.push({
          transferId: app.requestId, // 使用 requestId 作为显示ID
          requestId: app.requestId,
          productSku: app.productId,
          productName: app.productName,
          quantity: app.quantity,
          fromLocationName: '-',
          toLocationName: app.status === 'REJECTED' ? '-' : app.warehouseName,
          status: app.status,
          createdAt: app.updatedAt || app.createdAt
        });
      }
    });
    
    // 按创建时间倒序排列
    recentAllocations.value = allocations
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20);
  } catch (error) {
    console.error('Failed to load recent allocations:', error);
  }
};

const selectApplication = (application) => {
  selectedApplication.value = application;
  
  if (application) {
    allocationFormVisible.value = application.status === 'APPROVED';
    
    // 如果状态是 APPROVED，自动填充分配表单
    if (allocationFormVisible.value) {
      transfer.from = 'Central Warehouse';
      transfer.to = application.warehouseName || '';
      transfer.sku = application.productId || '';
      transfer.quantity = application.quantity || 0;
      transfer.reason = application.reason || '';
    } else {
      // 如果不是 APPROVED 状态，清空表单
      transfer.from = 'Central Warehouse';
      transfer.to = '';
      transfer.sku = '';
      transfer.quantity = 0;
      transfer.reason = '';
    }
  } else {
    allocationFormVisible.value = false;
  }
};

const approve = async (approved) => {
  if (!selectedApplication.value) return;
  if (!approved && !decisionRemark.value.trim()) {
    window.alert('Please provide a rejection remark');
    return;
  }
  const decision = approved ? 'APPROVED' : 'REJECTED';
  const currentRequestId = selectedApplication.value.requestId;
  try {
    const updated = await updateReplenishmentApplicationStatus(currentRequestId, {
      decision,
      remark: decisionRemark.value
    });
    
    // 直接使用返回的 updated 数据，确保包含最新的 progress/timeline
    if (updated) {
      selectedApplication.value = updated;
    }
    
    // 重新加载申请列表和 Recent Allocations 以获取最新状态
    await loadApplications();
    await loadRecentAllocations();
    
    // 如果申请被拒绝，它可能不在 pending 列表中了，但我们需要保持选中状态以显示 timeline
    // 如果申请还在 pending 列表中，更新为最新的数据
    const allApplications = await fetchReplenishmentApplications();
    const refreshed = allApplications.find((item) => item.requestId === currentRequestId);
    
    if (refreshed) {
      // 如果找到了，使用最新的数据（包含完整的 progress）
      selectedApplication.value = refreshed;
    } else if (updated) {
      // 如果不在列表中（比如被拒绝了），保持使用返回的 updated 数据
      selectedApplication.value = updated;
    }
    
    // 根据状态设置 allocationFormVisible
    if (approved && selectedApplication.value?.status === 'APPROVED') {
      allocationFormVisible.value = true;
      // 自动填充分配表单
      transfer.from = 'Central Warehouse';
      transfer.to = selectedApplication.value.warehouseName || '';
      transfer.sku = selectedApplication.value.productId || '';
      transfer.quantity = selectedApplication.value.quantity || 0;
      transfer.reason = selectedApplication.value.reason || '';
    } else {
      allocationFormVisible.value = false;
      // 清空表单
      transfer.from = 'Central Warehouse';
      transfer.to = '';
      transfer.sku = '';
      transfer.quantity = 0;
      transfer.reason = '';
    }
    
    if (approved) {
      window.alert('Application approved. Please allocate commodities.');
    } else {
      window.alert('Application rejected. The replenishment alert has been restored in the regional warehouse manager\'s alerts.');
    }
  } catch (error) {
    window.alert(error.message || 'Operation failed');
  } finally {
    decisionRemark.value = '';
  }
};

const allocate = async () => {
  if (!selectedApplication.value) return;
  if (!transfer.from || !transfer.to || !transfer.sku || !transfer.quantity || !transfer.reason) {
    window.alert('Please fill in all allocation fields');
    return;
  }
  if (transfer.from === transfer.to) {
    window.alert('Source and destination cannot be the same');
    return;
  }
  try {
    await createTransferOrder({
      productSku: transfer.sku || selectedApplication.value.productId,
      productName: selectedApplication.value.productName,
      quantity: Number(transfer.quantity),
      fromLocationId: warehouseMap[transfer.from],
      fromLocationName: transfer.from,
      toLocationId: warehouseMap[transfer.to],
      toLocationName: transfer.to,
      requestId: selectedApplication.value.requestId
    });
    // 重新加载应用和调拨单列表
    await loadApplications();
    await loadRecentAllocations();
    window.alert('Transfer order created and dispatched');
  } catch (error) {
    window.alert(error.message || 'Failed to create transfer');
  }
};

onMounted(async () => {
  await loadApplications();
  await loadRecentAllocations();
  // 定期刷新申请列表和调拨单列表
  setInterval(() => {
    loadApplications();
    loadRecentAllocations();
  }, 5000); // 每5秒刷新一次
});
</script>

<style scoped>
.approval {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto auto;
  gap: 24px;
}

/* 第一行：Pending Applications, Application Details, Approval Timeline */
.approval__pending {
  grid-column: 1;
  grid-row: 1;
}

.approval__details {
  grid-column: 2;
  grid-row: 1;
}

.approval__timeline {
  grid-column: 3;
  grid-row: 1;
}

/* 第二行：Recent Allocations 和 Allocate Commodities */
.approval__allocations {
  grid-column: 1 / 3;
  grid-row: 2;
}

.approval__allocate {
  grid-column: 3;
  grid-row: 2;
}

/* 如果 Allocate Commodities 不显示，Timeline 占据整行 */
.approval__timeline:only-child {
  grid-column: 1 / 4;
}

@media (max-width: 1400px) {
  .approval {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
  
  .approval__pending,
  .approval__details,
  .approval__allocations,
  .approval__timeline,
  .approval__allocate {
    grid-column: 1;
    grid-row: auto;
  }
}

.approval__table {
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.approval__table-header,
.approval__table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 12px;
  padding: 16px 20px;
  align-items: center;
}

.approval__table-header {
  background-color: var(--color-surface-alt);
  font-weight: 600;
  color: var(--color-text-muted);
}

.approval__table-row {
  border-top: 1px solid var(--color-border);
  cursor: pointer;
}

.approval__table-row--active {
  background-color: rgba(43, 181, 192, 0.12);
}

.approval__row-title {
  font-weight: 600;
}

.approval__row-meta {
  margin-top: 4px;
  font-size: 13px;
  color: #9ca3af;
}

.approval__detail {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
  background: var(--color-background);
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 12px;
}

.approval__decision {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.approval__decision-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.allocation__form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.allocation__form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
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
  background-color: var(--color-border);
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
  font-size: 14px;
  color: var(--color-text);
}

.timeline-desc {
  font-size: 13px;
  color: var(--color-text-muted);
}

.timeline-time {
  font-size: 12px;
  color: var(--color-text-muted);
}

.timeline-dot--completed {
  background-color: var(--color-success);
}

.timeline-dot--processing {
  background-color: var(--color-brand);
}

.empty-hint {
  padding: 20px;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 14px;
}
</style>
