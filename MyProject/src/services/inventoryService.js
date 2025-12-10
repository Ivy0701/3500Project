import apiClient from './api.js';

// Initialize inventory (only for development/demo use)
// Call location: Can be triggered manually in the background management page or script
export const initializeInventory = async () => {
  const response = await apiClient.post('/inventory/initialize');
  return response.data;
};

// Get all inventory (statistical perspective)
export const getInventory = async () => {
  const response = await apiClient.get('/inventory');
  return response.data;
};

// Get inventory list by location: GET /api/inventory/:locationId
// Call location: Regional warehouse inventory盘点, store inventory page
export const getInventoryByLocation = async (locationId) => {
  const response = await apiClient.get(`/inventory/${locationId}`);
  return response.data;
};

// Sales出货 / 调整库存：PATCH /api/inventory/update
// payload: { productId, locationId, quantityChange }
export const updateInventoryForSale = async (payload) => {
  const response = await apiClient.patch('/inventory/update', payload);
  return response.data;
};

// Warehouse to store transfer: PATCH /api/inventory/transfer
// payload: { productId, fromLocationId, toLocationId, quantity }
export const transferInventory = async (payload) => {
  const response = await apiClient.patch('/inventory/transfer', payload);
  return response.data;
};

