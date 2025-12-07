<template>
  <div class="customer-layout">
    <header class="customer-layout__header">
      <div class="customer-layout__brand">
        <span class="customer-layout__brand-name">🛒 Shopping Mall</span>
      </div>
      <nav class="customer-layout__nav">
        <RouterLink to="/customer/shop" class="customer-layout__nav-item">Products</RouterLink>
        <RouterLink to="/customer/orders" class="customer-layout__nav-item">My Orders</RouterLink>
        <RouterLink to="/customer/addresses" class="customer-layout__nav-item">Addresses</RouterLink>
      </nav>
      <div class="customer-layout__user">
        <span class="customer-layout__user-name">{{ appStore.user.name }}</span>
        <button class="btn-secondary" type="button" @click="handleLogout">Logout</button>
      </div>
    </header>
    <main class="customer-layout__main">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router';
import { useAppStore } from '../store/appStore';

const router = useRouter();
const appStore = useAppStore();

const handleLogout = () => {
  appStore.logout();
  router.replace('/');
};
</script>

<style scoped>
.customer-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-background);
}

.customer-layout__header {
  background: linear-gradient(135deg, var(--color-brand), var(--color-brand-dark));
  color: #ffffff;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  box-shadow: var(--shadow-card);
}

.customer-layout__brand {
  display: flex;
  align-items: center;
}

.customer-layout__brand-name {
  font-size: 20px;
  font-weight: 600;
}

.customer-layout__nav {
  display: flex;
  gap: 32px;
  flex: 1;
  justify-content: center;
}

.customer-layout__nav-item {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-weight: 500;
}

.customer-layout__nav-item:hover,
.customer-layout__nav-item.router-link-active {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.customer-layout__user {
  display: flex;
  align-items: center;
  gap: 16px;
}

.customer-layout__user-name {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.customer-layout__main {
  flex: 1;
  padding: 24px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .customer-layout__header {
    flex-direction: column;
    gap: 16px;
  }

  .customer-layout__nav {
    width: 100%;
    justify-content: space-around;
  }

  .customer-layout__user {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
