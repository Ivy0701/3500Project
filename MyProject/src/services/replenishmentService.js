import apiClient from './api';

export const fetchReplenishmentAlerts = async () => {
  const response = await apiClient.get('/replenishments/alerts');
  return response.data;
};

export const fetchReplenishmentProgress = async () => {
  const response = await apiClient.get('/replenishments/progress');
  return response.data;
};

export const submitReplenishmentApplication = async (payload) => {
  const response = await apiClient.post('/replenishments/applications', payload);
  return response.data;
};

export const fetchReplenishmentApplications = async (params = {}) => {
  const response = await apiClient.get('/replenishments/applications', {
    params
  });
  return response.data;
};

export const updateReplenishmentApplicationStatus = async (requestId, payload) => {
  const response = await apiClient.patch(`/replenishments/applications/${requestId}`, payload);
  return response.data;
};

export const checkAndCreateReplenishmentAlerts = async () => {
  const response = await apiClient.post('/replenishments/check-alerts');
  return response.data;
};

export const createAlertsForLowStockItems = async (lowStockItems) => {
  const response = await apiClient.post('/replenishments/create-alerts-for-low-stock', {
    items: lowStockItems.map(item => ({
      productId: item.sku,
      productName: item.name,
      locationId: item.locationId,
      locationName: item.store,
      available: item.available,
      totalStock: item.total,
      threshold: item.threshold
    }))
  });
  return response.data;
};

