<template>
  <div class="dashboard">
<section class="card dashboard__welcome">
      <header class="dashboard__welcome-header">
        <div>
          <h2>Welcome back, {{ appStore.user.name }}</h2>
          <p>{{ taskCount }} tasks to handle today</p>
        </div>
        <span class="tag">Alerts {{ alerts.length }}</span>
      </header>
      <div class="dashboard__actions">
        <RouterLink
          v-for="action in welcomeActions"
          :key="action.to"
          :class="action.class"
          :to="action.to"
        >
          {{ action.label }}
        </RouterLink>
      </div>
    </section>

    <section class="card">
      <h3 class="section-title">Common Functions</h3>
      <div class="dashboard__grid">
        <RouterLink
          v-for="item in shortcuts"
          :key="item.to"
          :to="item.to"
          class="dashboard__grid-item"
        >
          <div class="dashboard__grid-icon">{{ item.icon }}</div>
          <div class="dashboard__grid-title">{{ item.title }}</div>
          <div class="dashboard__grid-desc">{{ item.desc }}</div>
        </RouterLink>
      </div>
    </section>

    <section v-if="userRole === 'regionalManager'" class="card">
      <h3 class="section-title">Inventory Alerts</h3>
      <div v-if="alerts.length" class="list">
        <div v-for="alert in alerts" :key="alert.id" class="list-item dashboard__alert">
          <div class="dashboard__alert-header">
            <span>{{ alert.name }}</span>
            <span class="tag danger">{{ alert.status }}</span>
          </div>
          <div class="dashboard__alert-body">
            <span>Available Stock: {{ alert.stock }} {{ alert.unit }}</span>
            <span>Safety Threshold: {{ alert.threshold }}</span>
          </div>
        </div>
      </div>
      <p v-else class="empty">No inventory alerts</p>
    </section>

    <section v-if="userRole === 'sales'" class="card">
      <h3 class="section-title">Pending Return Requests</h3>
      <div v-if="pendingAfterSalesRequests.length" class="list">
        <div v-for="request in pendingAfterSalesRequests" :key="request.id" class="list-item dashboard__task">
          <div class="dashboard__task-header">
            <span>Order {{ request.orderNumber }}</span>
            <span class="tag" :class="request.priority">{{ request.priorityLabel }}</span>
          </div>
          <div class="dashboard__task-body">
            <span>{{ request.customerName }} - {{ request.typeLabel }}: {{ request.reason }}</span>
            <span class="dashboard__task-deadline">Requested: {{ request.requestDate }}</span>
          </div>
        </div>
      </div>
      <p v-else class="empty">No pending return requests</p>
    </section>

    <section v-if="userRole === 'regionalManager'" class="card">
      <h3 class="section-title">Pending Replenishment Tasks</h3>
      <div v-if="tasksForRole.length" class="list">
        <div v-for="task in tasksForRole" :key="task.id" class="list-item dashboard__task">
          <div class="dashboard__task-header">
            <span>{{ task.title }}</span>
            <span class="tag" :class="task.priority">{{ task.priorityLabel }}</span>
          </div>
          <div class="dashboard__task-body">
            <span>{{ task.desc }}</span>
            <span class="dashboard__task-deadline">Deadline: {{ task.deadline }}</span>
          </div>
        </div>
      </div>
      <p v-else class="empty">No pending replenishment tasks</p>
    </section>

    <section v-if="userRole === 'centralManager'" class="card">
      <h3 class="section-title">Approval Queue</h3>
      <div v-if="centralApprovalQueue.length" class="list">
        <div v-for="item in centralApprovalQueue" :key="item.id" class="list-item dashboard__task">
          <div class="dashboard__task-header">
            <span>{{ item.id }} · {{ item.product }}</span>
            <span class="tag" :class="item.level">{{ item.levelLabel }}</span>
          </div>
          <div class="dashboard__task-body">
            <span>{{ item.warehouse }} requests {{ item.quantity }} units</span>
            <span class="dashboard__task-deadline">Submitted: {{ item.time }}</span>
          </div>
        </div>
      </div>
      <p v-else class="empty">No pending approvals</p>
    </section>

    <section v-if="userRole === 'centralManager'" class="card">
      <h3 class="section-title">Supplier Follow-ups</h3>
      <div v-if="supplierFollowUps.length" class="list">
        <div v-for="follow in supplierFollowUps" :key="follow.id" class="list-item dashboard__task">
          <div class="dashboard__task-header">
            <span>{{ follow.title }}</span>
            <span class="tag info">Supplier</span>
          </div>
          <div class="dashboard__task-body">
            <span>{{ follow.desc }}</span>
            <span class="dashboard__task-deadline">Next Check: {{ follow.deadline }}</span>
          </div>
        </div>
      </div>
      <p v-else class="empty">No supplier tasks</p>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useAppStore } from '../store/appStore';
