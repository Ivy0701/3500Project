<template>
  <div class="approval">
    <!-- 1. Pending Replenishment Applications -->
    <section class="card approval__pending">
      <h2 class="section-title">Pending Replenishment Applications</h2>
      <div v-if="loading && !applications.length" class="empty-hint">Loading...</div>
      <div v-else class="approval__table">
        <div class="approval__table-header">
          <span class="col col-wide">Application</span>
          <span class="col">Warehouse</span>
          <span class="col">Quantity</span>
          <span class="col">Status</span>
        </div>
        <div
          v-for="application in applications"
          :key="application.requestId"
          class="approval__table-row"
          :class="{ 'approval__table-row--active': selectedApplication?.requestId === application.requestId }"
          @click="selectApplication(application)"
        >
          <div class="col col-wide">
            <div class="approval__row-title">{{ application.requestId }}</div>
            <div class="approval__row-meta">{{ application.productName }} (SKU: {{ application.productId }}) · Trigger: {{ application.reason }}</div>
          </div>
          <span class="col">{{ application.warehouseName }}</span>
          <span class="col">{{ application.quantity }}</span>
          <span class="col">
            <span class="tag" :class="applicationStatusClass(application.status)">
              {{ applicationStatusLabel(application.status) }}
            </span>
          </span>
        </div>
        <p v-if="!loading && !applications.length" class="empty-hint">No pending applications</p>
      </div>
    </section>

    <!-- 2. Application Details -->
    <section class="card approval__details">
      <h2 class="section-title">Application Details</h2>
      <div v-if="selectedApplication" class="approval__detail">
        <div><strong>Product:</strong> {{ selectedApplication.productName }}</div>
        <div><strong>SKU:</strong> {{ selectedApplication.productId }}</div>
        <div><strong>Warehouse:</strong> {{ selectedApplication.warehouseName }}</div>
        <div><strong>Restock Quantity:</strong> {{ selectedApplication.quantity }}</div>
        <div><strong>Suggested Vendor:</strong> {{ selectedApplication.vendor }}</div>
        <div><strong>Expected Arrival:</strong> {{ new Date(selectedApplication.deliveryDate).toLocaleDateString() }}</div>
        <div><strong>Reason:</strong> {{ selectedApplication.reason || 'N/A' }}</div>
      </div>
      <p v-else class="empty-hint">Select an application to view details</p>
      
      <!-- Decision Section -->
      <div
        v-if="selectedApplication && ['PENDING', 'PROCESSING'].includes(selectedApplication.status)"
        class="approval__decision"
      >
        <label class="form-label">Decision</label>
        <div class="approval__decision-actions">
          <button class="btn-primary" type="button" @click="approve(true)">Approve</button>
          <button class="btn-secondary" type="button" @click="approve(false)">Reject</button>
        </div>
        <textarea
          v-model="decisionRemark"
          class="form-textarea"
          rows="3"
          placeholder="Approval remark"
        />
      </div>
    </section>

    <!-- 3. Recent Allocations -->
    <section class="card approval__allocations">
      <h2 class="section-title">Recent Allocations</h2>
      <div v-if="loading && !recentAllocations.length" class="empty-hint">Loading...</div>
      <div v-else class="approval__table">
        <div class="approval__table-header">
          <span class="col col-wide">Transfer ID</span>
          <span class="col">From → To</span>
          <span class="col">Product</span>
          <span class="col">Status</span>
        </div>
        <div
          v-for="transfer in recentAllocations"
          :key="transfer.transferId"
          class="approval__table-row"
        >
          <div class="col col-wide">
            <div class="approval__row-title">{{ transfer.transferId }}</div>
            <div class="approval__row-meta">
              {{ transfer.productSku }} · {{ transfer.quantity }} units · 
              {{ new Date(transfer.createdAt).toLocaleString() }}
            </div>
          </div>
          <span class="col">
            <span v-if="transfer.fromLocationName && transfer.fromLocationName !== '-'">{{ transfer.fromLocationName }} → {{ transfer.toLocationName }}</span>
            <span v-else-if="transfer.toLocationName && transfer.toLocationName !== '-'">→ {{ transfer.toLocationName }}</span>
            <span v-else>-</span>
          </span>
          <span class="col">{{ transfer.productName }}</span>
          <span class="col">
            <span class="tag" :class="applicationStatusClass(transfer.status)">
              {{ applicationStatusLabel(transfer.status) }}
            </span>
          </span>
        </div>
        <p v-if="!loading && !recentAllocations.length" class="empty-hint">No recent allocations</p>
      </div>
    </section>

    <!-- 4. Approval Timeline -->
    <section class="card approval__timeline">
      <h2 class="section-title">Approval Timeline</h2>
      <div v-if="selectedApplication && timeline.length > 0" class="timeline">
        <div v-for="item in timeline" :key="item.id" class="timeline-item">
          <span class="timeline-dot" :class="`timeline-dot--${item.status}`" />
          <div class="timeline-content">
            <span class="timeline-title">{{ item.title }}</span>
            <span class="timeline-desc">{{ item.desc }}</span>
            <span class="timeline-time">{{ item.time }}</span>
          </div>
        </div>
      </div>
      <p v-else class="empty-hint">Select an application to view timeline</p>
    </section>

    <!-- 5. Allocate Commodities -->
    <section class="card approval__allocate">
      <h2 class="section-title">Allocate Commodities</h2>
      <div v-if="allocationFormVisible && selectedApplication && selectedApplication.status === 'APPROVED'">
        <form class="allocation__form" @submit.prevent="allocate">
          <div class="allocation__form-row">
            <div class="form-group">
              <label class="form-label" for="from">Transfer From *</label>
              <select id="from" v-model="transfer.from" class="form-input" required>
                <option value="">Select warehouse</option>
                <option value="Central Warehouse">Central Warehouse</option>
                <option value="East Warehouse">East Warehouse</option>
                <option value="West Warehouse">West Warehouse</option>
                <option value="North Warehouse">North Warehouse</option>
                <option value="South Warehouse">South Warehouse</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="to">Transfer To *</label>
              <select id="to" v-model="transfer.to" class="form-input" required>
                <option value="">Select warehouse</option>
                <option value="East Warehouse">East Warehouse</option>
                <option value="West Warehouse">West Warehouse</option>
                <option value="North Warehouse">North Warehouse</option>
                <option value="South Warehouse">South Warehouse</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="sku">Product SKU *</label>
            <input id="sku" v-model="transfer.sku" class="form-input" disabled />
          </div>
          <div class="form-group">
            <label class="form-label" for="qty">Quantity *</label>
            <input id="qty" v-model.number="transfer.quantity" class="form-input" type="number" min="1" disabled />
          </div>
          <div class="form-group">
            <label class="form-label" for="reason">Reason *</label>
            <textarea id="reason" v-model="transfer.reason" class="form-textarea" rows="3" required />
          </div>
          <button class="btn-primary" type="submit">Create Transfer Order</button>
        </form>
      </div>
      <p v-else class="empty-hint">Approve an application to allocate commodities</p>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import {
  fetchReplenishmentApplications,
  updateReplenishmentApplicationStatus
} from '../services/replenishmentService';
import { createTransferOrder, fetchTransfers } from '../services/transferService';

