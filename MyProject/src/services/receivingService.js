import apiClient from './api';

export const fetchReceivingSchedules = async () => {
  const response = await apiClient.get('/receiving/schedules');
  return response.data;
};

export const fetchReceivingLogs = async () => {
  const response = await apiClient.get('/receiving/logs');
  return response.data;
};

export const completeReceiving = async (planNo, payload) => {
  const response = await apiClient.patch(`/receiving/${planNo}/complete`, payload);
  return response.data;
};

