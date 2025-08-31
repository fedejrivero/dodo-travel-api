const express = require('express');
const router = express.Router();
const {
  getRates,
  getRate,
  getRatesByTripId,
  createRate,
  updateRate,
  deleteRate,
  deleteRatesByTripId
} = require('../controllers/rateController');

// Routes for /api/rates
router.route('/')
  .get(getRates)
  .post(createRate);

// Routes for /api/rates/:id
router.route('/:id')
  .get(getRate)
  .put(updateRate)
  .delete(deleteRate);

// Route for getting rates by trip ID
router.route('/trip/:tripId')
  .get(getRatesByTripId)
  .delete(deleteRatesByTripId);

module.exports = router;
