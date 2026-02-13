const express = require('express');
const router = express.Router();
const {
  getFiles,
  getFile,
  createFile,
  updateFile,
  deleteFile
} = require('../controllers/fileController');
const {
  getPassengersByFile,
  addPassengerToFile,
  removePassengerFromFile
} = require('../controllers/filePassengerController');
const { getServicesByFile, createService } = require('../controllers/serviceController');
const { getPaymentsByFile, createPayment } = require('../controllers/paymentController');

router.route('/')
  .get(getFiles)
  .post(createFile);

router.route('/:id')
  .get(getFile)
  .put(updateFile)
  .delete(deleteFile);

router.route('/:fileId/services')
  .get(getServicesByFile)
  .post(createService);

router.route('/:fileId/payments')
  .get(getPaymentsByFile)
  .post(createPayment);

router.route('/:fileId/passengers')
  .get(getPassengersByFile)
  .post(addPassengerToFile);

router.route('/:fileId/passengers/:passengerId')
  .delete(removePassengerFromFile);

module.exports = router;
