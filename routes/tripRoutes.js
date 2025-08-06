const express = require('express');
const router = express.Router();
const {
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip
} = require('../controllers/tripController');

// Routes for /api/trips
router.route('/')
  .get(getTrips)
  .post(createTrip);

// Routes for /api/trips/:id
router.route('/:id')
  .get(getTrip)
  .put(updateTrip)
  .delete(deleteTrip);

module.exports = router;
