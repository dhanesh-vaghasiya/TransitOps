import api from '../api/axios';

const BASE = '/settings';

export const getSettings = () => api.get(BASE);
export const updateSettings = (data) => api.put(BASE, data);
export const updateRbacMatrix = (rbacMatrix) => api.put(`${BASE}/rbac`, { rbacMatrix });
export const getSecurityLogs = () => api.get(`${BASE}/security-logs`);
