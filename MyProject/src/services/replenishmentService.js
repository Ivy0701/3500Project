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
  try {
    console.log('[fetchReplenishmentApplications] Making API request to /replenishments/applications with params:', params);
    const response = await apiClient.get('/replenishments/applications', {
      params
    });
    console.log('[fetchReplenishmentApplications] API response received:', {
      status: response.status,
      statusText: response.statusText,
      dataType: typeof response.data,
      isArray: Array.isArray(response.data),
      dataLength: Array.isArray(response.data) ? response.data.length : 'N/A',
      data: response.data
    });
    // 确保返回的是数组
    if (Array.isArray(response.data)) {
      console.log('[fetchReplenishmentApplications] Returning array of', response.data.length, 'items');
      return response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      console.log('[fetchReplenishmentApplications] Returning nested array of', response.data.data.length, 'items');
      return response.data.data;
    } else {
      console.warn('[fetchReplenishmentApplications] Unexpected response format:', response.data);
      return [];
    }
  } catch (error) {
    console.error('[fetchReplenishmentApplications] API error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText
    });
    // 重新抛出错误，让调用者处理
    throw error;
  }
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

