<template>
  <div class="login">
    <div class="login__panel">
      <div class="login__header">
        <h1>{{ title }}</h1>
        <p>{{ subtitle }}</p>
      </div>
      <form class="login__form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label" for="account">Account</label>
          <input
            id="account"
            v-model="form.account"
            class="form-input"
            placeholder="Enter account"
            autocomplete="username"
          />
        </div>
        <div class="form-group">
          <label class="form-label" for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            class="form-input"
            type="password"
            placeholder="Enter password"
            autocomplete="current-password"
          />
        </div>
        <div class="login__captcha">
          <div class="form-group">
            <label class="form-label" for="captcha">Verification Code</label>
            <input
              id="captcha"
              v-model="form.captcha"
              class="form-input"
              placeholder="Enter verification code"
            />
          </div>
          <button type="button" class="login__captcha-image" @click="refreshCaptcha">
            {{ captcha }}
          </button>
        </div>
        <div class="login__actions">
          <button type="button" class="link" @click="onForgotPassword">Forgot Password</button>
          <button v-if="role === 'customer'" type="button" class="link" @click="goToRegister">
            Register
          </button>
        </div>
        <button class="btn-primary login__submit" type="submit" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
      <div v-if="showPresetAccounts" class="login__preset-accounts card">
        <div class="card-header">
          <span>Preset Accounts</span>
          <span class="tag">Test Accounts</span>
        </div>
        <div class="login__preset-list">
          <div v-for="account in presetAccounts" :key="account.account" class="preset-account-item">
            <span class="preset-account__label">Account:</span>
            <span class="preset-account__value" @click="fillAccount(account)">{{ account.account }}</span>
            <span class="preset-account__label">Password:</span>
            <span class="preset-account__value">{{ account.password }}</span>
          </div>
        </div>
        <p class="login__preset-hint">Click account to fill quickly</p>
      </div>
      <div class="login__tips card">
        <div class="card-header">
          <span>Login Tips</span>
          <span class="tag">Security Check</span>
        </div>
        <ul class="login__tips-list">
          <li v-for="tip in tips" :key="tip">{{ tip }}</li>
        </ul>
      </div>
      <div class="login__back">
        <button type="button" class="link" @click="goBack">Back to Role Selection</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAppStore } from '../store/appStore';

const router = useRouter();
const route = useRoute();
const appStore = useAppStore();

const role = computed(() => {
  // Get the role from the URL parameters, or from the store
  return route.query.role || appStore.selectedRole || window.sessionStorage.getItem('selectedRole') || 'customer';
});

const title = computed(() => {
  const titles = {
    customer: 'Customer Login',
    sales: 'Sales Staff Login',
    regionalManager: 'Regional Warehouse Manager Login',
    centralManager: 'Central Warehouse Manager Login'
  };
  return titles[role.value] || 'Login';
});

const subtitle = computed(() => {
  const subtitles = {
    customer: 'Login to purchase products and view orders',
    sales: 'Login to access orders, inventory, reports and other modules',
    regionalManager: 'Login to count inventory, dispatch goods and submit replenishment',
    centralManager: 'Login to approve replenishment and coordinate suppliers'
  };
  return subtitles[role.value] || 'Please login with your account';
});

const tips = computed(() => {
  const tipsMap = {
    customer: [
      'After login, you can purchase products and view orders.',
      'The system will record your shopping history.',
      'Please contact customer service if you have any questions.'
    ],
    sales: [
      'After login, you can access inventory, orders, reports and other modules.',
      'The system will record operation logs to ensure data security.',
      'Please change your password and complete contact information on first login.'
    ],
    regionalManager: [
      'After login, you can count inventory, dispatch goods and submit replenishment.',
      'System logs every operation for traceability.',
      'Please review inbound/outbound schedules daily.'
    ],
    centralManager: [
      'After login, you can approve replenishment and allocate commodities.',
      'Manage suppliers and coordinate transfers between regions.',
      'Review pending approvals before end of day.'
    ]
  };
  return tipsMap[role.value] || [];
});

const showPresetAccounts = computed(() => {
  // Only show preset accounts when sales or warehouse managers login
  return role.value === 'sales' || role.value === 'regionalManager' || role.value === 'centralManager';
});

