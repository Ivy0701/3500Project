<template>
  <div class="customer-address">
    <div class="customer-address__header">
      <h1>Shipping Addresses</h1>
      <p>Manage your delivery addresses</p>
    </div>

    <button class="btn-primary customer-address__add" @click="showAddModal = true">
      + Add New Address
    </button>

    <div v-if="loading" class="customer-address__loading">
      <p>Loading...</p>
    </div>

    <div v-else-if="addresses.length === 0" class="customer-address__empty">
      <p>No addresses yet. Add your first address!</p>
    </div>

    <div v-else class="customer-address__list">
      <div v-for="address in addresses" :key="address.id" class="address-card card">
        <div class="address-card__header">
          <div class="address-card__name-wrapper">
            <div class="address-card__name">{{ address.name }}</div>
            <span v-if="address.isDefault" class="address-card__badge">Default Address</span>
          </div>
          <div class="address-card__actions">
            <button class="address-card__edit" @click="editAddress(address)">Edit</button>
            <button class="address-card__delete" @click="deleteAddress(address.id)">Delete</button>
          </div>
        </div>
        <div class="address-card__body">
          <p class="address-card__line">
            <strong>Phone:</strong> {{ address.phone }}
          </p>
          <p class="address-card__line">
            <strong>Address:</strong> {{ address.street }}{{ address.city ? `, ${address.city}` : '' }}, {{ address.state }} {{ address.zipCode }}
          </p>
          <p v-if="address.notes" class="address-card__line">
            <strong>Notes:</strong> {{ address.notes }}
          </p>
        </div>
      </div>
    </div>

    <!-- Add/Edit Address Modal -->
    <div v-if="showAddModal || showEditModal" class="address-modal" @click.self="closeModal">
      <div class="address-modal__content">
        <div class="address-modal__header">
          <h2>{{ showEditModal ? 'Edit Address' : 'Add New Address' }}</h2>
          <button class="address-modal__close" @click="closeModal">×</button>
        </div>
        <form class="address-modal__form" @submit.prevent="saveAddress">
          <div class="form-group">
            <label class="form-label" for="name">Full Name *</label>
            <input
              id="name"
              v-model="addressForm.name"
              class="form-input"
              placeholder="Enter full name"
              required
            />
          </div>
          <div class="form-group">
            <label class="form-label" for="phone">Phone Number *</label>
            <div class="phone-row">
              <select
                id="country"
                v-model="addressForm.country"
                class="form-input phone-row__country"
                required
              >
                <option v-for="country in countries" :key="country.code" :value="country.code">
                  {{ country.name }}
                </option>
              </select>
              <div class="phone-row__code-static">
                {{ addressForm.phoneCode }}
              </div>
              <input
                id="phone"
                v-model="addressForm.phone"
                class="form-input phone-row__number"
                :placeholder="currentPhonePlaceholder"
                :maxlength="phoneMaxLength"
                @input="onPhoneInput"
                required
              />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="street">Street Address *</label>
            <input
              id="street"
              v-model="addressForm.street"
              class="form-input"
              placeholder="Enter street address"
              required
            />
          </div>
          <div class="form-group">
            <label class="form-label" for="state">State/Province *</label>
            <select
              id="state"
              v-model="addressForm.state"
              class="form-input"
              required
            >
              <option disabled value="">Select state/province</option>
              <option v-for="state in currentStates" :key="state" :value="state">
                {{ state }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="zipCode">Zip/Postal Code *</label>
            <input
              id="zipCode"
              v-model="addressForm.zipCode"
              class="form-input"
              placeholder="Enter zip code"
              required
            />
          </div>
          <div class="form-group">
            <label class="form-label" for="notes">Delivery Notes (Optional)</label>
            <textarea
              id="notes"
              v-model="addressForm.notes"
              class="form-input"
              placeholder="Any special instructions for delivery"
              rows="3"
            ></textarea>
          </div>
          <div class="form-group">
            <label class="form-checkbox">
              <input
                type="checkbox"
                v-model="addressForm.isDefault"
              />
              Set as default address
            </label>
          </div>
          <div class="address-modal__footer">
            <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>
            <button type="submit" class="btn-primary">Save Address</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';

const loading = ref(false);
const showAddModal = ref(false);
const showEditModal = ref(false);
const addresses = ref([]);
const editingAddressId = ref(null);

const countries = [
  {
    code: 'CN',
    name: 'China',
    phoneCode: '+86',
    cities: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen'],
    states: ['Beijing', 'Shanghai', 'Guangdong', 'Xinjiang']
  },
  {
    code: 'HK',
    name: 'Hong Kong',
    phoneCode: '+852',
    cities: ['Hong Kong Island', 'Kowloon', 'New Territories'],
    states: ['Hong Kong']
  }
];

const addressForm = reactive({
  name: '',
  country: 'CN',
  phoneCode: '+86',
  phone: '',
  street: '',
  state: '',
  zipCode: '',
  notes: '',
  isDefault: false
});

const currentCountry = computed(() => {
  return countries.find(c => c.code === addressForm.country) || countries[0];
});

const currentStates = computed(() => currentCountry.value.states);

const currentPhonePlaceholder = computed(() => {
  return addressForm.phoneCode === '+86' ? '11 digits mobile number' : '8 digits mobile number';
});

const phoneMaxLength = computed(() => {
  return addressForm.phoneCode === '+86' ? 11 : 8;
});

// When country changes, force phoneCode and reset city/state/phone
watch(
  () => addressForm.country,
  (newCode) => {
    const found = countries.find(c => c.code === newCode);
    addressForm.phoneCode = found ? found.phoneCode : '+86';
    addressForm.state = '';
    addressForm.phone = '';
  }
);

const loadAddresses = async () => {
  loading.value = true;
  try {
    // TODO: Load addresses from API
    // For now, use mock data or localStorage
    const stored = localStorage.getItem('customer-addresses');
    if (stored) {
      addresses.value = JSON.parse(stored);
    } else {
      addresses.value = [];
    }
  } catch (error) {
    window.alert('Failed to load addresses: ' + error.message);
  } finally {
    loading.value = false;
  }
};

const editAddress = (address) => {
  editingAddressId.value = address.id;
  Object.assign(addressForm, {
    name: address.name,
    country: address.country || 'CN',
    phoneCode: address.phoneCode || (address.country === 'HK' ? '+852' : '+86'),
    phone: address.phone,
    street: address.street,
    state: address.state,
    zipCode: address.zipCode,
    notes: address.notes || '',
    isDefault: !!address.isDefault
  });
  showEditModal.value = true;
};

const deleteAddress = async (id) => {
  if (!window.confirm('Are you sure you want to delete this address?')) {
    return;
  }
  try {
    // TODO: Delete from API
    addresses.value = addresses.value.filter(addr => addr.id !== id);
    
    // Update localStorage
    localStorage.setItem('customer-addresses', JSON.stringify(addresses.value));
    
    window.alert('Address deleted successfully');
  } catch (error) {
    window.alert('Failed to delete address: ' + error.message);
  }
};

const saveAddress = async () => {
  try {
    // Basic phone validation based on country/phone code
    const numericPhone = addressForm.phone.replace(/\D/g, '');
    const phoneLen = numericPhone.length;
    if (addressForm.phoneCode === '+86' && phoneLen !== 11) {
      window.alert('For China (+86), phone number must be 11 digits.');
      return;
    }
    if (addressForm.phoneCode === '+852' && phoneLen !== 8) {
      window.alert('For Hong Kong (+852), phone number must be 8 digits.');
      return;
    }

    if (addressForm.isDefault) {
      // Remove default flag from other addresses
      addresses.value.forEach(addr => {
        if (addr.id !== editingAddressId.value) {
          addr.isDefault = false;
        }
      });
    }

    const normalizedAddress = {
      ...addressForm,
      phone: `${addressForm.phoneCode} ${numericPhone}`
    };

    if (showEditModal.value && editingAddressId.value) {
      // Update existing address
      const index = addresses.value.findIndex(addr => addr.id === editingAddressId.value);
      if (index > -1) {
        addresses.value[index] = { ...normalizedAddress, id: editingAddressId.value };
      }
    } else {
      // Add new address
      const newAddress = {
        ...normalizedAddress,
        id: `addr-${Date.now()}`
      };
      addresses.value.push(newAddress);
    }

    // Update localStorage
    localStorage.setItem('customer-addresses', JSON.stringify(addresses.value));

    // TODO: Save to API

    closeModal();
    window.alert('Address saved successfully');
  } catch (error) {
    window.alert('Failed to save address: ' + error.message);
  }
};

const closeModal = () => {
  showAddModal.value = false;
  showEditModal.value = false;
  editingAddressId.value = null;
  Object.assign(addressForm, {
    name: '',
    country: 'CN',
    phoneCode: '+86',
    phone: '',
    street: '',
    state: '',
    zipCode: '',
    notes: '',
    isDefault: false
  });
};

const onPhoneInput = (event) => {
  const numeric = event.target.value.replace(/\D/g, '').slice(0, phoneMaxLength.value);
  addressForm.phone = numeric;
};

onMounted(() => {
  loadAddresses();
});
</script>

<style scoped>
.customer-address {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.customer-address__header {
  text-align: center;
  margin-bottom: 16px;
}

.customer-address__header h1 {
  margin: 0;
  font-size: 28px;
  color: var(--color-text);
}

.customer-address__header p {
  margin: 8px 0 0;
  color: var(--color-text-muted);
}

.customer-address__add {
  max-width: 200px;
}

.customer-address__loading,
.customer-address__empty {
  text-align: center;
  padding: 48px;
  color: var(--color-text-muted);
}

.customer-address__list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.address-card {
  padding: 20px;
  position: relative;
}

.address-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.address-card__name-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.address-card__name {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
}

.address-card__actions {
  display: flex;
  gap: 12px;
}

.address-card__edit,
.address-card__delete {
  padding: 4px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.address-card__edit {
  background: var(--color-brand);
  color: #ffffff;
}

.address-card__edit:hover {
  background: var(--color-brand-dark);
}

.address-card__delete {
  background: #f25056;
  color: #ffffff;
}

.address-card__delete:hover {
  background: #d43f45;
}

.address-card__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.address-card__line {
  margin: 0;
  font-size: 14px;
  color: var(--color-text);
  line-height: 1.6;
}

.address-card__line strong {
  color: var(--color-text-muted);
  margin-right: 8px;
}

.address-card__badge {
  padding: 4px 12px;
  background: var(--color-brand);
  color: #ffffff;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.address-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.address-modal__content {
  background: var(--color-surface);
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.address-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.address-modal__header h2 {
  margin: 0;
  font-size: 20px;
}

.address-modal__close {
  background: none;
  border: none;
  font-size: 32px;
  color: var(--color-text-muted);
  cursor: pointer;
  line-height: 1;
}

.address-modal__form {
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.form-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.address-modal__footer {
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>



