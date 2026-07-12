import api from '../api/axios';

const BASE = '/v1/expenses';

export const getExpenses = () => api.get(BASE);
export const createExpense = (data) => api.post(BASE, data);
