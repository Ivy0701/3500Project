<template>
  <div class="forgot-password">
    <div class="forgot-password__panel">
      <div class="forgot-password__header">
        <h1>Forgot Password</h1>
        <p>Please enter your account and name to verify your identity</p>
      </div>
      <form class="forgot-password__form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label" for="account">Account</label>
          <input
            id="account"
            v-model="form.account"
            class="form-input"
            placeholder="Enter your account"
            autocomplete="username"
            required
          />
        </div>
        <div class="form-group">
          <label class="form-label" for="name">Name</label>
          <input
            id="name"
            v-model="form.name"
            class="form-input"
            placeholder="Enter your registered name"
            autocomplete="name"
            required
          />
        </div>
        <div v-if="errorMessage" class="forgot-password__error">
          {{ errorMessage }}
        </div>
        <button class="btn-primary forgot-password__submit" type="submit" :disabled="loading">
          {{ loading ? 'Verifying...' : 'Submit' }}
        </button>
        <div class="forgot-password__back">
          <button type="button" class="link" @click="goBack">Back to Login</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { verifyUserForPasswordReset } from '../services/authService';

const router = useRouter();
const route = useRoute();

const form = reactive({
  account: '',
  name: ''
});

const loading = ref(false);
const errorMessage = ref('');

const handleSubmit = async () => {
  if (!form.account || !form.name) {
    errorMessage.value = 'Please fill in all information';
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  try {
    await verifyUserForPasswordReset({
      account: form.account,
      name: form.name
    });
    
    // Store verified account in sessionStorage for reset password page
    window.sessionStorage.setItem('passwordResetAccount', form.account);
    
    // Navigate to reset password page with role parameter
    const role = route.query.role || 'customer';
    router.push(`/reset-password?role=${role}`);
  } catch (error) {
    errorMessage.value = error.message || 'Username or name is incorrect, please try again';
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  const role = route.query.role || 'customer';
  if (role === 'customer') {
    router.push('/customer/login');
  } else {
    router.push(`/staff/login?role=${role}`);
  }
};
</script>

<style scoped>
.forgot-password {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle at top left, rgba(43, 181, 192, 0.15), transparent 55%),
    radial-gradient(circle at bottom right, rgba(39, 48, 63, 0.2), transparent 45%),
    var(--color-background);
  padding: 48px 16px;
}

.forgot-password__panel {
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

.forgot-password__header h1 {
  margin: 0;
  font-size: 24px;
  color: var(--color-brand-dark);
}

.forgot-password__header p {
  margin: 8px 0 0;
  color: var(--color-text-muted);
}

.forgot-password__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.forgot-password__error {
  padding: 12px 16px;
  border-radius: 12px;
  background-color: rgba(242, 80, 86, 0.1);
  color: var(--color-danger);
  font-size: 14px;
}

.forgot-password__submit {
  width: 100%;
  margin-top: 8px;
}

.forgot-password__back {
  text-align: center;
  margin-top: 8px;
}

.link {
  background: none;
  border: none;
  color: var(--color-brand);
  padding: 0;
  cursor: pointer;
  font-size: 14px;
}

.link:hover {
  text-decoration: underline;
}
</style>


