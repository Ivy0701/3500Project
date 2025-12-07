import apiClient from './api.js';

export const fetchOrders = async () => {
  const response = await apiClient.get('/orders');
  return response.data;
};

export const createOrder = async (payload) => {
  const response = await apiClient.post('/orders', payload);
  return response.data;
};

export const confirmOrderReceipt = async (orderId) => {
  const response = await apiClient.patch(`/orders/${orderId}/confirm-receipt`);
  return response.data;
};

// Customer applies for after-sales (exchange / refund)
export const returnOrder = async (orderId, payload) => {
  const response = await apiClient.patch(`/orders/${orderId}/return`, payload);
  return response.data;
};

export const cancelOrder = async (orderId) => {
  const response = await apiClient.patch(`/orders/${orderId}/cancel`);
  return response.data;
};

export const confirmOrder = async (orderId) => {
  const response = await apiClient.patch(`/orders/${orderId}/confirm`);
  return response.data;
};

export const shipOrder = async (orderId) => {
  const response = await apiClient.patch(`/orders/${orderId}/ship`);
  return response.data;
};

export const approveAfterSales = async (orderId) => {
  const response = await apiClient.patch(`/orders/${orderId}/after-sales/approve`);
  return response.data;
};

export const rejectAfterSales = async (orderId, payload) => {
  const response = await apiClient.patch(`/orders/${orderId}/after-sales/reject`, payload);
  return response.data;
};

