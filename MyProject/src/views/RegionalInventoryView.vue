<template>
  <div class="regional-inventory">
    <section class="card">
      <div class="header">
        <h2 class="section-title">Regional Warehouse Inventory</h2>
        <button class="btn-secondary" type="button" @click="refreshAll" :disabled="loading">Refresh</button>
      </div>
      <p class="section-desc">View East / West / North / South warehouses in one place.</p>
      <div class="inventory-grid">
        <div v-for="warehouse in regionalInventory" :key="warehouse.id" class="inventory-card">
          <div class="inventory-card__header">
            <h3>{{ warehouse.label }}</h3>
            <span class="tag">{{ warehouse.items.length }} SKUs</span>
          </div>
          <div v-if="warehouse.items.length" class="inventory-card__table">
            <div class="inventory-card__row inventory-card__row--head">
              <span>Product</span>
              <span>Total</span>
              <span>Available</span>
              <span>Alert</span>
            </div>
            <div v-for="item in warehouse.items" :key="item.sku" class="inventory-card__row">
              <span class="product-cell">
                <span class="product-name">{{ item.displayName }}</span>
                <span class="product-meta">SKU: {{ item.sku }}</span>
              </span>
              <span>{{ item.total }}</span>
              <span>{{ item.available }}</span>
              <span><span class="tag" :class="item.warningLevel">{{ item.warningLabel }}</span></span>
            </div>
          </div>
          <p v-else class="empty-hint">No inventory data</p>
        </div>
      </div>
    </section>

    <section class="card">
      <h2 class="section-title">Store Inventory in Region</h2>
      <p class="section-desc">East / West / South / North stores (01 ~ 02) overview.</p>
      <div class="inventory-grid">
        <div v-for="store in storeInventory" :key="store.id" class="inventory-card">
          <div class="inventory-card__header">
            <h3>{{ store.label }}</h3>
            <span class="tag">{{ store.items.length }} SKUs</span>
          </div>
          <div v-if="store.items.length" class="inventory-card__table">
            <div class="inventory-card__row inventory-card__row--head">
              <span>Product</span>
              <span>Total</span>
              <span>Available</span>
              <span>Alert</span>
            </div>
            <div v-for="item in store.items" :key="item.sku" class="inventory-card__row">
              <span class="product-cell">
                <span class="product-name">{{ item.displayName }}</span>
                <span class="product-meta">SKU: {{ item.sku }}</span>
              </span>
              <span>{{ item.total }}</span>
              <span>{{ item.available }}</span>
              <span><span class="tag" :class="item.warningLevel">{{ item.warningLabel }}</span></span>
            </div>
          </div>
          <p v-else class="empty-hint">No inventory data</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getInventoryByLocation } from '../services/inventoryService';

const loading = ref(false);

const regionalLocations = [
  { id: 'WH-EAST', label: 'East Warehouse' },
  { id: 'WH-WEST', label: 'West Warehouse' },
  { id: 'WH-NORTH', label: 'North Warehouse' },
  { id: 'WH-SOUTH', label: 'South Warehouse' }
];

const storeLocations = [
  { id: 'STORE-EAST-01', label: 'East Store 1' },
  { id: 'STORE-EAST-02', label: 'East Store 2' },
  { id: 'STORE-WEST-01', label: 'West Store 1' },
  { id: 'STORE-WEST-02', label: 'West Store 2' },
  { id: 'STORE-NORTH-01', label: 'North Store 1' },
  { id: 'STORE-NORTH-02', label: 'North Store 2' },
  { id: 'STORE-SOUTH-01', label: 'South Store 1' },
  { id: 'STORE-SOUTH-02', label: 'South Store 2' }
];

const regionalInventory = ref([]);
const storeInventory = ref([]);

const mapWarning = (available, minThreshold = 0) => {
  if (available <= 0) return { level: 'danger', label: 'Out' };
  if (available <= minThreshold) return { level: 'warning', label: 'Low' };
  return { level: 'default', label: 'Normal' };
};

const normalizeItem = (row) => {
  const { level, label } = mapWarning(row.available ?? row.quantity, row.minThreshold);
  const productName = row.productName;
  const displayName =
    typeof productName === 'object'
      ? productName.en || productName.zh || JSON.stringify(productName)
      : productName;
  return {
    sku: row.productId || row.productSku,
    displayName,
    total: row.totalStock ?? row.quantity,
    available: row.available ?? row.quantity,
    warningLevel: level,
    warningLabel: label
  };
};

const fetchLocationInventory = async (locations) => {
  const results = await Promise.all(
    locations.map(async (loc) => {
      try {
        const data = await getInventoryByLocation(loc.id);
        return {
          ...loc,
          items: data.map(normalizeItem)
        };
      } catch (error) {
        console.error('Failed to load inventory for', loc.id, error);
        return { ...loc, items: [] };
      }
    })
  );
  return results;
};

const refreshAll = async () => {
  loading.value = true;
  try {
    const [regionalResults, storeResults] = await Promise.all([
      fetchLocationInventory(regionalLocations),
      fetchLocationInventory(storeLocations)
    ]);
    regionalInventory.value = regionalResults;
    storeInventory.value = storeResults;
  } finally {
    loading.value = false;
  }
};

onMounted(refreshAll);
</script>

<style scoped>
.regional-inventory {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.section-desc {
  margin-top: 4px;
  color: var(--color-text-muted);
  font-size: 14px;
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-top: 16px;
}

.inventory-card {
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.inventory-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.inventory-card__table {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
}

.inventory-card__row {
  display: grid;
  grid-template-columns: 2fr 0.8fr 0.8fr 1fr;
  padding: 10px 12px;
  align-items: center;
  border-top: 1px solid var(--color-border);
  font-size: 14px;
}

.inventory-card__row:first-of-type {
  border-top: none;
}

.inventory-card__row--head {
  background: var(--color-surface-alt);
  font-weight: 600;
}

.product-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.product-name {
  font-weight: 600;
}

.product-meta {
  color: var(--color-text-muted);
  font-size: 12px;
}

.empty-hint {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 14px;
}

@media (max-width: 960px) {
  .inventory-card__row {
    grid-template-columns: 1.5fr 0.6fr 0.6fr 0.8fr;
  }
}
</style>

