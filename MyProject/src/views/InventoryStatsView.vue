<template>
  <div class="inventory-stats">
    <section class="card">
      <h2 class="section-title">Inventory Statistics</h2>
      <div class="filter-bar">
        <input
          v-model="filters.startDate"
          class="filter-pill inventory-stats__filter-input"
          type="date"
          @change="refreshStats"
        />
        <input
          v-model="filters.endDate"
          class="filter-pill inventory-stats__filter-input"
          type="date"
          @change="refreshStats"
        />
        <select v-model="filters.warehouse" class="filter-pill inventory-stats__filter-picker" @change="refreshStats">
          <option value="">Warehouse: All</option>
          <option v-for="warehouse in warehouses" :key="warehouse" :value="warehouse">
            Warehouse: {{ warehouse }}
          </option>
        </select>
        <select v-model="filters.category" class="filter-pill inventory-stats__filter-picker" @change="refreshStats">
          <option value="">Category: All</option>
          <option v-for="category in categories" :key="category" :value="category">
            Category: {{ category }}
          </option>
        </select>
      </div>
      <div class="quick-actions">
        <button class="btn-primary" type="button" @click="refreshStats">Refresh Statistics</button>
        <button class="btn-secondary" type="button" @click="exportStats">Export Report</button>
      </div>
    </section>

    <section class="card">
      <h2 class="section-title">Key Metrics</h2>
      <div class="inventory-stats__metrics">
        <div v-for="metric in metrics" :key="metric.label" class="inventory-stats__metric">
          <span class="inventory-stats__metric-label">{{ metric.label }}</span>
          <span class="inventory-stats__metric-value">{{ metric.value }}</span>
          <span class="inventory-stats__metric-trend" :class="`inventory-stats__metric-trend--${metric.trend}`">
            {{ metric.trendLabel }}
          </span>
        </div>
      </div>
    </section>

    <section class="card">
      <h2 class="section-title">Inventory Distribution by Warehouse</h2>
      <div class="inventory-stats__distribution">
        <div v-for="item in warehouseDistribution" :key="item.warehouse" class="inventory-stats__distribution-item">
          <div class="inventory-stats__distribution-header">
            <span>{{ item.warehouse }}</span>
            <span class="tag">{{ item.totalItems }} items</span>
          </div>
          <div class="inventory-stats__distribution-body">
            <span>Total Value: ${{ item.totalValue.toLocaleString() }}</span>
            <span>Total Stock: {{ item.totalStock }} units</span>
          </div>
          <div class="inventory-stats__distribution-progress">
            <div class="inventory-stats__progress-bar">
              <div
                class="inventory-stats__progress-fill"
                :style="{ width: `${((item.totalStock / maxStock) * 100).toFixed(0)}%` }"
              />
            </div>
            <span class="inventory-stats__progress-label">{{ ((item.totalStock / maxStock) * 100).toFixed(0) }}%</span>
          </div>
        </div>
      </div>
    </section>

    <section class="card">
      <h2 class="section-title">Category Statistics</h2>
      <div class="inventory-stats__category">
        <div v-for="item in categoryStats" :key="item.category" class="inventory-stats__category-item">
          <div class="inventory-stats__category-header">
            <span>{{ item.category }}</span>
            <span class="tag" :class="item.statusClass">{{ item.status }}</span>
          </div>
          <div class="inventory-stats__category-body">
            <span>Total Stock: {{ item.totalStock }} units</span>
            <span>Total Value: ${{ item.totalValue.toLocaleString() }}</span>
            <span>Average Price: ${{ item.averagePrice.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="card">
      <h2 class="section-title">Low Stock Alerts</h2>
      <div v-if="lowStockItems.length" class="list">
        <div v-for="item in lowStockItems" :key="item.sku" class="list-item inventory-stats__alert-item">
          <div class="inventory-stats__alert-header">
            <span>{{ item.name }}</span>
            <span class="tag" :class="item.warningLevel">{{ item.warningLabel }}</span>
          </div>
          <div class="inventory-stats__alert-body">
            <span>SKU: {{ item.sku }}</span>
            <span>Warehouse: {{ item.warehouse }}</span>
            <span>Current Stock: {{ item.stock }} units</span>
            <span>Safety Threshold: {{ item.threshold }} units</span>
          </div>
        </div>
      </div>
      <p v-else class="empty">No low stock alerts</p>
    </section>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue';

const warehouses = ['East China Warehouse', 'South China Warehouse', 'Northwest Warehouse'];
const categories = ['Electronic Equipment', 'Consumables', 'Accessories', 'Clothing'];

const filters = reactive({
  startDate: '',
  endDate: '',
  warehouse: '',
  category: ''
});

const metrics = reactive([
  { label: 'Total Inventory Value', value: '$2,450,000', trend: 'up', trendLabel: '+5.2%' },
  { label: 'Total Stock Units', value: '15,680', trend: 'up', trendLabel: '+3.1%' },
  { label: 'Average Inventory Turnover', value: '8.5 times/year', trend: 'up', trendLabel: '+0.8' },
  { label: 'Low Stock Items', value: '12', trend: 'down', trendLabel: '-3' },
  { label: 'Out of Stock Items', value: '2', trend: 'down', trendLabel: '-1' },
  { label: 'Total SKUs', value: '156', trend: 'up', trendLabel: '+5' }
]);

const warehouseDistribution = reactive([
  {
    warehouse: 'East China Warehouse',
    totalItems: 65,
    totalValue: 980000,
    totalStock: 6200
  },
  {
    warehouse: 'South China Warehouse',
    totalItems: 52,
    totalValue: 850000,
    totalStock: 5100
  },
  {
    warehouse: 'Northwest Warehouse',
    totalItems: 39,
    totalValue: 620000,
    totalStock: 4380
  }
]);

const categoryStats = reactive([
  {
    category: 'Clothing',
    totalStock: 8500,
    totalValue: 1250000,
    averagePrice: 147.06,
    status: 'Normal',
    statusClass: 'default'
  },
  {
    category: 'Electronic Equipment',
    totalStock: 4200,
    totalValue: 850000,
    averagePrice: 202.38,
    status: 'Normal',
    statusClass: 'default'
  },
  {
    category: 'Accessories',
    totalStock: 2100,
    totalValue: 280000,
    averagePrice: 133.33,
    status: 'Low Stock',
    statusClass: 'warning'
  },
  {
    category: 'Consumables',
    totalStock: 880,
    totalValue: 200000,
    averagePrice: 227.27,
    status: 'Normal',
    statusClass: 'default'
  }
]);

const lowStockItems = reactive([
  {
    sku: 'PROD-006',
    name: 'Jogger Pants',
    warehouse: 'Northwest Warehouse',
    stock: 5,
    threshold: 25,
    warningLevel: 'danger',
    warningLabel: 'Critically Low'
  },
  {
    sku: 'PROD-003',
    name: 'Hooded Sweatshirt',
    warehouse: 'East China Warehouse',
    stock: 30,
    threshold: 50,
    warningLevel: 'warning',
    warningLabel: 'Low Stock'
  },
  {
    sku: 'PROD-002',
    name: 'Classic Denim Jeans',
    warehouse: 'South China Warehouse',
    stock: 65,
    threshold: 50,
    warningLevel: 'warning',
    warningLabel: 'Low Stock'
  }
]);

const maxStock = computed(() => {
  return Math.max(...warehouseDistribution.map(item => item.totalStock));
});

const refreshStats = () => {
  window.alert('Statistics refreshed (demo)');
};

const exportStats = () => {
  window.alert('Exporting statistics report (demo)');
};
</script>

<style scoped>
.inventory-stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
}

.inventory-stats > .card:nth-child(1) {
  grid-column: 1 / -1;
}

.inventory-stats__filter-input {
  min-width: 180px;
}

.inventory-stats__filter-picker {
  min-width: 200px;
}

.inventory-stats__metrics {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.inventory-stats__metric {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--shadow-soft);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.inventory-stats__metric-label {
  color: var(--color-text-muted);
  font-size: 14px;
}

.inventory-stats__metric-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text);
}

