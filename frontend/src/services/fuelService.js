import api from '../api/axios';

const BASE = '/fuel-logs';

export const getFuelLogs = (params = {}) => api.get(BASE, { params });
export const createFuelLog = (data) => api.post(BASE, data);
