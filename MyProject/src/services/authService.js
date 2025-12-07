import apiClient from './api.js';

export const register = async (payload) => {
  const response = await apiClient.post('/auth/register', payload);
  return response.data;
};

export const login = async (payload) => {
  const response = await apiClient.post('/auth/login', payload);
  return response.data;
};

export const verifyUserForPasswordReset = async (payload) => {
  const response = await apiClient.post('/auth/verify-password-reset', payload);
  return response.data;
};

export const resetPassword = async (payload) => {
  const response = await apiClient.post('/auth/reset-password', payload);
  return response.data;
};