import { fetchReplenishmentAlerts, fetchReplenishmentApplications } from '../services/replenishmentService';
import { fetchTransfers } from '../services/transferService';
import { fetchOrders } from '../services/orderService';

const appStore = useAppStore();
const route = useRoute();

const userRole = computed(() => appStore.user.role);

// Inventory alerts for regional warehouse managers (from backend)
const inventoryAlerts = ref([]);
// Pending replenishment tasks for regional warehouse managers (from backend)
const pendingReplenishmentTasks = ref([]);
// Pending approval queue for central warehouse managers (from backend)
const centralApprovalQueue = ref([]);

// Determine which data source to use based on the role
const alerts = computed(() => {
  if (userRole.value === 'regionalManager') {
    return inventoryAlerts.value;
  }
  // Other roles use static data in the store
  return appStore.alerts;
});

// Pending after-sales requests for sales (from database)
const pendingAfterSalesRequests = ref([]);

const tasksForRole = computed(() => {
  if (userRole.value === 'regionalManager') {
    return pendingReplenishmentTasks.value;
  }
  // Sales no longer use fake data, use real after-sales requests
  if (userRole.value === 'sales') {
    return [];
  }
  // Other roles use static data in the store
  return appStore.tasks.filter((task) => task.role === userRole.value);
});

const taskCount = computed(() => {
  if (userRole.value === 'sales') {
    return pendingAfterSalesRequests.value.length;
  }
  if (userRole.value === 'centralManager') {
    return centralApprovalQueue.value.length;
  }
  return tasksForRole.value.length;
});

// Load pending after-sales requests for sales
const loadSalesAfterSalesRequests = async () => {
  try {
    const orders = await fetchOrders();
    // Filter out orders with after-sales requests and status is pending
    const pendingRequests = orders
      .filter(o => o.afterSales && o.afterSales.type && o.afterSales.reason && o.afterSales.status === 'pending')
      .map(o => {
        // Determine priority based on the order amount
        const amount = o.totalAmount || 0;
        let priority = 'info';
        let priorityLabel = 'Medium';
        
        if (amount >= 5000) {
          priority = 'warning';
          priorityLabel = 'High';
        } else if (amount >= 2000) {
          priority = 'info';
          priorityLabel = 'Medium';
        } else {
          priority = 'default';
          priorityLabel = 'Low';
        }
        
        // Format the request date
        const requestDate = o.afterSales.createdAt || o.updatedAt || o.createdAt;
        let dateText = 'N/A';
        if (requestDate) {
          const date = new Date(requestDate);
          const now = new Date();
          const diffTime = now - date;
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 0) {
            dateText = `Today ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
          } else if (diffDays === 1) {
            dateText = `Yesterday ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
          } else {
            dateText = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
          }
        }
        
        return {
          id: o.id,
          orderNumber: o.orderNumber || o.id,
          customerName: o.customerName || 'Customer',
          type: o.afterSales.type,
          typeLabel: o.afterSales.type === 'exchange' ? 'Exchange' : 'Refund',
          reason: o.afterSales.reason,
          requestDate: dateText,
          priority,
          priorityLabel,
          amount: o.totalAmount || 0
        };
      });
    
    pendingAfterSalesRequests.value = pendingRequests;
  } catch (error) {
    console.error('Failed to load after-sales requests:', error);
    pendingAfterSalesRequests.value = [];
  }
};

