const express = require('express');
const router = express.Router();
const {
  updatePayment,
  deletePayment
} = require('../controllers/paymentController');

router.route('/:id')
  .put(updatePayment)
  .delete(deletePayment);

module.exports = router;
