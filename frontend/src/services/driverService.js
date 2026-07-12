import api from './apiClient';

const driverService = {
  getAllDrivers: async () => {
    const response = await api.get('/drivers');
    return response.data;
  },
  
  getDispatchPool: async () => {
    const response = await api.get('/drivers/dispatch-pool');
    return response.data;
  },

  getDriverById: async (id) => {
    const response = await api.get(`/drivers/${id}`);
    return response.data;
  },

  createDriver: async (driverData) => {
    const response = await api.post('/drivers', driverData);
    return response.data;
  },

  updateDriver: async (id, driverData) => {
    const response = await api.put(`/drivers/${id}`, driverData);
    return response.data;
  },

  deleteDriver: async (id) => {
    const response = await api.delete(`/drivers/${id}`);
    return response.data;
  }
};

export default driverService;
