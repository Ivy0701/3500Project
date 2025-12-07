<template>
  <div class="replenishment">
    <section class="card">
      <h2 class="section-title">Inventory Replenishment Alerts</h2>
      <div class="list" v-if="!loading">
        <div
          v-for="reminder in alerts"
          :key="reminder.alertId"
          class="list-item replenishment__alert-card"
          :class="{ 'replenishment__reminder--active': selectedAlertId === reminder.alertId }"
          @click="selectReminder(reminder)"
        >
          <div class="replenishment__alert-main">
            <div class="replenishment__alert-left">
              <div class="replenishment__alert-title">
                <span class="replenishment__alert-icon">{{ reminder.icon || '📦' }}</span>
                <div class="replenishment__alert-title-text">
                  <span class="replenishment__alert-name">{{ reminder.productName }}</span>
                  <span class="replenishment__alert-sku">SKU: {{ reminder.productId }}</span>
                </div>
              </div>
              <div class="replenishment__alert-info">
                <span>Current Stock: {{ reminder.stock }}</span>
                <span>Location: {{ reminder.warehouseName }}</span>
              </div>
            </div>
            <div class="replenishment__alert-right">
              <span class="tag" :class="reminder.level">{{ reminder.levelLabel }}</span>
              <span class="replenishment__alert-suggest">
                Suggested Restock: {{ reminder.suggested }}
              </span>
            </div>
          </div>
          <div class="replenishment__reminder-meta">
            <span>Trigger Reason: {{ reminder.trigger }}</span>
          </div>
          <div v-if="reminder.threshold" class="replenishment__reminder-meta" style="margin-top: 4px;">
            <span>Safety Threshold: {{ reminder.threshold }}</span>
          </div>
        </div>
        <p v-if="!alerts.length" class="empty-hint">No alerts</p>
      </div>
    </section>


    <section class="card">
      <h2 class="section-title">Replenishment Application</h2>
      <form class="replenishment__form" @submit.prevent="submitApplication">
        <div class="form-group">
          <label class="form-label" for="product">Product</label>
          <input id="product" class="form-input" :value="application.product" placeholder="Please select product" disabled />
        </div>
        <div class="form-group">
          <label class="form-label" for="vendor">Vendor</label>
          <input id="vendor" class="form-input" value="Central Warehouse" disabled />
          <small style="color: var(--color-text-muted); font-size: 12px; margin-top: 4px; display: block;">
            Regional warehouses can only request replenishment from Central Warehouse
          </small>
        </div>
        <div class="replenishment__form-row">
          <div class="form-group">
            <label class="form-label" for="quantity">Restock Quantity</label>
            <input
              id="quantity"
              v-model="application.quantity"
              class="form-input"
              type="number"
              min="0"
              placeholder="0"
            />
          </div>
          <div class="form-group">
            <label class="form-label" for="delivery">Expected Delivery</label>
            <input
              id="delivery"
              v-model="application.deliveryDate"
              class="form-input"
              type="date"
            />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="remark">Remark</label>
          <textarea
            id="remark"
            v-model="application.remark"
            class="form-textarea"
            rows="3"
            placeholder="Replenishment notes and precautions"
          />
        </div>
        <button class="btn-primary" type="submit">Submit Replenishment Application</button>
      </form>
    </section>

    <section class="card">
      <h2 class="section-title">Processing Progress Tracking</h2>
      <div class="timeline replenishment__timeline">
        <div v-for="item in progress" :key="`${item.requestId}-${item.title}-${item.time}`" class="timeline-item">
          <span class="timeline-dot" :class="`timeline-dot--${item.status}`" />
          <div class="timeline-content">
            <span class="timeline-title">{{ item.title }}</span>
            <span class="timeline-desc">{{ item.desc }}</span>
            <span class="timeline-time">{{ new Date(item.time).toLocaleString() }}</span>
          </div>
        </div>
        <p v-if="!progress.length" class="empty-hint">No progress records</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { useAppStore } from '../store/appStore';
import { fetchReplenishmentAlerts, fetchReplenishmentProgress, submitReplenishmentApplication } from '../services/replenishmentService';

const appStore = useAppStore();

const alerts = ref([]);
const progress = ref([]);
const loading = ref(false);

