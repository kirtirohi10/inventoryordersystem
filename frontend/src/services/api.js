import axios from 'axios';

// Base URL for API requests. Append /api if missing.
const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to format error responses for easy handling in React components
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred';
    
    if (error.response) {
      // Server returned a response outside 2xx range
      message = error.response.data?.detail || error.response.data?.message || message;
    } else if (error.request) {
      // Request was made but no response was received
      message = 'Could not connect to the backend server. Make sure it is running.';
    } else {
      message = error.message;
    }
    
    return Promise.reject(new Error(message));
  }
);

export const ProductAPI = {
  getAll: () => apiClient.get('/products').then(res => res.data),
  getById: (id) => apiClient.get(`/products/${id}`).then(res => res.data),
  create: (data) => apiClient.post('/products', data).then(res => res.data),
  update: (id, data) => apiClient.put(`/products/${id}`, data).then(res => res.data),
  delete: (id) => apiClient.delete(`/products/${id}`).then(res => res.data),
};

export const CustomerAPI = {
  getAll: () => apiClient.get('/customers').then(res => res.data),
  getById: (id) => apiClient.get(`/customers/${id}`).then(res => res.data),
  create: (data) => apiClient.post('/customers', data).then(res => res.data),
  update: (id, data) => apiClient.put(`/customers/${id}`, data).then(res => res.data),
  delete: (id) => apiClient.delete(`/customers/${id}`).then(res => res.data),
};

export const OrderAPI = {
  getAll: () => apiClient.get('/orders').then(res => res.data),
  getById: (id) => apiClient.get(`/orders/${id}`).then(res => res.data),
  create: (data) => apiClient.post('/orders', data).then(res => res.data),
};

export const InventoryAPI = {
  getSummary: () => apiClient.get('/inventory').then(res => res.data),
};

export default apiClient;
