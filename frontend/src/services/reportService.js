import apiClient from './apiClient';

const getDashboardKPIs = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.type) params.append('type', filters.type);
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);
  
  const response = await apiClient.get(`/reports/dashboard?${params.toString()}`);
  return response.data.data;
};

export default {
  getDashboardKPIs
};