const route = useRoute();

const statusMap = {
  PENDING: { label: 'Pending', class: 'warning' },
  PROCESSING: { label: 'Processing', class: 'info' },
  APPROVED: { label: 'Approved', class: 'success' },
  IN_TRANSIT: { label: 'In Transit', class: 'info' },
  ARRIVED: { label: 'Arrived', class: 'success' },
  REJECTED: { label: 'Rejected', class: 'danger' },
  COMPLETED: { label: 'Completed', class: 'success' }
};

// Recent Allocations display the status of the replenishment application, not the status of the transfer order
const applicationStatusForAllocation = (request) => {
  if (!request) return { label: 'Unknown', class: 'default' };
  // If there is requestId, it means this is a transfer order associated with a replenishment application
  // Need to find the corresponding replenishment application status
  return statusMap[request.status] || { label: request.status || 'Unknown', class: 'default' };
};

const transferStatusMap = {
  PENDING: { label: 'Pending', class: 'warning' },
  IN_TRANSIT: { label: 'In Transit', class: 'info' },
  COMPLETED: { label: 'Completed', class: 'success' },
  CANCELLED: { label: 'Cancelled', class: 'danger' }
};

const warehouseMap = {
  'Central Warehouse': 'WH-CENTRAL',
  'East Warehouse': 'WH-EAST',
  'West Warehouse': 'WH-WEST',
  'North Warehouse': 'WH-NORTH',
  'South Warehouse': 'WH-SOUTH'
};

