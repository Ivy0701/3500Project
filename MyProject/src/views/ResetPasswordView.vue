<template>
  <div class="reset-password">
    <div class="reset-password__panel">
      <div class="reset-password__header">
        <h1>Reset Password</h1>
        <p>Please enter your new password</p>
      </div>
      <form class="reset-password__form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label" for="newPassword">New Password</label>
          <input
            id="newPassword"
            v-model="form.newPassword"
            class="form-input"
            type="password"
            placeholder="At least 6 characters"
            autocomplete="new-password"
            required
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
            required
          />
        </div>
        <div v-if="errorMessage" class="reset-password__error">
          {{ errorMessage }}
        </div>
        <button class="btn-primary reset-password__submit" type="submit" :disabled="loading">
          {{ loading ? 'Resetting...' : 'Reset Password' }}
        </button>
        <div class="reset-password__back">
          <button type="button" class="link" @click="goBack">Back to Login</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { resetPassword } from '../services/authService';

const router = useRouter();
const route = useRoute();

const form = reactive({
  newPassword: '',
  confirmPassword: ''
});

const loading = ref(false);
const errorMessage = ref('');

onMounted(() => {
  // Check if user has verified their identity
  const verifiedAccount = window.sessionStorage.getItem('passwordResetAccount');
  if (!verifiedAccount) {
    // If not verified, redirect to forgot password page
    const role = route.query.role || 'customer';
    router.replace(`/forgot-password?role=${role}`);
  }
});

const handleSubmit = async () => {
  if (!form.newPassword || !form.confirmPassword) {
    errorMessage.value = 'Please fill in all information';
    return;
  }

  if (form.newPassword.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters';
    return;
  }

  if (form.newPassword !== form.confirmPassword) {
    errorMessage.value = 'Passwords do not match';
    return;
  }

  const verifiedAccount = window.sessionStorage.getItem('passwordResetAccount');
  if (!verifiedAccount) {
    errorMessage.value = 'Please verify your identity first';
    const role = route.query.role || 'customer';
    router.replace(`/forgot-password?role=${role}`);
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  try {
    await resetPassword({
      account: verifiedAccount,
      newPassword: form.newPassword
    });
    
    // Clear the verification token
    window.sessionStorage.removeItem('passwordResetAccount');
    
    window.alert('Password reset successfully! Please login with your new password.');
    
    // Navigate to login page
    const role = route.query.role || 'customer';
    if (role === 'customer') {
      router.replace('/customer/login');
    } else {
      router.replace(`/staff/login?role=${role}`);
    }
  } catch (error) {
    errorMessage.value = error.message || 'Failed to reset password, please try again';
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
.reset-password {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle at top left, rgba(43, 181, 192, 0.15), transparent 55%),
    radial-gradient(circle at bottom right, rgba(39, 48, 63, 0.2), transparent 45%),
    var(--color-background);
  padding: 48px 16px;
}

.reset-password__panel {
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

.reset-password__header h1 {
  margin: 0;
  font-size: 24px;
  color: var(--color-brand-dark);
}

.reset-password__header p {
  margin: 8px 0 0;
  color: var(--color-text-muted);
}

.reset-password__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.reset-password__error {
  padding: 12px 16px;
  border-radius: 12px;
  background-color: rgba(242, 80, 86, 0.1);
  color: var(--color-danger);
  font-size: 14px;
}

.reset-password__submit {
  width: 100%;
  margin-top: 8px;
}

.reset-password__back {
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


