import apiClient from './api.js';

// 初始化库存（仅开发/演示使用）
// 调用位置：可在后台管理页面或脚本中手动触发
export const initializeInventory = async () => {
  const response = await apiClient.post('/inventory/initialize');
  return response.data;
};

// 获取全部库存（统计视角）
export const getInventory = async () => {
  const response = await apiClient.get('/inventory');
  return response.data;
};

// 根据位置获取库存列表：GET /api/inventory/:locationId
// 调用位置：区域仓库存盘点、门店库存页面
export const getInventoryByLocation = async (locationId) => {
  const response = await apiClient.get(`/inventory/${locationId}`);
  return response.data;
};

// 销售出货 / 调整库存：PATCH /api/inventory/update
// payload: { productId, locationId, quantityChange }
export const updateInventoryForSale = async (payload) => {
  const response = await apiClient.patch('/inventory/update', payload);
  return response.data;
};

// 仓库与门店之间调拨：PATCH /api/inventory/transfer
// payload: { productId, fromLocationId, toLocationId, quantity }
export const transferInventory = async (payload) => {
  const response = await apiClient.patch('/inventory/transfer', payload);
  return response.data;
};