// 供应商改为服装行业（英文）
const vendors = ['Fashion Apparel Manufacturing', 'Premium Garment Supply Chain', 'Trend Clothing Supplier'];

const selectedAlertId = ref(null);
const selectedAlert = ref(null);

const application = reactive({
  productId: '',
  product: '',
  vendor: '',
  quantity: '',
  deliveryDate: '',
  remark: ''
});

const loadReplenishmentData = async () => {
  loading.value = true;
  try {
    const [alertData, progressData] = await Promise.all([
      fetchReplenishmentAlerts(),
      fetchReplenishmentProgress()
    ]);
    // 只显示仓库的缺货预警（WH-EAST / WH-WEST / WH-NORTH / WH-SOUTH）
    const warehouseIds = ['WH-EAST', 'WH-WEST', 'WH-NORTH', 'WH-SOUTH'];
    alerts.value = alertData.filter((item) => warehouseIds.includes(item.warehouseId));
    progress.value = progressData;
    if (alerts.value.length > 0) {
      selectReminder(alerts.value[0]);
    } else {
      selectedAlertId.value = null;
      selectedAlert.value = null;
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const selectReminder = (reminder) => {
  selectedAlertId.value = reminder.alertId;
  selectedAlert.value = reminder;
  application.product = reminder.productName;
  application.productId = reminder.productId;
  application.quantity = reminder.suggested;
  application.vendor = 'Central Warehouse'; // 区域仓库只能向总仓库申请补货
  application.remark = reminder.trigger;
};

const submitApplication = async () => {
  if (!application.productId || !application.vendor || !application.quantity || !application.deliveryDate) {
    window.alert('Please complete application information');
    return;
  }

  try {
    // 区域仓库提交补货申请时，vendor 必须为 'Central Warehouse'
    // 因为区域仓库只能向总仓库申请补货
    const vendor = 'Central Warehouse';
    
    const { alerts: updatedAlerts, progress: updatedProgress } = await submitReplenishmentApplication({
      alertId: selectedAlertId.value,
      productId: application.productId,
      productName: application.product,
      vendor: vendor,
      quantity: Number(application.quantity),
      deliveryDate: application.deliveryDate,
      remark: application.remark,
      warehouseId: selectedAlert.value?.warehouseId || appStore.user.assignedLocationId || 'WH-EAST',
      warehouseName: selectedAlert.value?.warehouseName || 'Regional Warehouse',
      reason: application.remark || selectedAlert.value?.trigger
    });

    // 后端已经根据用户角色过滤了数据，但为了安全起见，前端也进行过滤
    // 只显示区域仓库的缺货预警（WH-EAST / WH-WEST / WH-NORTH / WH-SOUTH）
    const warehouseIds = ['WH-EAST', 'WH-WEST', 'WH-NORTH', 'WH-SOUTH'];
    alerts.value = updatedAlerts.filter((item) => warehouseIds.includes(item.warehouseId));
    progress.value = updatedProgress;

    Object.assign(application, {
      productId: '',
      product: '',
      vendor: '',
      quantity: '',
      deliveryDate: '',
      remark: ''
    });
    selectedAlertId.value = null;
    selectedAlert.value = null;

    window.alert('Replenishment application submitted successfully');
  } catch (error) {
    window.alert(error.message || 'Failed to submit application');
  }
};

onMounted(() => {
  loadReplenishmentData();
});
</script>

<style scoped>
.replenishment {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
}

.replenishment__reminder {
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
}

.replenishment__reminder--active {
  border: 1px solid rgba(43, 181, 192, 0.4);
}

.replenishment__reminder-header,
.replenishment__reminder-body,
.replenishment__reminder-meta {
  display: flex;
  justify-content: space-between;
}

.replenishment__reminder-meta {
  color: #9ca3af;
  font-size: 13px;
}

.replenishment__form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.replenishment__form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.replenishment__timeline .timeline-dot {
  background-color: var(--color-border);
}

.timeline-dot--completed {
  background-color: var(--color-success);
}

.timeline-dot--processing {
  background-color: var(--color-brand);
}

.timeline-dot--pending {
  background-color: var(--color-border);
}

.empty-hint {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 14px;
  text-align: center;
}

@media (max-width: 960px) {
  .replenishment {
    grid-template-columns: 1fr;
  }
}
</style>

