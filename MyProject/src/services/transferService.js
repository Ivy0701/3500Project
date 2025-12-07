import apiClient from './api';

export const fetchTransfers = async (locationId) => {
  const response = await apiClient.get('/transfer-orders', {
    params: locationId ? { locationId } : {}
  });
  return response.data;
};

export const dispatchTransfer = async (transferId, payload) => {
  const response = await apiClient.patch(`/transfer-orders/${transferId}/dispatch`, payload);
  return response.data;
};

export const createTransferOrder = async (payload) => {
  const response = await apiClient.post('/transfer-orders', payload);
  return response.data;
};

