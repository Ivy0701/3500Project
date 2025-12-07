import axios from 'axios';

// 智能检测API基础地址
const getApiBaseURL = () => {
  // 优先使用环境变量配置
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // 在浏览器环境中，自动检测当前访问的hostname
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // 如果是IP地址或非localhost，使用相同的hostname
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:4000/api`;
    }
  }
  
  // 默认使用localhost
  return 'http://localhost:4000/api';
};

const apiClient = axios.create({
  baseURL: getApiBaseURL(),
  timeout: 10000
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const stored = window.sessionStorage.getItem('app-auth');
    if (stored) {
      const { token } = JSON.parse(stored);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = error.response?.data?.message || error.message || 'Request failed';
    
    // If network error, provide more detailed information
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      const baseURL = error.config?.baseURL || 'http://localhost:4000/api';
      message = `Unable to connect to backend server (${baseURL}). Please ensure:\n1. Backend service is running\n2. API address is configured correctly\n3. Firewall is not blocking the connection`;
    }
    
    return Promise.reject(new Error(message));
  }
);

export default apiClient;

