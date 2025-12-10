<template>
  <div class="central-inventory-count">
    <section class="card central-inventory-count__filter-section">
      <h2 class="section-title">Inventory Count</h2>
      <div class="filter-bar">
        <input
          v-model="filters.sku"
          class="form-input central-inventory-count__filter-input"
          placeholder="Product ID"
          @input="applyFilters"
        />
        <input
          v-model="filters.name"
          class="form-input central-inventory-count__filter-input"
          placeholder="Product Name"
          @input="applyFilters"
        />
        <select v-model="filters.location" class="filter-pill central-inventory-count__filter-picker" @change="applyFilters">
          <option value="">Location: All</option>
          <option value="Central Warehouse">Central Warehouse</option>
          <option value="East Warehouse">East Warehouse</option>
          <option value="West Warehouse">West Warehouse</option>
          <option value="North Warehouse">North Warehouse</option>
          <option value="South Warehouse">South Warehouse</option>
          <option value="East Store 1">East Store 1</option>
          <option value="East Store 2">East Store 2</option>
          <option value="West Store 1">West Store 1</option>
          <option value="West Store 2">West Store 2</option>
          <option value="North Store 1">North Store 1</option>
          <option value="North Store 2">North Store 2</option>
          <option value="South Store 1">South Store 1</option>
          <option value="South Store 2">South Store 2</option>
        </select>
        <select v-model="filters.status" class="filter-pill central-inventory-count__filter-picker" @change="applyFilters">
          <option value="">Status: All</option>
          <option value="Normal">Normal</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>
      </div>
    </section>

    <div class="central-inventory-count__tables-grid">
      <section class="card">
        <h2 class="section-title">Central Warehouse Inventory</h2>
        <div class="central-inventory-count__table">
          <div class="central-inventory-count__table-header">
            <span class="col col-wide">Product</span>
            <span class="col">Location</span>
            <span class="col">Total Stock</span>
            <span class="col">Available</span>
            <span class="col">Alert</span>
          </div>
          <div
            v-for="item in filteredCentralInventory"
            :key="`${item.sku}-${item.location}`"
            class="central-inventory-count__table-row"
          >
            <div class="col col-wide">
              <div class="central-inventory-count__item-name">
                <span class="central-inventory-count__item-icon">{{ getProductIcon(item.name, item.sku) }}</span>
                {{ item.name }}
              </div>
              <div class="central-inventory-count__item-meta">SKU: {{ item.sku }}</div>
            </div>
            <span class="col">{{ item.location }}</span>
            <span class="col">{{ item.total }}</span>
            <span class="col">{{ item.available }}</span>
            <span class="col"><span class="tag" :class="item.warningLevel">{{ item.warningLabel }}</span></span>
          </div>
          <p v-if="!filteredCentralInventory.length" class="empty-hint">No inventory data</p>
        </div>
      </section>

      <section class="card">
        <h2 class="section-title">Regional Warehouse Inventory</h2>
        <div class="central-inventory-count__table">
          <div class="central-inventory-count__table-header">
            <span class="col col-wide">Product</span>
            <span class="col">Location</span>
            <span class="col">Total Stock</span>
            <span class="col">Available</span>
            <span class="col">Alert</span>
          </div>
          <div
            v-for="item in filteredRegionalWarehouseInventory"
            :key="`${item.sku}-${item.location}`"
            class="central-inventory-count__table-row"
          >
            <div class="col col-wide">
              <div class="central-inventory-count__item-name">
                <span class="central-inventory-count__item-icon">{{ getProductIcon(item.name, item.sku) }}</span>
                {{ item.name }}
              </div>
              <div class="central-inventory-count__item-meta">SKU: {{ item.sku }}</div>
            </div>
            <span class="col">{{ item.location }}</span>
            <span class="col">{{ item.total }}</span>
            <span class="col">{{ item.available }}</span>
            <span class="col"><span class="tag" :class="item.warningLevel">{{ item.warningLabel }}</span></span>
          </div>
          <p v-if="!filteredRegionalWarehouseInventory.length" class="empty-hint">No inventory data</p>
        </div>
      </section>

      <section class="card">
        <h2 class="section-title">Store Inventory in Region</h2>
        <div class="central-inventory-count__table">
          <div class="central-inventory-count__table-header">
            <span class="col col-wide">Product</span>
            <span class="col">Store</span>
            <span class="col">Total Stock</span>
            <span class="col">Available</span>
            <span class="col">Alert</span>
          </div>
          <div
            v-for="item in filteredRegionalStoreInventory"
            :key="`${item.sku}-${item.location}`"
            class="central-inventory-count__table-row"
          >
            <div class="col col-wide">
              <div class="central-inventory-count__item-name">
                <span class="central-inventory-count__item-icon">{{ getProductIcon(item.name, item.sku) }}</span>
                {{ item.name }}
              </div>
              <div class="central-inventory-count__item-meta">SKU: {{ item.sku }}</div>
            </div>
            <span class="col">{{ item.location }}</span>
            <span class="col">{{ item.total }}</span>
            <span class="col">{{ item.available }}</span>
            <span class="col"><span class="tag" :class="item.warningLevel">{{ item.warningLabel }}</span></span>
          </div>
          <p v-if="!filteredRegionalStoreInventory.length" class="empty-hint">No inventory data</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { getInventoryByLocation } from '../services/inventoryService';