// Load actual data for regional warehouse managers
const loadRegionalManagerData = async () => {
  try {
    // 1. Get inventory alerts (ReplenishmentAlert) - for Inventory Alerts
    const alertsData = await fetchReplenishmentAlerts();
    inventoryAlerts.value = alertsData.map(alert => {
      // Determine status based on the inventory level
      let status = 'Low Stock';
      if (alert.level === 'danger' || alert.stock === 0) {
        status = 'Critically Low';
      } else if (alert.stock < (alert.threshold || 0) * 0.5) {
        status = 'Critically Low';
      }
      
      return {
        id: alert.alertId || alert._id,
        name: alert.productName || alert.productId,
        stock: alert.stock || 0,
        unit: 'units',
        threshold: alert.threshold || 0,
        status,
        level: alert.level || 'warning'
      };
    });

    // 2. Get pending dispatch orders (TransferOrder with status PENDING) - for Pending Replenishment Tasks
    const locationId = appStore.user.assignedLocationId || appStore.user.accessibleLocationIds?.[0] || 'WH-EAST';
    const transfers = await fetchTransfers(locationId);
    
    // Filter out dispatch orders with status PENDING (pending dispatch orders)
    const pendingTransfers = transfers.filter(transfer => transfer.status === 'PENDING');
    
    pendingReplenishmentTasks.value = pendingTransfers.map(transfer => {
      // Determine priority based on the replenishment quantity: the more quantity, the higher the urgency
      const quantity = transfer.quantity || 0;
      let priority = 'info';
      let priorityLabel = 'Medium';
      
      if (quantity >= 150) {
        // More than 150 units: High
        priority = 'warning';
        priorityLabel = 'High';
      } else if (quantity >= 100) {
        // 100-149 units: Medium-High
        priority = 'info';
        priorityLabel = 'Medium';
      } else if (quantity >= 50) {
        // 50-99 units: Medium
        priority = 'info';
        priorityLabel = 'Medium';
      } else {
        // Less than 50 units: Low
        priority = 'default';
        priorityLabel = 'Low';
      }
      
      // Format the deadline (using the creation time + estimated processing time)
      const createdAt = new Date(transfer.createdAt);
      const estimatedDeadline = new Date(createdAt.getTime() + 2 * 24 * 3600 * 1000); // 2 days later
      const nowDate = new Date();
      const today = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
      const deadlineDay = new Date(estimatedDeadline.getFullYear(), estimatedDeadline.getMonth(), estimatedDeadline.getDate());
      
      const diffDays = Math.floor((deadlineDay - today) / (1000 * 60 * 60 * 24));
      
      let deadlineText = 'N/A';
      if (diffDays === 0) {
        deadlineText = `Today ${estimatedDeadline.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
      } else if (diffDays === 1) {
        deadlineText = `Tomorrow ${estimatedDeadline.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
      } else if (diffDays > 1) {
        deadlineText = estimatedDeadline.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      }
      
      return {
        id: transfer.transferId || transfer._id,
        title: `${transfer.transferId || 'TRF'} - ${transfer.productName || transfer.productSku}`,
        desc: `Transfer ${transfer.quantity} units to ${transfer.toLocationName || transfer.toLocationId}`,
        deadline: deadlineText,
        priority,
        priorityLabel
      };
    });
    
  } catch (error) {
    console.error('Failed to load regional manager data:', error);
    // If loading fails, use an empty array
    inventoryAlerts.value = [];
    pendingReplenishmentTasks.value = [];
  }
};

// Load pending approval queue for central warehouse managers
const loadCentralManagerData = async () => {
  try {
    const allApplications = await fetchReplenishmentApplications();
    
    // Remove duplicates: remove duplicates based on requestId, keep the latest record
    const uniqueApplications = [];
    const seenRequestIds = new Set();
    for (const app of allApplications) {
      if (!seenRequestIds.has(app.requestId)) {
        seenRequestIds.add(app.requestId);
        uniqueApplications.push(app);
      }
    }
    
    // Pending applications: PENDING and PROCESSING status
    const pendingStatuses = ['PENDING', 'PROCESSING'];
    const pendingApps = uniqueApplications.filter((item) => pendingStatuses.includes(item.status));
    
    // Map to the format displayed on the Dashboard
    centralApprovalQueue.value = pendingApps.map(app => {
      // Determine priority based on the inventory level and quantity
      let level = 'info';
      let levelLabel = 'Review';
      
      // If the stock is 0 or critically low, mark as Urgent
      const stock = app.stock || 0;
      const threshold = app.threshold || 0;
      if (stock === 0 || stock < threshold * 0.5) {
        level = 'warning';
        levelLabel = 'Urgent';
      } else if (app.quantity >= 200) {
        level = 'warning';
        levelLabel = 'Urgent';
      } else if (app.quantity >= 100) {
        level = 'info';
        levelLabel = 'Review';
      } else {
        level = 'default';
        levelLabel = 'Normal';
      }
      
      // Format the submission time
      const submittedAt = app.createdAt || app.updatedAt || new Date();
      const date = new Date(submittedAt);
      const timeText = date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      
      return {
        id: app.requestId,
        product: app.productName || app.productId,
        warehouse: app.warehouseName || app.warehouseId || 'Unknown',
        quantity: app.quantity || 0,
        time: timeText,
        level,
        levelLabel
      };
    });
  } catch (error) {
    console.error('Failed to load central manager approval queue:', error);
    centralApprovalQueue.value = [];
  }
};

onMounted(() => {
  if (userRole.value === 'sales') {
    loadSalesAfterSalesRequests();
    // Periodically refresh after-sales requests
    setInterval(() => {
      loadSalesAfterSalesRequests();
    }, 10000); // Every 10 seconds refresh
  } else if (userRole.value === 'regionalManager') {
    loadRegionalManagerData();
    // Periodically refresh regional manager data
    setInterval(() => {
      loadRegionalManagerData();
    }, 10000); // Every 10 seconds refresh
  } else if (userRole.value === 'centralManager') {
    loadCentralManagerData();
    // Periodically refresh central warehouse manager data
    setInterval(() => {
      loadCentralManagerData();
    }, 10000); // Every 10 seconds refresh
  }
});

// Listen for user role changes, reload data
watch(userRole, (newRole) => {
  if (newRole === 'sales') {
    loadSalesAfterSalesRequests();
  } else if (newRole === 'regionalManager') {
    loadRegionalManagerData();
  } else if (newRole === 'centralManager') {
    loadCentralManagerData();
  } else {
    // If it is not a known role, clear the data
    pendingAfterSalesRequests.value = [];
    inventoryAlerts.value = [];
    pendingReplenishmentTasks.value = [];
    centralApprovalQueue.value = [];
  }
});

const supplierFollowUps = ref([
  { id: 'sup-1', title: 'JingCai SLA Renewal', desc: 'Confirm 2026 capacity planning', deadline: 'Next Monday' },
  { id: 'sup-2', title: 'HuaTeng Quality Audit', desc: 'Follow up on packaging improvement', deadline: 'Dec 02' }
]);

// Display different function cards based on the role
const shortcuts = computed(() => {
  if (userRole.value === 'sales') {
    return [
      { title: 'Customer Orders', desc: 'View and manage customer orders', icon: '🧾', to: '/app/sales/customer-orders' },
      { title: 'Store Inventory', desc: 'View inventory across all stores', icon: '📦', to: '/app/sales/store-inventory' },
      { title: 'Return Requests', desc: 'Handle customer return requests', icon: '↩️', to: '/app/sales/return-requests' }
    ];
  } else if (userRole.value === 'regionalManager') {
    return [
      { title: 'Inventory Count', desc: 'Check stock levels and discrepancies', icon: '🧮', to: '/app/regional/inventory-count' },
      { title: 'Dispatch Goods', desc: 'Arrange outbound shipments', icon: '🚚', to: '/app/regional/dispatch-goods' },
      { title: 'Receive Goods', desc: 'Record inbound operations', icon: '📥', to: '/app/regional/receive-goods' },
      { title: 'Replenishment', desc: 'Submit replenishment requests', icon: '🔁', to: '/app/regional/replenishment' }
    ];
  } else if (userRole.value === 'centralManager') {
    return [
      { title: 'Inventory Count', desc: 'View inventory across all warehouses and stores', icon: '📊', to: '/app/central/inventory-count' },
      { title: 'Approve Replenishment', desc: 'Review and approve replenishment applications', icon: '✅', to: '/app/central/approvals' },
      { title: 'Manage Suppliers', desc: 'Maintain supplier performance', icon: '🤝', to: '/app/central/suppliers' }
    ];
  }
  return [];
});

const welcomeActions = computed(() => {
  if (userRole.value === 'sales') {
    return [
      { label: 'View Customer Orders', to: '/app/sales/customer-orders', class: 'btn-primary' },
      { label: 'Handle Return Requests', to: '/app/sales/return-requests', class: 'btn-secondary' }
    ];
  } else if (userRole.value === 'regionalManager') {
    return [
      { label: 'Count Inventory', to: '/app/regional/inventory-count', class: 'btn-primary' },
      { label: 'Submit Replenishment', to: '/app/regional/replenishment', class: 'btn-secondary' }
    ];
  } else if (userRole.value === 'centralManager') {
    return [
      { label: 'Review Applications', to: '/app/central/approvals', class: 'btn-primary' },
      { label: 'Manage Suppliers', to: '/app/central/suppliers', class: 'btn-secondary' }
    ];
  }
  return [];
});
</script>

<style scoped>
.dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
}

