const express = require('express');
const router = express.Router();
const {
  updatePassenger,
  deletePassenger
} = require('../controllers/passengerController');

router.route('/:id')
  .put(updatePassenger)
  .delete(deletePassenger);

module.exports = router;
