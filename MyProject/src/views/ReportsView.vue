<template>
  <div class="reports">
    <section class="card">
      <h2 class="section-title">Filter Conditions</h2>
      <div class="filter-bar">
        <input
          v-model="filters.startDate"
          class="filter-pill"
          type="date"
        />
        <input
          v-model="filters.endDate"
          class="filter-pill"
          type="date"
        />
        <select v-model="filters.warehouse" class="filter-pill">
          <option value="">Warehouse: All</option>
          <option v-for="warehouse in warehouses" :key="warehouse" :value="warehouse">
            Warehouse: {{ warehouse }}
          </option>
        </select>
        <select v-model="filters.category" class="filter-pill">
          <option value="">Category: All</option>
          <option v-for="category in categories" :key="category" :value="category">
            Category: {{ category }}
          </option>
        </select>
      </div>
      <div class="quick-actions">
        <button class="btn-primary" type="button" @click="refreshReport">Refresh Report</button>
        <button class="btn-secondary" type="button" @click="scheduleReport">Schedule Push</button>
      </div>
    </section>

    <section class="card">
      <h2 class="section-title">Key Metrics</h2>
      <div class="reports__metrics">
        <div v-for="metric in metrics" :key="metric.label" class="reports__metric">
          <span class="reports__metric-label">{{ metric.label }}</span>
          <span class="reports__metric-value">{{ metric.value }}</span>
          <span class="reports__metric-trend" :class="`reports__metric-trend--${metric.trend}`">
            {{ metric.trendLabel }}
          </span>
        </div>
      </div>
    </section>

    <section class="card">
      <h2 class="section-title">Inventory Turnover Trend</h2>
      <div class="reports__chart">Line Chart Placeholder: Turnover Days</div>
    </section>

    <section class="card">
      <h2 class="section-title">Warehouse Inventory Distribution</h2>
      <div class="reports__chart">Bar Chart Placeholder: Warehouse Inventory</div>
    </section>

    <section class="card">
      <h2 class="section-title">Sales Proportion</h2>
      <div class="reports__chart">Pie Chart Placeholder: Category Sales</div>
    </section>

    <section class="card reports__export">
      <h2 class="section-title">Report Export</h2>
      <div class="reports__export-actions">
        <button class="btn-primary" type="button" @click="exportExcel">Export Excel</button>
        <button class="btn-secondary" type="button" @click="exportPdf">Export PDF</button>
        <button class="btn-secondary" type="button" @click="shareReport">Generate Share Link</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive } from 'vue';

const warehouses = ['East China Warehouse', 'South China Warehouse', 'Northwest Warehouse'];
const categories = ['Electronic Equipment', 'Consumables', 'Accessories'];

const filters = reactive({
  startDate: '',
  endDate: '',
  warehouse: '',
  category: ''
});

const metrics = reactive([
  { label: 'Inventory Turnover Rate', value: '12.5 times/year', trend: 'up', trendLabel: '+1.2%' },
  { label: 'Safety Stock Compliance Rate', value: '92%', trend: 'up', trendLabel: '+3%' },
  { label: 'Stockout Rate', value: '1.5%', trend: 'down', trendLabel: '-0.4%' },
  { label: 'Sales Revenue', value: '$ 1,280,000', trend: 'up', trendLabel: '+6%' }
]);

const refreshReport = () => {
  window.alert('Report updated (demo)');
};

const scheduleReport = () => {
  window.alert('Scheduled push enabled (demo)');
};

const exportExcel = () => {
  window.alert('Generating Excel export (demo)');
};

const exportPdf = () => {
  window.alert('Generating PDF export (demo)');
};

const shareReport = () => {
  window.alert('Share link generated (demo)');
};
</script>

<style scoped>
.reports {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
}

.reports > .card:nth-child(1) {
  grid-column: 1 / -1;
}

.reports__metrics {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.reports__metric {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--shadow-soft);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.reports__metric-label {
  color: var(--color-text-muted);
  font-size: 14px;
}

.reports__metric-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text);
}

.reports__metric-trend {
  font-size: 14px;
}

.reports__metric-trend--up {
  color: var(--color-success);
}

.reports__metric-trend--down {
  color: var(--color-danger);
}

.reports__chart {
  height: 260px;
  border-radius: 16px;
  background: repeating-linear-gradient(
    135deg,
    rgba(43, 181, 192, 0.08),
    rgba(43, 181, 192, 0.08) 20px,
    rgba(31, 41, 51, 0.04) 20px,
    rgba(31, 41, 51, 0.04) 40px
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
}

.reports__export-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (max-width: 960px) {
  .reports {
    grid-template-columns: 1fr;
  }
}
</style>

