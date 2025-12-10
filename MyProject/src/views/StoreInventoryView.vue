<template>
  <div class="store-inventory">
    <section class="card">
      <h2 class="section-title">Store Inventory</h2>
      <div class="filter-bar">
        <input
          v-model="filters.sku"
          class="form-input store-inventory__filter-input"
          placeholder="Product ID"
          @input="applyFilters"
        />
        <input
          v-model="filters.name"
          class="form-input store-inventory__filter-input"
          placeholder="Product Name"
          @input="applyFilters"
        />
        <select v-model="filters.store" class="filter-pill store-inventory__filter-picker" @change="applyFilters">
          <option value="">Store: All</option>
          <option v-for="store in stores" :key="store" :value="store">
            Store: {{ store }}
          </option>
        </select>
        <select v-model="filters.status" class="filter-pill store-inventory__filter-picker" @change="applyFilters">
          <option value="">Status: All</option>
          <option value="Normal">Normal</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>
      </div>
    </section>

    <section class="card">
      <h2 class="section-title">Inventory List</h2>
      <div v-if="isLoading" class="empty">Loading inventory...</div>
      <div v-else-if="!filteredInventory.length" class="empty">No inventory found</div>
      <div v-else class="store-inventory__table">
        <div class="store-inventory__table-header">
          <span class="col col-wide">Product</span>
          <span class="col">Store</span>
          <span class="col">Total Stock</span>
          <span class="col">Available</span>
          <span class="col">Alert</span>
        </div>
        <div
          v-for="item in filteredInventory"
          :key="item.sku"
          class="store-inventory__table-row"
          :class="{ 'store-inventory__table-row--active': selectedItem?.sku === item.sku }"
          @click="selectItem(item)"
        >
          <div class="col col-wide">
            <div class="store-inventory__item-name">
              <span style="font-size: 20px; margin-right: 8px;">{{ item.icon || '📦' }}</span>
              {{ item.name }}
            </div>
            <div class="store-inventory__item-meta">SKU: {{ item.sku }} | Price: ${{ item.price }}</div>
          </div>
          <span class="col">{{ item.store }}</span>
          <span class="col">{{ item.total }}</span>
          <span class="col">{{ item.available }}</span>
          <span class="col"><span class="tag" :class="item.warningLevel">{{ item.warningLabel }}</span></span>
        </div>
      </div>
    </section>

    <section v-if="selectedItem" class="card">
      <h2 class="section-title">Inventory Details</h2>
      <div class="list">
        <div class="list-item store-inventory__detail-item">
          <span>Price: ${{ selectedItem.price }}</span>
          <span>Location: {{ selectedItem.location }}</span>
        </div>
        <div class="list-item store-inventory__detail-item">
          <span>Safety Stock: {{ selectedItem.threshold }}</span>
          <span>Last Inbound: {{ selectedItem.lastInDate }}</span>
        </div>
        <div class="list-item">
          <span>Available Size: One Size</span>
        </div>
        <div class="list-item">
          <span>Restock Suggestion: {{ selectedItem.restockAdvice }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { useAppStore } from '../store/appStore';
import { getInventoryByLocation } from '../services/inventoryService.js';

const appStore = useAppStore();

const stores = ref([]);

// Product metadata (for display purposes)
const productMetadata = {
  'PROD-001': {
    name: 'Casual T-Shirt',
    spec: 'One Size',
    threshold: 80,
    store: 'Store A - Downtown',
    location: 'Area A-03-05',
    lastInDate: '2024-01-12',
    price: 29.99,
    icon: '👕'
  },
  'PROD-002': {
    name: 'Classic Denim Jeans',
    spec: 'One Size',
    threshold: 50,
    store: 'Store B - Shopping Mall',
    location: 'Area B-01-02',
    lastInDate: '2024-01-09',
    price: 59.99,
    icon: '👖'
  },
  'PROD-003': {
    name: 'Hooded Sweatshirt',
    spec: 'One Size',
    threshold: 50,
    store: 'Store A - Downtown',
    location: 'Area A-02-03',
    lastInDate: '2024-01-10',
    price: 49.99,
    icon: '🧥'
  },
  'PROD-004': {
    name: 'Chino Pants',
    spec: 'One Size',
    threshold: 40,
    store: 'Store C - Airport',
    location: 'Area C-02-01',
    lastInDate: '2024-01-11',
    price: 54.99,
    icon: '👔'
  },
  'PROD-005': {
    name: 'Polo Shirt',
    spec: 'One Size',
    threshold: 60,
    store: 'Store B - Shopping Mall',
    location: 'Area B-01-04',
    lastInDate: '2024-01-13',
    price: 39.99,
    icon: '👔'
  },
  'PROD-006': {
    name: 'Jogger Pants',
    spec: 'One Size',
    threshold: 25,
    store: 'Store A - Downtown',
    location: 'Area A-04-01',
    lastInDate: '2024-01-05',
    price: 44.99,
    icon: '👖'
  }
};

const inventory = reactive([]);
const isLoading = ref(false);

const filters = reactive({
  sku: '',
  name: '',
  store: '',
  status: ''
});

const filteredInventory = computed(() => {
  return inventory.filter((item) => {
    const matchSku = !filters.sku || item.sku.toLowerCase().includes(filters.sku.toLowerCase());
    const matchName = !filters.name || item.name.includes(filters.name);
    const matchStore = !filters.store || item.store === filters.store;
    const matchStatus = !filters.status || item.warningLabel === filters.status;
    return matchSku && matchName && matchStore && matchStatus;
  });
});

const selectedItem = ref(null);

const applyFilters = () => {
  // Filters are applied via computed property
  if (filteredInventory.value.length > 0 && !selectedItem.value) {
    selectedItem.value = filteredInventory.value[0];
  }
};

const selectItem = (item) => {
  selectedItem.value = item;
};

const getWarningLevel = (quantity, threshold) => {
  if (quantity === 0) return { level: 'danger', label: 'Out of Stock' };
  if (quantity < threshold) return { level: 'warning', label: 'Low Stock' };
  return { level: 'default', label: 'Normal' };
};

const getRestockAdvice = (quantity, threshold) => {
  if (quantity === 0) return 'Restock immediately 30 pieces';
  if (quantity < threshold) return `Suggest restock ${threshold - quantity} pieces`;
  return 'No restock needed';
};

const loadInventory = async () => {
  isLoading.value = true;
  try {
    const locationId = appStore.user.assignedLocationId || 'STORE-EAST-01';
    const data = await getInventoryByLocation(locationId);

    inventory.length = 0;
    data.forEach((item) => {
      const metadata = productMetadata[item.productId];
      if (metadata) {
        const warning = getWarningLevel(item.available, metadata.threshold);
        inventory.push({
          sku: item.productId,
          name: metadata.name,
          spec: metadata.spec,
          total: item.totalStock || 200,
          available: item.available,
          threshold: metadata.threshold,
          warningLevel: warning.level,
          warningLabel: warning.label,
          store: item.locationName || metadata.store,
          location: item.locationId,
          lastInDate: metadata.lastInDate,
          restockAdvice: getRestockAdvice(item.available, metadata.threshold),
          price: metadata.price,
          icon: metadata.icon
        });
      }
    });

    if (inventory.length > 0) {
      const currentStoreName = inventory[0].store;
      stores.value = [currentStoreName];
      if (!filters.store) {
        filters.store = '';
      }
      if (!selectedItem.value) {
        selectedItem.value = inventory[0];
      }
    }
  } catch (error) {
    console.error('Failed to load inventory:', error);
    window.alert('Failed to load inventory: ' + (error.message || 'Unknown error'));
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadInventory();
});
</script>

<style scoped>
.store-inventory {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
}

.store-inventory__filter-input {
  flex: 1;
  min-width: 220px;
}

.store-inventory__filter-picker {
  min-width: 180px;
}

.store-inventory__table {
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.store-inventory__table-header,
.store-inventory__table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 12px;
  padding: 16px 20px;
  align-items: center;
}

.store-inventory__table-header {
  background-color: var(--color-surface-alt);
  font-weight: 600;
  color: var(--color-text-muted);
}

.store-inventory__table-row {
  border-top: 1px solid var(--color-border);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.store-inventory__table-row:hover {
  background-color: rgba(43, 181, 192, 0.08);
}

.store-inventory__table-row--active {
  background-color: rgba(43, 181, 192, 0.12);
}

.store-inventory__item-name {
  font-weight: 600;
}

.store-inventory__item-meta {
  margin-top: 4px;
  color: #9ca3af;
  font-size: 13px;
}

.store-inventory__detail-item {
  display: flex;
  justify-content: space-between;
}

@media (max-width: 960px) {
  .store-inventory {
    grid-template-columns: 1fr;
  }
}
</style>
