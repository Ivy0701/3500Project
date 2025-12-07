<template>
  <div class="role-select">
    <div class="role-select__panel">
      <div class="role-select__header">
        <h1>Distributed Inventory and Sales Management System</h1>
        <p>Please select your role</p>
      </div>
      <div class="role-select__options">
        <button
          v-for="roleCard in roleCards"
          :key="roleCard.role"
          class="role-card"
          :class="{ 'role-card--selected': selectedRole === roleCard.role }"
          @click="selectRole(roleCard.role)"
        >
          <div class="role-card__icon">{{ roleCard.icon }}</div>
          <div class="role-card__title">{{ roleCard.title }}</div>
          <div class="role-card__desc">{{ roleCard.desc }}</div>
          <div v-if="roleCard.badge && selectedRole === roleCard.role" class="role-card__badge">
            {{ roleCard.badge }}
          </div>
        </button>
      </div>
      <div v-if="selectedRole" class="role-select__actions">
        <button class="btn-primary" @click="handleContinue">
          {{ selectedRole === 'customer' ? 'Register / Login' : 'Login' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '../store/appStore';

const router = useRouter();
const appStore = useAppStore();
const selectedRole = ref(null);

// 当进入角色选择页面时，如果用户未登录，清除所有存储的角色信息
onMounted(() => {
  if (!appStore.auth.isAuthenticated) {
    appStore.selectedRole = null;
    window.sessionStorage.removeItem('selectedRole');
  }
});
const roleCards = [
  {
    role: 'customer',
    icon: '🛒',
    title: 'Customer',
    desc: 'Purchase products, manage personal orders',
    badge: 'Registration Supported'
  },
  {
    role: 'sales',
    icon: '👔',
    title: 'Sales Staff',
    desc: 'Handle customer orders and store inventory'
  },
  {
    role: 'regionalManager',
    icon: '📦',
    title: 'Regional Warehouse Manager',
    desc: 'Count inventory, dispatch and receive goods'
  },
  {
    role: 'centralManager',
    icon: '🏭',
    title: 'Central Warehouse Manager',
    desc: 'Approve replenishment and manage suppliers'
  }
];

const selectRole = (role) => {
  selectedRole.value = role;
  // 保存选择的角色到store
  appStore.selectedRole = role;
  window.sessionStorage.setItem('selectedRole', role);
};

const handleContinue = () => {
  if (!selectedRole.value) {
    window.alert('Please select your role first');
    return;
  }

  if (selectedRole.value === 'customer') {
    router.push('/customer/register');
  } else {
    router.push(`/staff/login?role=${selectedRole.value}`);
  }
};
</script>

<style scoped>
.role-select {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle at top left, rgba(43, 181, 192, 0.15), transparent 55%),
    radial-gradient(circle at bottom right, rgba(39, 48, 63, 0.2), transparent 45%),
    var(--color-background);
  padding: 48px 16px;
}

.role-select__panel {
  max-width: 800px;
  width: 100%;
  background-color: var(--color-surface);
  border-radius: 24px;
  box-shadow: var(--shadow-card);
  padding: 48px 32px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.role-select__header {
  text-align: center;
}

.role-select__header h1 {
  margin: 0;
  font-size: 28px;
  color: var(--color-brand-dark);
}

.role-select__header p {
  margin: 12px 0 0;
  color: var(--color-text-muted);
  font-size: 16px;
}

.role-select__options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.role-card {
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.role-card:hover {
  border-color: var(--color-brand);
  transform: translateY(-4px);
  box-shadow: var(--shadow-card);
}

.role-card--selected {
  border-color: var(--color-brand);
  background: linear-gradient(135deg, rgba(43, 181, 192, 0.1), #ffffff);
  box-shadow: var(--shadow-card);
}

.role-card__icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.role-card__title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text);
}

.role-card__desc {
  font-size: 14px;
  color: var(--color-text-muted);
  margin-top: 4px;
}

.role-card__badge {
  margin-top: 8px;
  padding: 4px 12px;
  background: var(--color-brand);
  color: #ffffff;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.role-select__actions {
  display: flex;
  justify-content: center;
}

.role-select__actions .btn-primary {
  min-width: 200px;
}

@media (max-width: 768px) {
  .role-select__options {
    grid-template-columns: 1fr;
  }

  .role-select__panel {
    padding: 32px 24px;
  }
}
</style>