const PRESET_ACCOUNTS = {
  sales: [
    { account: 'east_store1_sales_01', password: '123456', name: 'East Store 1 Staff 1' },
    { account: 'east_store1_sales_02', password: '123456', name: 'East Store 1 Staff 2' },
    { account: 'east_store2_sales_01', password: '123456', name: 'East Store 2 Staff 1' },
    { account: 'east_store2_sales_02', password: '123456', name: 'East Store 2 Staff 2' },
    { account: 'west_store1_sales_01', password: '123456', name: 'West Store 1 Staff 1' },
    { account: 'west_store1_sales_02', password: '123456', name: 'West Store 1 Staff 2' },
    { account: 'west_store2_sales_01', password: '123456', name: 'West Store 2 Staff 1' },
    { account: 'west_store2_sales_02', password: '123456', name: 'West Store 2 Staff 2' },
    { account: 'north_store1_sales_01', password: '123456', name: 'North Store 1 Staff 1' },
    { account: 'north_store1_sales_02', password: '123456', name: 'North Store 1 Staff 2' },
    { account: 'north_store2_sales_01', password: '123456', name: 'North Store 2 Staff 1' },
    { account: 'north_store2_sales_02', password: '123456', name: 'North Store 2 Staff 2' },
    { account: 'south_store1_sales_01', password: '123456', name: 'South Store 1 Staff 1' },
    { account: 'south_store1_sales_02', password: '123456', name: 'South Store 1 Staff 2' },
    { account: 'south_store2_sales_01', password: '123456', name: 'South Store 2 Staff 1' },
    { account: 'south_store2_sales_02', password: '123456', name: 'South Store 2 Staff 2' }
  ],
  regionalManager: [
    { account: 'east_manager_01', password: '123456', name: 'East Warehouse Manager 1' },
    { account: 'east_manager_02', password: '123456', name: 'East Warehouse Manager 2' },
    { account: 'west_manager_01', password: '123456', name: 'West Warehouse Manager 1' },
    { account: 'west_manager_02', password: '123456', name: 'West Warehouse Manager 2' },
    { account: 'north_manager_01', password: '123456', name: 'North Warehouse Manager 1' },
    { account: 'north_manager_02', password: '123456', name: 'North Warehouse Manager 2' },
    { account: 'south_manager_01', password: '123456', name: 'South Warehouse Manager 1' },
    { account: 'south_manager_02', password: '123456', name: 'South Warehouse Manager 2' }
  ],
  centralManager: [
    { account: 'central001', password: '123456', name: 'Central Warehouse Manager 1' },
    { account: 'central002', password: '123456', name: 'Central Warehouse Manager 2' }
  ]
};

const presetAccounts = computed(() => {
  return PRESET_ACCOUNTS[role.value] || [];
});

const fillAccount = (account) => {
  form.account = account.account;
  form.password = account.password;
};

const form = reactive({
  account: '',
  password: '',
  captcha: ''
});

const generateCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const captcha = ref(generateCaptcha());
const loading = ref(false);

const refreshCaptcha = () => {
  captcha.value = generateCaptcha();
};

const handleSubmit = async () => {
  if (!form.account || !form.password || !form.captcha) {
    window.alert('Please fill in all information');
    return;
  }
  if (form.captcha.toUpperCase() !== captcha.value) {
    window.alert('Verification code is incorrect');
    refreshCaptcha();
    return;
  }
  try {
    loading.value = true;
    await appStore.login({ account: form.account, password: form.password, role: role.value });
    
    // Navigate to different pages based on role
    const redirectMap = {
      customer: '/customer/shop',
      sales: '/app/sales/dashboard',
      regionalManager: '/app/regional/dashboard',
      centralManager: '/app/central/dashboard'
    };
    router.replace(redirectMap[role.value] || '/');
  } catch (error) {
    window.alert(error.message || 'Login failed, please try again');
    refreshCaptcha();
  } finally {
    loading.value = false;
  }
};

const goToRegister = () => {
  router.push('/customer/register');
};

const goBack = () => {
  router.push('/');
};

const onForgotPassword = () => {
  router.push(`/forgot-password?role=${role.value}`);
};
</script>

<style scoped>
.login {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle at top left, rgba(43, 181, 192, 0.15), transparent 55%),
    radial-gradient(circle at bottom right, rgba(39, 48, 63, 0.2), transparent 45%),
    var(--color-background);
  padding: 48px 16px;
}

.login__panel {
  max-width: 480px;
  width: 100%;
  background-color: var(--color-surface);
  border-radius: 24px;
  box-shadow: var(--shadow-card);
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.login__header h1 {
  margin: 0;
  font-size: 24px;
  color: var(--color-brand-dark);
}

.login__header p {
  margin: 8px 0 0;
  color: var(--color-text-muted);
}

.login__form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.login__captcha {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.login__captcha-image {
  width: 108px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(135deg, #2bb5c0, #1f2933);
  color: #ffffff;
  font-weight: 700;
  letter-spacing: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login__actions {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.link {
  background: none;
  border: none;
  color: var(--color-brand);
  padding: 0;
}

.login__submit {
  width: 100%;
  margin-top: 8px;
}

.login__tips.card {
  margin: 0;
}

.login__tips-list {
  margin: 12px 0 0;
  padding-left: 18px;
  color: var(--color-text-muted);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.login__preset-accounts {
  margin: 0;
}

.login__preset-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 12px 0 8px;
}

.preset-account-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--color-background);
  border-radius: 8px;
  font-size: 14px;
}

.preset-account__label {
  color: var(--color-text-muted);
  font-weight: 500;
}

.preset-account__value {
  color: var(--color-brand);
  font-weight: 600;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.preset-account__value:hover {
  background: rgba(43, 181, 192, 0.1);
}

.login__preset-hint {
  margin: 8px 0 0;
  text-align: center;
  font-size: 12px;
  color: var(--color-text-muted);
}

.login__back {
  text-align: center;
  margin-top: 8px;
}
</style>
