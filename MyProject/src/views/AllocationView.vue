<template>
  <div class="allocation">
    <section class="card">
      <h2 class="section-title">Regional Inventory Snapshot</h2>
      <div class="allocation__regions">
        <div v-for="region in regions" :key="region.name" class="allocation__region-card">
          <div class="allocation__region-header">
            <h3>{{ region.name }}</h3>
            <span class="tag">{{ region.stock }} units</span>
          </div>
          <div class="allocation__region-body">
            <span>Low Stock SKUs: {{ region.lowStock }}</span>
            <span>In Transit: {{ region.inTransit }}</span>
          </div>
          <div class="allocation__region-meta">
            <span>Top Shortage: {{ region.shortage }}</span>
            <span>Top Overstock: {{ region.overstock }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="card">
      <h2 class="section-title">Allocate Commodities Between Regions</h2>
      <form class="allocation__form" @submit.prevent="allocate">
        <div class="allocation__form-row">
          <div class="form-group">
            <label class="form-label" for="from">Transfer From</label>
            <select id="from" v-model="transfer.from" class="filter-pill">
              <option value="">Select region</option>
              <option v-for="region in regions" :key="`from-${region.name}`" :value="region.name">
                {{ region.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="to">Transfer To</label>
            <select id="to" v-model="transfer.to" class="filter-pill">
              <option value="">Select region</option>
              <option v-for="region in regions" :key="`to-${region.name}`" :value="region.name">
                {{ region.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="sku">Product SKU</label>
          <select id="sku" v-model="transfer.sku" class="filter-pill">
            <option value="">Select product</option>
            <option v-for="item in skuOptions" :key="item.sku" :value="item.sku">
              {{ item.sku }} - {{ item.name }}
            </option>
          </select>
        </div>
        <div class="allocation__form-row">
          <div class="form-group">
            <label class="form-label" for="qty">Quantity</label>
            <input id="qty" v-model.number="transfer.quantity" class="form-input" type="number" min="0" />
          </div>
          <div class="form-group">
            <label class="form-label" for="eta">ETA</label>
            <input id="eta" v-model="transfer.eta" class="form-input" type="date" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="reason">Reason</label>
          <textarea id="reason" v-model="transfer.reason" class="form-textarea" rows="3" />
        </div>
        <button class="btn-primary" type="submit">Create Transfer Order</button>
      </form>
    </section>

    <section class="card">
      <h2 class="section-title">Recent Allocations</h2>
      <div class="allocation__history">
        <div v-for="record in history" :key="record.id" class="allocation__history-item">
          <div class="allocation__history-header">
            <span>{{ record.id }}</span>
            <span class="tag" :class="record.statusClass">{{ record.status }}</span>
          </div>
          <div class="allocation__history-body">
            <span>{{ record.from }} → {{ record.to }}</span>
            <span>{{ record.sku }} · {{ record.quantity }} units</span>
          </div>
          <div class="allocation__history-meta">
            <span>Created: {{ record.time }}</span>
            <span>ETA: {{ record.eta }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive } from 'vue';

const regions = reactive([
  { name: 'East China', stock: 6200, lowStock: 3, inTransit: 2, shortage: 'PROD-006', overstock: 'PROD-001' },
  { name: 'South China', stock: 5100, lowStock: 2, inTransit: 1, shortage: 'PROD-002', overstock: 'PROD-004' },
  { name: 'Northwest', stock: 4380, lowStock: 1, inTransit: 0, shortage: 'PROD-003', overstock: 'PROD-005' }
]);

const skuOptions = reactive([
  { sku: 'PROD-001', name: 'Casual T-Shirt' },
  { sku: 'PROD-002', name: 'Classic Denim Jeans' },
  { sku: 'PROD-003', name: 'Hooded Sweatshirt' },
  { sku: 'PROD-006', name: 'Jogger Pants' }
]);

const transfer = reactive({
  from: '',
  to: '',
  sku: '',
  quantity: 0,
  eta: '',
  reason: ''
});

const history = reactive([
  {
    id: 'TRF-20251125-011',
    from: 'East China',
    to: 'South China',
    sku: 'PROD-003',
    quantity: 150,
    time: '2025-11-25 13:10',
    eta: '2025-11-28',
    status: 'In Transit',
    statusClass: 'info'
  },
  {
    id: 'TRF-20251123-006',
    from: 'South China',
    to: 'Northwest',
    sku: 'PROD-002',
    quantity: 80,
    time: '2025-11-23 10:45',
    eta: '2025-11-27',
    status: 'Completed',
    statusClass: 'success'
  }
]);

const allocate = () => {
  if (!transfer.from || !transfer.to || !transfer.sku || !transfer.quantity || !transfer.eta) {
    window.alert('Please fill in complete transfer information');
    return;
  }
  if (transfer.from === transfer.to) {
    window.alert('Source and destination cannot be the same');
    return;
  }
  window.alert('Transfer order created (demo)');
};
</script>

<style scoped>
.allocation {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
}

.allocation__regions {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.allocation__region-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: var(--shadow-soft);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.allocation__region-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.allocation__region-body,
.allocation__region-meta {
  display: flex;
  justify-content: space-between;
  color: var(--color-text-muted);
  font-size: 14px;
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

.allocation__history {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.allocation__history-item {
  background: var(--color-background);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.allocation__history-header,
.allocation__history-body,
.allocation__history-meta {
  display: flex;
  justify-content: space-between;
}

@media (max-width: 960px) {
  .allocation {
    grid-template-columns: 1fr;
  }
}
</style>


