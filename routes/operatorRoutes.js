const express = require('express');
const router = express.Router();
const {
  getOperators,
  createOperator,
  updateOperator,
  deleteOperator
} = require('../controllers/operatorController');

router.route('/')
  .get(getOperators)
  .post(createOperator);

router.route('/:id')
  .put(updateOperator)
  .delete(deleteOperator);

module.exports = router;