.dashboard__welcome {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, rgba(43, 181, 192, 0.15), #ffffff);
}

.dashboard__welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard__welcome-header h2 {
  margin: 0;
  font-size: 24px;
}

.dashboard__welcome-header p {
  margin: 8px 0 0;
  color: var(--color-text-muted);
}

.dashboard__actions {
  margin-top: 18px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.dashboard__actions .btn-primary,
.dashboard__actions .btn-secondary {
  flex: 1 1 180px;
  text-align: center;
}

.dashboard__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.dashboard__grid-item {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--shadow-soft);
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--color-text);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.dashboard__grid-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card);
}

.dashboard__grid-icon {
  font-size: 32px;
}

.dashboard__grid-title {
  font-weight: 600;
}

.dashboard__grid-desc {
  color: var(--color-text-muted);
  font-size: 14px;
}

.dashboard__alert {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dashboard__alert-header,
.dashboard__alert-body {
  display: flex;
  justify-content: space-between;
}

.dashboard__task {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dashboard__task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard__task-body {
  display: flex;
  justify-content: space-between;
  color: var(--color-text-muted);
  font-size: 14px;
}

.dashboard__task-deadline {
  color: #9ca3af;
}

@media (max-width: 960px) {
  .dashboard {
    grid-template-columns: 1fr;
  }
}
</style>