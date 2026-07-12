import apiClient from './apiClient';

const vehicleService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    
    const response = await apiClient.get(`/vehicles?${params.toString()}`);
    return response.data.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/vehicles/${id}`);
    return response.data.data;
  },

  getDispatchPool: async () => {
    const response = await apiClient.get('/vehicles/dispatch-pool');
    return response.data.data;
  },

  getOperationalCost: async (id) => {
    const response = await apiClient.get(`/vehicles/${id}/operational-cost`);
    return response.data.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/vehicles', data);
    return response.data.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/vehicles/${id}`, data);
    return response.data.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/vehicles/${id}`);
    return response.data.data;
  }
};

export default vehicleService;
