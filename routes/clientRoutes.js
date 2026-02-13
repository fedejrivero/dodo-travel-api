const express = require('express');
const router = express.Router();
const {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient
} = require('../controllers/clientController');
const {
  getPassengersByClient,
  createPassenger
} = require('../controllers/passengerController');

router.route('/')
  .get(getClients)
  .post(createClient);

router.route('/:id')
  .get(getClient)
  .put(updateClient)
  .delete(deleteClient);

router.route('/:clientId/passengers')
  .get(getPassengersByClient)
  .post(createPassenger);

module.exports = router;
