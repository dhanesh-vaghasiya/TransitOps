import api from '../api/axios';

const BASE = '/v1/vehicles';

export const getVehicles = () => api.get(BASE);
export const getVehicleOperationalCost = (id) => api.get(`${BASE}/${id}/operational-cost`);
