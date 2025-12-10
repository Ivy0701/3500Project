import apiClient from './api';

export const fetchTransfers = async (locationId) => {
  try {
    const params = {};
    // If locationId is provided, add it to the parameters; if not provided, get all transfer orders
    if (locationId) {
      params.locationId = locationId;
    }
    console.log('[fetchTransfers] Making API request to /transfer-orders with params:', params);
    const response = await apiClient.get('/transfer-orders', { params });
    console.log('[fetchTransfers] API response received:', {
      status: response.status,
      statusText: response.statusText,
      dataType: typeof response.data,
      isArray: Array.isArray(response.data),
      dataLength: Array.isArray(response.data) ? response.data.length : 'N/A',
      data: response.data
    });
    // Ensure the return is an array
    if (Array.isArray(response.data)) {
      console.log('[fetchTransfers] Returning array of', response.data.length, 'items');
      return response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      console.log('[fetchTransfers] Returning nested array of', response.data.data.length, 'items');
      return response.data.data;
    } else {
      console.warn('[fetchTransfers] Unexpected response format:', response.data);
      return [];
    }
  } catch (error) {
    console.error('[fetchTransfers] API error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText
    });
    // Re-throw the error, let the caller handle it
    throw error;
  }
};

export const dispatchTransfer = async (transferId, payload) => {
  const response = await apiClient.patch(`/transfer-orders/${transferId}/dispatch`, payload);
  return response.data;
};

export const createTransferOrder = async (payload) => {
  const response = await apiClient.post('/transfer-orders', payload);
  return response.data;
};

