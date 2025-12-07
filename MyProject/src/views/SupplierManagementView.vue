<template>
  <div class="suppliers">
    <section class="card">
      <h2 class="section-title">Supplier Overview</h2>
      <div class="suppliers__grid">
        <div v-for="supplier in suppliers" :key="supplier.name" class="suppliers__card">
          <div class="suppliers__card-header">
            <div>
              <h3>{{ supplier.name }}</h3>
              <p>{{ supplier.category }}</p>
            </div>
            <span class="tag" :class="supplier.ratingClass">{{ supplier.rating }}</span>
          </div>
          <div class="suppliers__card-body">
            <span>Lead Time: {{ supplier.leadTime }} days</span>
            <span>Fulfillment: {{ supplier.fulfillmentRate }}%</span>
            <span>Contact: {{ supplier.contact }}</span>
          </div>
          <div class="suppliers__card-footer">
            <button class="btn-secondary" type="button" @click="selectSupplier(supplier)">Manage</button>
          </div>
        </div>
      </div>
    </section>

    <section v-if="selectedSupplier" class="card">
      <h2 class="section-title">Supplier Management · {{ selectedSupplier.name }}</h2>
      <form class="suppliers__form" @submit.prevent="saveSupplier">
        <div class="form-group">
          <label class="form-label" for="level">Cooperation Level *</label>
          <select id="level" v-model="supplierForm.level" class="filter-pill" required>
            <option value="">Select level</option>
            <option value="Strategic">Strategic</option>
            <option value="Core">Core</option>
            <option value="Backup">Backup</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="sla">SLA (days) *</label>
          <input id="sla" v-model.number="supplierForm.sla" class="form-input" type="number" min="1" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="remark">Remark</label>
          <textarea id="remark" v-model="supplierForm.remark" class="form-textarea" rows="3" />
        </div>
        <button class="btn-primary" type="submit">Save Changes</button>
      </form>
    </section>

    <section class="card">
      <h2 class="section-title">Recent Supplier Interactions</h2>
      <div class="timeline">
        <div v-for="interaction in interactions" :key="interaction.id" class="timeline-item">
          <span class="timeline-dot" />
          <div class="timeline-content">
            <span class="timeline-title">{{ interaction.title }}</span>
            <span class="timeline-desc">{{ interaction.desc }}</span>
            <span class="timeline-time">{{ interaction.time }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';

const suppliers = reactive([
  {
    name: 'Fashion Apparel Manufacturing',
    category: 'Apparel OEM',
    rating: 'A',
    ratingClass: 'success',
    leadTime: 5,
    fulfillmentRate: 98,
    contact: 'Ms. Li'
  },
  {
    name: 'Premium Garment Supply Chain',
    category: 'Garment Supply Chain',
    rating: 'A',
    ratingClass: 'info',
    leadTime: 7,
    fulfillmentRate: 96,
    contact: 'Mr. Zhang'
  },
  {
    name: 'Trend Clothing Supplier',
    category: 'Fashion Brand Partner',
    rating: 'B',
    ratingClass: 'success',
    leadTime: 6,
    fulfillmentRate: 95,
    contact: 'Ms. Chen'
  }
]);

const selectedSupplier = ref(null);

const supplierForm = reactive({
  level: 'Strategic',
  sla: 5,
  remark: ''
});

const interactions = reactive([
  {
    id: 'si-1',
    title: 'Fashion Apparel Manufacturing Quarterly Review',
    desc: 'Evaluated new fabric plan and agreed on SLA 5 days',
    time: '2025-11-20 15:30'
  },
  {
    id: 'si-2',
    title: 'Premium Garment Supply Chain Quality Update',
    desc: 'Addressed packaging issue and implemented double-check policy',
    time: '2025-11-18 10:15'
  }
]);

const selectSupplier = (supplier) => {
  selectedSupplier.value = supplier;
  supplierForm.level = 'Strategic';
  supplierForm.sla = supplier.leadTime;
  supplierForm.remark = '';
};

const saveSupplier = () => {
  if (!selectedSupplier.value) {
    return;
  }
  
  // Validate all required fields
  if (!supplierForm.level || !supplierForm.sla || supplierForm.sla < 1) {
    window.alert('Please fill in all required fields (Cooperation Level and SLA must be at least 1 day)');
    return;
  }

  // Update Recent Supplier Interactions
  const now = new Date();
  const timeStr = now.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-');
  
  const interactionDesc = supplierForm.remark.trim() 
    ? `Updated cooperation level to ${supplierForm.level}, SLA to ${supplierForm.sla} days. Note: ${supplierForm.remark}`
    : `Updated cooperation level to ${supplierForm.level}, SLA to ${supplierForm.sla} days`;
  
  interactions.unshift({
    id: `si-${Date.now()}`,
    title: `${selectedSupplier.value.name} Management Update`,
    desc: interactionDesc,
    time: timeStr
  });

  window.alert(`Supplier ${selectedSupplier.value.name} information saved successfully`);
};
</script>

<style scoped>
.suppliers {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
}

.suppliers__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.suppliers__card {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: var(--shadow-soft);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suppliers__card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.suppliers__card-header h3 {
  margin: 0;
  font-size: 18px;
}

.suppliers__card-header p {
  margin: 4px 0 0;
  color: var(--color-text-muted);
  font-size: 14px;
}

.suppliers__card-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: var(--color-text-muted);
  font-size: 14px;
}

.suppliers__card-footer {
  display: flex;
  justify-content: flex-end;
}

.suppliers__form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (max-width: 960px) {
  .suppliers {
    grid-template-columns: 1fr;
  }
}
</style>