const applications = ref([]);
const selectedApplication = ref(null);
const decisionRemark = ref('');
const allocationFormVisible = ref(false);
const loading = ref(false);
const recentAllocations = ref([]);
const refreshIntervalId = ref(null);

const transfer = reactive({
  from: 'Central Warehouse',
  to: '',
  sku: '',
  quantity: 0,
  reason: ''
});

// Save form data to localStorage
const saveTransferFormToStorage = (requestId) => {
  if (!requestId) return;
  try {
    const formData = {
      from: transfer.from,
      to: transfer.to,
      sku: transfer.sku,
      quantity: transfer.quantity,
      reason: transfer.reason,
      savedAt: Date.now()
    };
    localStorage.setItem(`transferForm_${requestId}`, JSON.stringify(formData));
  } catch (error) {
    console.warn('Failed to save transfer form data:', error);
  }
};

// Load form data from localStorage
const loadTransferFormFromStorage = (requestId) => {
  if (!requestId) return false;
  try {
    const saved = localStorage.getItem(`transferForm_${requestId}`);
    if (saved) {
      const formData = JSON.parse(saved);
      // Check if the data is expired (7 days)
      if (formData.savedAt && Date.now() - formData.savedAt < 7 * 24 * 60 * 60 * 1000) {
        transfer.from = formData.from || 'Central Warehouse';
        transfer.to = formData.to || '';
        transfer.sku = formData.sku || '';
        transfer.quantity = formData.quantity || 0;
        transfer.reason = formData.reason || '';
        return true;
      } else {
        // Clear expired data
        localStorage.removeItem(`transferForm_${requestId}`);
      }
    }
  } catch (error) {
    console.warn('Failed to load transfer form data:', error);
  }
  return false;
};

// Clear saved form data
const clearTransferFormStorage = (requestId) => {
  if (!requestId) return;
  try {
    localStorage.removeItem(`transferForm_${requestId}`);
  } catch (error) {
    console.warn('Failed to clear transfer form data:', error);
  }
};

// Listen for form field changes, automatically save
watch(
  () => [transfer.from, transfer.to, transfer.sku, transfer.quantity, transfer.reason],
  () => {
    if (selectedApplication.value?.requestId && allocationFormVisible.value) {
      saveTransferFormToStorage(selectedApplication.value.requestId);
    }
  },
  { deep: true }
);

const applicationStatusLabel = (status) => statusMap[status]?.label || status;
const applicationStatusClass = (status) => statusMap[status]?.class || 'default';
const transferStatusLabel = (status) => transferStatusMap[status]?.label || status;
const transferStatusClass = (status) => transferStatusMap[status]?.class || 'default';

const timeline = computed(() =>
  (selectedApplication.value?.progress || []).map((step, idx) => ({
    id: `${selectedApplication.value?.requestId || 'req'}-${idx}`,
    title: step.title,
    desc: step.desc,
    time: new Date(step.timestamp).toLocaleString(),
    status: step.status
  }))
);

