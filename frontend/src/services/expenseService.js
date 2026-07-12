import api from '../api/axios';

const BASE = '/expenses';

export const getExpenses = () => api.get(BASE);
export const createExpense = (data) => api.post(BASE, data);
