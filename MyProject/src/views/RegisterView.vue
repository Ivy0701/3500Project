<template>
  <div class="register">
    <div class="register__panel">
      <div class="register__header">
        <h1>Customer Registration</h1>
        <p>After registration, you can purchase products and view orders.</p>
      </div>
      <form class="register__form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label" for="name">Name</label>
          <input
            id="name"
            v-model="form.name"
            class="form-input"
            placeholder="Enter your name"
            autocomplete="name"
          />
        </div>
        <div class="form-group">
          <label class="form-label" for="account">Account</label>
          <input
            id="account"
            v-model="form.account"
            class="form-input"
            placeholder="Enter account (email or phone)"
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
            placeholder="At least 6 characters"
            autocomplete="new-password"
          />
        </div>
        <div class="form-group">
          <label class="form-label" for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            class="form-input"
            type="password"
            placeholder="Enter password again"
            autocomplete="new-password"
          />
        </div>
        <button class="btn-primary register__submit" type="submit" :disabled="loading">
          {{ loading ? 'Submitting...' : 'Register and Login' }}
        </button>
        <p class="register__footer">
          Already have an account?
          <button type="button" class="link" @click="goToLogin">Back to Login</button>
        </p>
      </form>
      <div class="register__back">
        <button type="button" class="link" @click="goBack">Back to Role Selection</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useAppStore } from '../store/appStore';

const router = useRouter();
const appStore = useAppStore();

const form = reactive({
  name: '',
  account: '',
  password: '',
  confirmPassword: ''
});

const loading = ref(false);

const handleSubmit = async () => {
  if (!form.name || !form.account || !form.password || !form.confirmPassword) {
    window.alert('Please fill in all information');
    return;
  }

  if (form.password.length < 6) {
    window.alert('Password must be at least 6 characters');
    return;
  }

  if (form.password !== form.confirmPassword) {
    window.alert('Passwords do not match');
    return;
  }

  try {
    loading.value = true;
    // Registration API automatically sets role to customer
    await appStore.register({
      name: form.name,
      account: form.account,
      password: form.password
    });
    router.replace('/customer/shop');
  } catch (error) {
    window.alert(error.message || 'Registration failed, please try again later');
  } finally {
    loading.value = false;
  }
};

const goToLogin = () => {
  router.push('/customer/login');
};

const goBack = () => {
  router.push('/');
};
</script>

<style scoped>
.register {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle at top left, rgba(43, 181, 192, 0.15), transparent 55%),
    radial-gradient(circle at bottom right, rgba(39, 48, 63, 0.2), transparent 45%),
    var(--color-background);
  padding: 48px 16px;
}

.register__panel {
  max-width: 520px;
  width: 100%;
  background-color: var(--color-surface);
  border-radius: 24px;
  box-shadow: var(--shadow-card);
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.register__header h1 {
  margin: 0;
  font-size: 26px;
  color: var(--color-brand-dark);
}

.register__header p {
  margin: 8px 0 0;
  color: var(--color-text-muted);
}

.register__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.register__submit {
  width: 100%;
  margin-top: 8px;
}

.register__footer {
  text-align: center;
  color: var(--color-text-muted);
  margin: 0;
}

.link {
  color: var(--color-brand);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.register__back {
  text-align: center;
  margin-top: 8px;
}
</style>



