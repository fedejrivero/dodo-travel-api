const express = require('express');
const router = express.Router();
const {
  getDepositsByService,
  createDeposit,
  updateDeposit,
  deleteDeposit
} = require('../controllers/depositController');

router.route('/service/:serviceId')
  .get(getDepositsByService)
  .post(createDeposit);

router.route('/:id')
  .put(updateDeposit)
  .delete(deleteDeposit);

module.exports = router;
