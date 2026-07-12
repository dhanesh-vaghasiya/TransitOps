// Trip module routes
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { createTripSchema, completeTripSchema } = require('./trip.validator');
const controller = require('./trip.controller');

// GET /api/v1/trips            – list all trips (optionally filter by ?status=)
router.get('/', auth, controller.listTrips);

// GET /api/v1/trips/dispatch-pool  – available vehicles + drivers
router.get('/dispatch-pool', auth, controller.getDispatchPool);

// GET /api/v1/trips/:id        – single trip detail
router.get('/:id', auth, controller.getTrip);

// POST /api/v1/trips           – create a draft trip
router.post('/', auth, validate(createTripSchema), controller.createTrip);

// POST /api/v1/trips/:id/dispatch  – dispatch a draft trip
router.post('/:id/dispatch', auth, controller.dispatchTrip);

// POST /api/v1/trips/:id/complete  – complete a dispatched trip
router.post('/:id/complete', auth, validate(completeTripSchema), controller.completeTrip);

// POST /api/v1/trips/:id/cancel    – cancel a draft or dispatched trip
router.post('/:id/cancel', auth, controller.cancelTrip);

module.exports = router;