.inventory-stats__metric-trend {
  font-size: 14px;
}

.inventory-stats__metric-trend--up {
  color: var(--color-success);
}

.inventory-stats__metric-trend--down {
  color: var(--color-danger);
}

.inventory-stats__distribution {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.inventory-stats__distribution-item {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--shadow-soft);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.inventory-stats__distribution-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.inventory-stats__distribution-body {
  display: flex;
  gap: 16px;
  color: var(--color-text-muted);
  font-size: 14px;
}

.inventory-stats__distribution-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.inventory-stats__progress-bar {
  flex: 1;
  height: 8px;
  background-color: var(--color-border);
  border-radius: 4px;
  overflow: hidden;
}

.inventory-stats__progress-fill {
  height: 100%;
  background-color: var(--color-brand);
  transition: width 0.3s ease;
}

.inventory-stats__progress-label {
  font-size: 14px;
  color: var(--color-text-muted);
  min-width: 50px;
  text-align: right;
}

.inventory-stats__category {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.inventory-stats__category-item {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--shadow-soft);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.inventory-stats__category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.inventory-stats__category-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--color-text-muted);
  font-size: 14px;
}

.inventory-stats__alert-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.inventory-stats__alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.inventory-stats__alert-body {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  color: var(--color-text-muted);
  font-size: 14px;
}

@media (max-width: 960px) {
  .inventory-stats {
    grid-template-columns: 1fr;
  }
}
</style>