const loadApplications = async () => {
  // Only set loading when it is necessary to display the loading status
  // If the data already exists, silently refresh
  if (applications.value.length === 0 && !selectedApplication.value) {
    loading.value = true;
  }
  
  try {
    console.log('[loadApplications] Starting to fetch applications...');
    console.log('[loadApplications] Calling fetchReplenishmentApplications()...');
    const allApplications = await fetchReplenishmentApplications();
    console.log('[loadApplications] API response received:', {
      type: typeof allApplications,
      isArray: Array.isArray(allApplications),
      length: Array.isArray(allApplications) ? allApplications.length : 'N/A',
      data: allApplications
    });
    
    // Ensure allApplications is an array
    if (!Array.isArray(allApplications)) {
      console.error('[loadApplications] ERROR: fetchReplenishmentApplications returned non-array:', allApplications);
      // Do not clear existing data, keep previous data
      if (!applications.value || applications.value.length === 0) {
        applications.value = [];
        selectedApplication.value = null;
      }
      loading.value = false;
      return;
    }
    
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
    console.log('[loadApplications] Filtered pending applications:', pendingApps.length);
    
    // Always update applications, even if it is an empty array
    applications.value = pendingApps;

    // Update the selected application, ensure the status is synchronized
    if (!selectedApplication.value) {
      // If there is no selected application before, select the first one
      const firstApp = applications.value[0] || null;
      if (firstApp) {
        selectApplication(firstApp);
      } else {
        selectedApplication.value = null;
      }
      console.log('[loadApplications] Selected first application:', selectedApplication.value?.requestId || 'none');
    } else {
      // If there is a selected application before, try to refresh it, or select the first one
      const refreshed =
        uniqueApplications.find((item) => item.requestId === selectedApplication.value.requestId) || null;
      const appToSelect = refreshed || applications.value[0] || null;
      if (appToSelect) {
        selectApplication(appToSelect);
      } else {
        selectedApplication.value = null;
        allocationFormVisible.value = false;
      }
      console.log('[loadApplications] Refreshed selected application:', selectedApplication.value?.requestId || 'none');
    }

    // Note: selectApplication has already handled the form display and data recovery logic
  } catch (error) {
    console.error('[loadApplications] ERROR: Failed to load applications:', error);
    console.error('[loadApplications] Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    // In case of error, if the data already exists, do not clear it
    // Only set to an empty array when the data is empty
    if (!applications.value || applications.value.length === 0) {
      applications.value = [];
      selectedApplication.value = null;
      allocationFormVisible.value = false;
    }
  } finally {
    loading.value = false;
    console.log('[loadApplications] Completed. Applications count:', applications.value.length);
  }
};

const loadRecentAllocations = async () => {
  try {
    console.log('[loadRecentAllocations] Starting to fetch data...');
    // Load all replenishment applications (approved or transfer order created)
    console.log('[loadRecentAllocations] Calling fetchReplenishmentApplications()...');
    const allApplications = await fetchReplenishmentApplications();
    console.log('[loadRecentAllocations] API response (applications):', {
      type: typeof allApplications,
      isArray: Array.isArray(allApplications),
      length: Array.isArray(allApplications) ? allApplications.length : 'N/A',
      data: allApplications
    });
    
    // Ensure allApplications is an array
    if (!Array.isArray(allApplications)) {
      console.error('[loadRecentAllocations] ERROR: fetchReplenishmentApplications returned non-array:', allApplications);
      // Do not clear existing data, keep previous data
      if (!recentAllocations.value || recentAllocations.value.length === 0) {
        recentAllocations.value = [];
      }
      return;
    }
    
    // Load all transfer orders (without specifying locationId to get all transfer orders)
    console.log('[loadRecentAllocations] Calling fetchTransfers()...');
    const transfers = await fetchTransfers();
    console.log('[loadRecentAllocations] API response (transfers):', {
      type: typeof transfers,
      isArray: Array.isArray(transfers),
      length: Array.isArray(transfers) ? transfers.length : 'N/A',
      data: transfers
    });
    
    // Ensure transfers is an array
    if (!Array.isArray(transfers)) {
      console.error('[loadRecentAllocations] ERROR: fetchTransfers returned non-array:', transfers);
      // Do not clear existing data, keep previous data
      if (!recentAllocations.value || recentAllocations.value.length === 0) {
        recentAllocations.value = [];
      }
      return;
    }
    
    // Create a map for quick lookup of transfer orders
    const transferMap = new Map();
    transfers.forEach(transfer => {
      if (transfer.requestId) {
        transferMap.set(transfer.requestId, transfer);
      }
    });
    
    // Combined display: approved but not created transfer order applications + created transfer order applications
    const allocations = [];
    
    // 1. Add approved, created transfer order or rejected replenishment applications
    const relevantApplications = allApplications.filter(app => 
      ['APPROVED', 'IN_TRANSIT', 'ARRIVED', 'COMPLETED', 'REJECTED'].includes(app.status)
    );
    
    relevantApplications.forEach(app => {
      const relatedTransfer = transferMap.get(app.requestId);
      
      if (relatedTransfer) {
        // Created transfer order: display transfer order information, use transfer order status and From information
        // The status should be read from the transfer order, not from the replenishment application, to ensure consistency with the regional warehouse receipt status
        // Map the status of the TransferOrder to the display status:
        // COMPLETED -> ARRIVED, IN_TRANSIT -> IN_TRANSIT
        let displayStatus = 'IN_TRANSIT'; // Default status
        if (relatedTransfer.status === 'COMPLETED') {
          displayStatus = 'ARRIVED';
        } else if (relatedTransfer.status === 'IN_TRANSIT') {
          displayStatus = 'IN_TRANSIT';
        } else if (relatedTransfer.status === 'PENDING') {
          displayStatus = 'APPROVED'; // If still pending, display approved
        }
        
        // Ensure fromLocationName is read from the transfer, if empty, derive from fromLocationId
        let fromName = relatedTransfer.fromLocationName;
        if (!fromName && relatedTransfer.fromLocationId) {
          // If fromLocationName is empty, derive from fromLocationId
          const locationIdToName = {
            'WH-CENTRAL': 'Central Warehouse',
            'WH-EAST': 'East Warehouse',
            'WH-WEST': 'West Warehouse',
            'WH-NORTH': 'North Warehouse',
            'WH-SOUTH': 'South Warehouse'
          };
          fromName = locationIdToName[relatedTransfer.fromLocationId] || relatedTransfer.fromLocationId;
        }
        
        allocations.push({
          transferId: relatedTransfer.transferId,
          requestId: app.requestId,
          productSku: app.productId,
          productName: app.productName,
          quantity: app.quantity,
          fromLocationName: fromName || app.warehouseName, // If there is fromName, use it, otherwise use warehouseName (as the last fallback)
          toLocationName: relatedTransfer.toLocationName || app.warehouseName,
          status: displayStatus,
          createdAt: relatedTransfer.createdAt || app.updatedAt || app.createdAt
        });
      } else if (app.status === 'APPROVED' || app.status === 'REJECTED') {
        // Approved but not created transfer order, or rejected: display replenishment application information, From → To is "-"
        allocations.push({
          transferId: app.requestId, // Use requestId as the display ID
          requestId: app.requestId,
          productSku: app.productId,
          productName: app.productName,
          quantity: app.quantity,
          fromLocationName: '-',
          toLocationName: app.status === 'REJECTED' ? '-' : app.warehouseName,
          status: app.status,
          createdAt: app.updatedAt || app.createdAt
        });
      }
    });
    
    // Sort by creation time in descending order
    const sortedAllocations = allocations
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20);
    
    console.log('[loadRecentAllocations] Processed allocations:', sortedAllocations.length);
    // Always update recentAllocations, even if it is an empty array
    recentAllocations.value = sortedAllocations;
  } catch (error) {
    console.error('[loadRecentAllocations] ERROR: Failed to load recent allocations:', error);
    console.error('[loadRecentAllocations] Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    // In case of error, if the data already exists, do not clear it
    // Only set to an empty array when the data is empty
    if (!recentAllocations.value || recentAllocations.value.length === 0) {
      recentAllocations.value = [];
    }
  } finally {
    console.log('[loadRecentAllocations] Completed. Allocations count:', recentAllocations.value.length);
  }
};

const selectApplication = (application) => {
  // Before switching applications, save the form data of the current application
  if (selectedApplication.value?.requestId && allocationFormVisible.value) {
    saveTransferFormToStorage(selectedApplication.value.requestId);
  }
  
  selectedApplication.value = application;
  
  if (application) {
    allocationFormVisible.value = application.status === 'APPROVED';
    
    // If the status is APPROVED, try to restore form data from localStorage
    if (allocationFormVisible.value) {
      const hasSavedData = loadTransferFormFromStorage(application.requestId);
      
      // If there is no saved data, automatically fill in the default values
      if (!hasSavedData) {
        transfer.from = 'Central Warehouse';
        transfer.to = application.warehouseName || '';
        transfer.sku = application.productId || '';
        transfer.quantity = application.quantity || 0;
        transfer.reason = application.reason || '';
      }
    } else {
      // If the status is not APPROVED, clear the form
      transfer.from = 'Central Warehouse';
      transfer.to = '';
      transfer.sku = '';
      transfer.quantity = 0;
      transfer.reason = '';
    }
  } else {
    allocationFormVisible.value = false;
  }
};

const approve = async (approved) => {
  if (!selectedApplication.value) return;
  if (!approved && !decisionRemark.value.trim()) {
    window.alert('Please provide a rejection remark');
    return;
  }
  const decision = approved ? 'APPROVED' : 'REJECTED';
  const currentRequestId = selectedApplication.value.requestId;
  try {
    const updated = await updateReplenishmentApplicationStatus(currentRequestId, {
      decision,
      remark: decisionRemark.value
    });
    
    // Use the returned updated data directly, ensure it contains the latest progress/timeline
    if (updated) {
      selectedApplication.value = updated;
    }
    
    // Reload the application list and Recent Allocations to get the latest status
    await loadApplications();
    await loadRecentAllocations();
    
    // If the application is rejected, it may not be in the pending list, but we need to keep the selected state to display the timeline
    // If the application is still in the pending list, update to the latest data
    const allApplications = await fetchReplenishmentApplications();
    const refreshed = allApplications.find((item) => item.requestId === currentRequestId);
    
    if (refreshed) {
      // If found, use the latest data (contains complete progress)
      selectedApplication.value = refreshed;
    } else if (updated) {
      // If not in the list (e.g. rejected), keep using the returned updated data
      selectedApplication.value = updated;
    }
    
    // Set allocationFormVisible based on the status
    if (approved && selectedApplication.value?.status === 'APPROVED') {
      allocationFormVisible.value = true;
      // Try to restore form data from localStorage
      const requestId = selectedApplication.value.requestId;
      const hasSavedData = loadTransferFormFromStorage(requestId);
      
      // If there is no saved data, automatically fill in the default values
      if (!hasSavedData) {
        transfer.from = 'Central Warehouse';
        transfer.to = selectedApplication.value.warehouseName || '';
        transfer.sku = selectedApplication.value.productId || '';
        transfer.quantity = selectedApplication.value.quantity || 0;
        transfer.reason = selectedApplication.value.reason || '';
      }
    } else {
      allocationFormVisible.value = false;
      // Clear the form
      transfer.from = 'Central Warehouse';
      transfer.to = '';
      transfer.sku = '';
      transfer.quantity = 0;
      transfer.reason = '';
    }
    
    if (approved) {
      window.alert('Application approved. Please allocate commodities.');
    } else {
      window.alert('Application rejected. The replenishment alert has been restored in the regional warehouse manager\'s alerts.');
    }
  } catch (error) {
    window.alert(error.message || 'Operation failed');
  } finally {
    decisionRemark.value = '';
  }
};

const allocate = async () => {
  if (!selectedApplication.value) return;
  if (!transfer.from || !transfer.to || !transfer.sku || !transfer.quantity || !transfer.reason) {
    window.alert('Please fill in all allocation fields');
    return;
  }
  if (transfer.from === transfer.to) {
    window.alert('Source and destination cannot be the same');
    return;
  }
  try {
    await createTransferOrder({
      productSku: transfer.sku || selectedApplication.value.productId,
      productName: selectedApplication.value.productName,
      quantity: Number(transfer.quantity),
      fromLocationId: warehouseMap[transfer.from],
      fromLocationName: transfer.from,
      toLocationId: warehouseMap[transfer.to],
      toLocationName: transfer.to,
      requestId: selectedApplication.value.requestId
    });
    
    // Clear saved form data
    clearTransferFormStorage(selectedApplication.value.requestId);
    
    // Reload the application and transfer order list
    await loadApplications();
    await loadRecentAllocations();
    window.alert('Transfer order created and dispatched');
  } catch (error) {
    window.alert(error.message || 'Failed to create transfer');
  }
};

// Save when the page visibility changes (user switches tabs or minimizes the window)
const handleVisibilityChange = () => {
  if (document.hidden && selectedApplication.value?.requestId && allocationFormVisible.value) {
    saveTransferFormToStorage(selectedApplication.value.requestId);
  }
};

  // Data loading function, can be called repeatedly
const loadAllData = async () => {
  console.log('[loadAllData] Starting to load all data...');
  // Ensure data loading, even if it fails, set default values
  try {
    await Promise.all([
      loadApplications(),
      loadRecentAllocations()
    ]);
    console.log('[loadAllData] All data loaded successfully');
  } catch (error) {
    console.error('[loadAllData] ERROR: Failed to load data:', error);
    // Ensure even if loading fails, display empty state
    // But do not overwrite existing data
    if (!applications.value) applications.value = [];
    if (!recentAllocations.value) recentAllocations.value = [];
  }
};

onMounted(async () => {
  console.log('[onMounted] Component mounted, initializing...');
  // Add page visibility listener
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Initial load data
  console.log('[onMounted] Loading initial data...');
  await loadAllData();
  console.log('[onMounted] Initial data loaded');
  
  // Periodically refresh the application and transfer order lists
  refreshIntervalId.value = setInterval(() => {
    console.log('[refreshInterval] Refreshing data...');
    loadApplications();
    loadRecentAllocations();
  }, 5000); // Every 5 seconds refresh
  console.log('[onMounted] Auto-refresh interval set');
});

// Listen for route changes, ensure reloading when switching back
watch(() => route.path, async (newPath, oldPath) => {
  // If the same route but the parameters change, or switch back from other routes, reload
  if (newPath === '/app/central/approvals' && newPath !== oldPath) {
    await loadAllData();
  }
}, { immediate: false });

// Save form data and clean up resources before the page is unloaded
onUnmounted(() => {
  // Save the current form data
  if (selectedApplication.value?.requestId && allocationFormVisible.value) {
    saveTransferFormToStorage(selectedApplication.value.requestId);
  }
  
  // Clear the timer
  if (refreshIntervalId.value) {
    clearInterval(refreshIntervalId.value);
  }
  
  // Remove the event listener
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});
</script>

<style scoped>
.approval {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto auto;
  gap: 24px;
}

/* First row: Pending Applications, Application Details, Approval Timeline */
.approval__pending {
  grid-column: 1;
  grid-row: 1;
}

.approval__details {
  grid-column: 2;
  grid-row: 1;
}

.approval__timeline {
  grid-column: 3;
  grid-row: 1;
}

/* Second row: Recent Allocations and Allocate Commodities */
.approval__allocations {
  grid-column: 1 / 3;
  grid-row: 2;
}

.approval__allocate {
  grid-column: 3;
  grid-row: 2;
}

/* If Allocate Commodities is not displayed, Timeline occupies the entire row */
.approval__timeline:only-child {
  grid-column: 1 / 4;
}

@media (max-width: 1400px) {
  .approval {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
  
  .approval__pending,
  .approval__details,
  .approval__allocations,
  .approval__timeline,
  .approval__allocate {
    grid-column: 1;
    grid-row: auto;
  }
}

.approval__table {
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.approval__table-header,
.approval__table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 12px;
  padding: 16px 20px;
  align-items: center;
}

.approval__table-header {
  background-color: var(--color-surface-alt);
  font-weight: 600;
  color: var(--color-text-muted);
}

.approval__table-row {
  border-top: 1px solid var(--color-border);
  cursor: pointer;
}

.approval__table-row--active {
  background-color: rgba(43, 181, 192, 0.12);
}

.approval__row-title {
  font-weight: 600;
}

.approval__row-meta {
  margin-top: 4px;
  font-size: 13px;
  color: #9ca3af;
}

.approval__detail {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
  background: var(--color-background);
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 12px;
}

.approval__decision {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.approval__decision-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.allocation__form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.allocation__form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.timeline-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--color-border);
  flex-shrink: 0;
  margin-top: 4px;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.timeline-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text);
}

.timeline-desc {
  font-size: 13px;
  color: var(--color-text-muted);
}

.timeline-time {
  font-size: 12px;
  color: var(--color-text-muted);
}

.timeline-dot--completed {
  background-color: var(--color-success);
}

.timeline-dot--processing {
  background-color: var(--color-brand);
}

.empty-hint {
  padding: 20px;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 14px;
}
</style>
