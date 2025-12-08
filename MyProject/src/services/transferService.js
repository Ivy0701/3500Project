import apiClient from './api';

export const fetchTransfers = async (locationId) => {
  const params = {};
  // 如果提供了locationId，添加到参数中；如果不提供，获取所有调拨单
  if (locationId) {
    params.locationId = locationId;
  }
  const response = await apiClient.get('/transfer-orders', { params });
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