// Location mapping
const locationMap = {
  'WH-CENTRAL': 'Central Warehouse',
  'WH-EAST': 'East Warehouse',
  'WH-WEST': 'West Warehouse',
  'WH-NORTH': 'North Warehouse',
  'WH-SOUTH': 'South Warehouse',
  'STORE-EAST-01': 'East Store 1',
  'STORE-EAST-02': 'East Store 2',
  'STORE-WEST-01': 'West Store 1',
  'STORE-WEST-02': 'West Store 2',
  'STORE-NORTH-01': 'North Store 1',
  'STORE-NORTH-02': 'North Store 2',
  'STORE-SOUTH-01': 'South Store 1',
  'STORE-SOUTH-02': 'South Store 2'
};

const filters = reactive({
  sku: '',
  name: '',
  location: '',
  status: ''
});

const centralInventory = ref([]);
const regionalWarehouseInventory = ref([]);
const regionalStoreInventory = ref([]);
const loading = ref(false);

// Product icon mapping - based on the product icon in the customer purchase interface
const getProductIcon = (productName, sku) => {
  // Prioritize matching by SKU
  if (sku) {
    const productIconMap = {
      'PROD-001': '👕', // Casual T-Shirt
      'PROD-002': '👖', // Classic Denim Jeans
      'PROD-003': '🧥', // Hooded Sweatshirt
      'PROD-004': '👔', // Chino Pants
      'PROD-005': '👔', // Polo Shirt
      'PROD-006': '👖'  // Jogger Pants
    };
    if (productIconMap[sku]) {
      return productIconMap[sku];
    }
  }
  
  // If there is no SKU or the SKU does not match, match by product name
  if (!productName) return '📦';
  const name = productName.toLowerCase();
  
  // Exact match product name
  if (name === 'casual t-shirt') return '👕';
  if (name === 'classic denim jeans') return '👖';
  if (name === 'hooded sweatshirt') return '🧥';
  if (name === 'chino pants') return '👔';
  if (name === 'polo shirt') return '👔';
  if (name === 'jogger pants') return '👖';
  
  // Fuzzy matching (as a fallback)
  if (name.includes('t-shirt') && !name.includes('polo')) return '👕';
  if (name.includes('jeans')) return '👖';
  if (name.includes('sweatshirt') || name.includes('hood')) return '🧥';
  if (name.includes('polo')) return '👔';
  if (name === 'chino pants' || (name.includes('chino') && name.includes('pants'))) return '👔';
  if (name.includes('jogger')) return '👖';
  if (name.includes('pants') && !name.includes('chino')) return '👖';
  
  return '📦';
};

// Warning level calculation
// Note: This logic applies to all locations (regional warehouses, stores, and central warehouse)
// 1. When the stock is 0, display "Out of Stock" (consistent with the store inventory logic)
// 2. When the stock is below the threshold, display "Low Stock"
// 3. Otherwise, display "Normal"
const getWarningLevel = (available, minThreshold = 0) => {
  // Prioritize checking: when the stock is 0, display "Out of Stock" (both regional warehouses and stores use this logic)
  if (available === 0) return { level: 'danger', label: 'Out of Stock' };
  // When the stock is below the threshold, display "Low Stock"
  if (available <= minThreshold) return { level: 'warning', label: 'Low Stock' };
  // Otherwise, display "Normal"
  return { level: 'default', label: 'Normal' };
};

// Standardize inventory items
const normalizeItem = (row) => {
  const available = row.available ?? 0;
  const total = row.totalStock ?? 0;
  
  // Regional warehouses and stores use totalStock * 0.3 as the threshold
  // The central warehouse uses minThreshold from the database
  const regionalWarehouses = ['WH-EAST', 'WH-WEST', 'WH-NORTH', 'WH-SOUTH'];
  const isStore = row.locationId?.startsWith('STORE-');
  const isRegionalWarehouse = regionalWarehouses.includes(row.locationId);
  
  let effectiveThreshold;
  if (isRegionalWarehouse || isStore) {
    // Regional warehouses and stores: use totalStock * 0.3 as the threshold
    effectiveThreshold = total > 0 ? Math.ceil(total * 0.3) : 0;
  } else {
    // The central warehouse uses minThreshold from the database
    effectiveThreshold = row.minThreshold ?? 0;
  }
  
  const warning = getWarningLevel(available, effectiveThreshold);
  const locationLabel = locationMap[row.locationId] || row.locationName || row.locationId;

  return {
    sku: row.productId || row.productSku,
    name: row.productName || row.productId,
    location: locationLabel,
    total,
    available,
    warningLevel: warning.level,
    warningLabel: warning.label,
    minThreshold: effectiveThreshold
  };
};

