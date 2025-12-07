<template>
  <div class="layout">
    <aside class="layout__sidebar">
      <div class="layout__brand">
        <span class="layout__brand-name">Inventory & Sales Management</span>
      </div>
      <nav class="layout__nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="layout__nav-item"
          active-class="layout__nav-item--active"
        >
          <span class="layout__nav-icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>
    </aside>
    <div class="layout__content">
      <header class="layout__header">
        <div>
          <h1 class="layout__title">{{ pageTitle }}</h1>
          <p class="layout__subtitle">{{ subtitle }}</p>
        </div>
        <div class="layout__user">
          <span class="layout__user-name">{{ appStore.user.name }}</span>
          <button class="btn-secondary" type="button" @click="handleLogout">Logout</button>
        </div>
      </header>
      <main class="layout__main">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter, useRoute, RouterLink, RouterView } from 'vue-router';
import { useAppStore } from '../store/appStore';

const appStore = useAppStore();
const router = useRouter();
const route = useRoute();

onMounted(() => {
  appStore.normalizeUserName();
});

const navItems = computed(() => {
  const role = appStore.user.role;
  if (role === 'sales') {
    return [
      { label: 'Dashboard', icon: '🏠', to: '/app/sales/dashboard' },
      { label: 'Customer Orders', icon: '🧾', to: '/app/sales/customer-orders' },
      { label: 'Store Inventory', icon: '📦', to: '/app/sales/store-inventory' },
      { label: 'Return Requests', icon: '↩️', to: '/app/sales/return-requests' }
    ];
  } else if (role === 'regionalManager') {
    return [
      { label: 'Dashboard', icon: '🏠', to: '/app/regional/dashboard' },
      { label: 'Inventory Count', icon: '🧮', to: '/app/regional/inventory-count' },
      { label: 'Dispatch Goods', icon: '🚚', to: '/app/regional/dispatch-goods' },
      { label: 'Receive & Stock', icon: '📥', to: '/app/regional/receive-goods' },
      { label: 'Replenishment', icon: '🔁', to: '/app/regional/replenishment' }
    ];
  } else if (role === 'centralManager') {
    return [
      { label: 'Dashboard', icon: '🏠', to: '/app/central/dashboard' },
      { label: 'Inventory Count', icon: '📊', to: '/app/central/inventory-count' },
      { label: 'Approve Replenishment', icon: '✅', to: '/app/central/approvals' },
      { label: 'Manage Suppliers', icon: '🤝', to: '/app/central/suppliers' }
    ];
  }
  return [];
});

const pageTitles = {
  '/app/sales/dashboard': 'Sales Dashboard',
  '/app/sales/customer-orders': 'Customer Orders',
  '/app/sales/store-inventory': 'Store Inventory',
  '/app/sales/return-requests': 'Return Requests',
  '/app/regional/dashboard': 'Regional Warehouse Dashboard',
  '/app/regional/inventory-count': 'Count Inventory',
  '/app/regional/dispatch-goods': 'Dispatch Goods',
  '/app/regional/receive-goods': 'Receive & Stock Goods',
  '/app/regional/replenishment': 'Submit Replenishment Application',
  '/app/central/dashboard': 'Central Warehouse Dashboard',
  '/app/central/inventory-count': 'Inventory Count',
  '/app/central/approvals': 'Approve Replenishment',
  '/app/central/suppliers': 'Manage Suppliers'
};

const pageSubtitles = {
  '/app/sales/dashboard': 'Manage customer orders and return requests',
  '/app/sales/customer-orders': 'View and manage all customer orders',
  '/app/sales/store-inventory': 'View inventory across all stores',
  '/app/sales/return-requests': 'Handle customer return requests',
  '/app/regional/dashboard': 'Handle regional operations and stock movements',
  '/app/regional/inventory-count': 'Count on-hand inventory and reconcile data',
  '/app/regional/dispatch-goods': 'Arrange outbound shipments from the region',
  '/app/regional/receive-goods': 'Record receiving and stocking activities',
  '/app/regional/replenishment': 'Submit replenishment applications to central warehouse',
  '/app/central/dashboard': 'Oversee nationwide stock and approvals',
  '/app/central/inventory-count': 'View inventory across all warehouses and stores',
  '/app/central/approvals': 'Review and approve replenishment applications',
  '/app/central/suppliers': 'Maintain supplier partnerships and SLAs'
};

const pageTitle = computed(() => pageTitles[route.path] || 'Inventory & Sales Management System');
const subtitle = computed(() => pageSubtitles[route.path] || '');

const handleLogout = () => {
  appStore.logout();
  router.replace('/');
};
</script>
