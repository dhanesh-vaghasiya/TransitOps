import api from '../api/axios';

const BASE = '/trips';

/**
 * Fetch all trips, optionally filtered by status.
 * @param {object} [params] - { status, page, limit }
 */
export const getTrips = (params = {}) => api.get(BASE, { params });

/**
 * Fetch the dispatch pool: available vehicles + drivers.
 */
export const getDispatchPool = () => api.get(`${BASE}/dispatch-pool`);

/**
 * Fetch a single trip by ID.
 */
export const getTripById = (id) => api.get(`${BASE}/${id}`);

/**
 * Create a new draft trip.
 * @param {object} data - { vehicleId, driverId, source, destination, cargoWeight, plannedDistance }
 */
export const createTrip = (data) => api.post(BASE, data);

/**
 * Dispatch a draft trip.
 */
export const dispatchTrip = (id) => api.post(`${BASE}/${id}/dispatch`);

/**
 * Complete a dispatched trip.
 * @param {number} id
 * @param {object} data - { finalOdometer, fuelConsumed, fuelCostPerLiter }
 */
export const completeTrip = (id, data) => api.post(`${BASE}/${id}/complete`, data);

/**
 * Cancel a draft or dispatched trip.
 */
export const cancelTrip = (id) => api.post(`${BASE}/${id}/cancel`);