// Get all inventory data
const loadAllInventory = async () => {
  loading.value = true;
  try {
    // The central warehouse
    const centralData = await getInventoryByLocation('WH-CENTRAL');
    centralInventory.value = centralData.map(normalizeItem);

    // Regional warehouses
    const regionalWarehouseIds = ['WH-EAST', 'WH-WEST', 'WH-NORTH', 'WH-SOUTH'];
    const regionalWarehouseData = await Promise.all(
      regionalWarehouseIds.map(async (id) => {
        try {
          const data = await getInventoryByLocation(id);
          return data.map(normalizeItem);
        } catch (error) {
          console.error(`Failed to load inventory for ${id}:`, error);
          return [];
        }
      })
    );
    regionalWarehouseInventory.value = regionalWarehouseData.flat();

    // Regional stores
    const regionalStoreIds = [
      'STORE-EAST-01', 'STORE-EAST-02',
      'STORE-WEST-01', 'STORE-WEST-02',
      'STORE-NORTH-01', 'STORE-NORTH-02',
      'STORE-SOUTH-01', 'STORE-SOUTH-02'
    ];
    const regionalStoreData = await Promise.all(
      regionalStoreIds.map(async (id) => {
        try {
          const data = await getInventoryByLocation(id);
          return data.map(normalizeItem);
        } catch (error) {
          console.error(`Failed to load inventory for ${id}:`, error);
          return [];
        }
      })
    );
    regionalStoreInventory.value = regionalStoreData.flat();
  } catch (error) {
    console.error('Failed to load inventory:', error);
    window.alert('Failed to load inventory: ' + (error.message || 'Unknown error'));
  } finally {
    loading.value = false;
  }
};

// Filter logic
const filteredCentralInventory = computed(() => {
  return centralInventory.value.filter((item) => {
    const matchSku = !filters.sku || item.sku.toLowerCase().includes(filters.sku.toLowerCase());
    const matchName = !filters.name || item.name.toLowerCase().includes(filters.name.toLowerCase());
    const matchLocation = !filters.location || item.location === filters.location;
    const matchStatus = !filters.status || item.warningLabel === filters.status;
    return matchSku && matchName && matchLocation && matchStatus;
  });
});

const filteredRegionalWarehouseInventory = computed(() => {
  return regionalWarehouseInventory.value.filter((item) => {
    const matchSku = !filters.sku || item.sku.toLowerCase().includes(filters.sku.toLowerCase());
    const matchName = !filters.name || item.name.toLowerCase().includes(filters.name.toLowerCase());
    const matchLocation = !filters.location || item.location === filters.location;
    const matchStatus = !filters.status || item.warningLabel === filters.status;
    return matchSku && matchName && matchLocation && matchStatus;
  });
});

const filteredRegionalStoreInventory = computed(() => {
  return regionalStoreInventory.value.filter((item) => {
    const matchSku = !filters.sku || item.sku.toLowerCase().includes(filters.sku.toLowerCase());
    const matchName = !filters.name || item.name.toLowerCase().includes(filters.name.toLowerCase());
    const matchLocation = !filters.location || item.location === filters.location;
    const matchStatus = !filters.status || item.warningLabel === filters.status;
    return matchSku && matchName && matchLocation && matchStatus;
  });
});

const applyFilters = () => {
  // Filters are applied via computed properties
};

onMounted(() => {
  loadAllInventory();
});
</script>

<style scoped>
.central-inventory-count {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.central-inventory-count__filter-section {
  width: 100%;
}

.filter-bar {
  display: flex;
  gap: 12px;
  flex-wrap: nowrap;
  margin-top: 16px;
}

.central-inventory-count__filter-input {
  flex: 1;
  min-width: 0;
}

.central-inventory-count__filter-picker {
  flex: 1;
  min-width: 0;
}

.central-inventory-count__tables-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.central-inventory-count__table {
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  margin-top: 16px;
}

.central-inventory-count__table-header,
.central-inventory-count__table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 12px;
  padding: 16px 20px;
  align-items: center;
}

.central-inventory-count__table-header {
  background-color: var(--color-surface-alt);
  font-weight: 600;
  color: var(--color-text-muted);
}

.central-inventory-count__table-row {
  border-top: 1px solid var(--color-border);
}

.central-inventory-count__item-name {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.central-inventory-count__item-icon {
  font-size: 20px;
}

.central-inventory-count__item-meta {
  margin-top: 4px;
  color: #9ca3af;
  font-size: 13px;
}

.empty-hint {
  margin: 0;
  padding: 12px;
  text-align: center;
  color: var(--color-text-muted);
}

@media (max-width: 1400px) {
  .central-inventory-count__tables-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .filter-bar {
    flex-wrap: wrap;
  }
  
  .central-inventory-count__filter-input,
  .central-inventory-count__filter-picker {
    min-width: 100%;
  }
  
  .central-inventory-count__table-header,
  .central-inventory-count__table-row {
    grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr;
    font-size: 14px;
    padding: 12px 16px;
  }
}
</style>
