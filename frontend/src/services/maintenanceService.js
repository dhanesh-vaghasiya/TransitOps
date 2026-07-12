import apiClient from './apiClient';

const getAll = async () => {
  const response = await apiClient.get('/maintenance');
  return response.data.data;
};

const getById = async (id) => {
  const response = await apiClient.get(`/maintenance/${id}`);
  return response.data.data;
};

const create = async (data) => {
  const response = await apiClient.post('/maintenance', data);
  return response.data.data;
};

const update = async (id, data) => {
  const response = await apiClient.put(`/maintenance/${id}`, data);
  return response.data.data;
};

export default {
  getAll,
  getById,
  create,
  update,
};
