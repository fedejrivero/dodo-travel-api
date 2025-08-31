const Rate = require('../models/rateModel');

// @desc    Get all rates
// @route   GET /api/rates
// @access  Public
const getRates = async (req, res, next) => {
  try {
    const rates = await Rate.findAll();
    res.status(200).json(rates);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single rate
// @route   GET /api/rates/:id
// @access  Public
const getRate = async (req, res, next) => {
  try {
    const rate = await Rate.findById(req.params.id);
    if (!rate) {
      return res.status(404).json({ message: 'Rate not found' });
    }
    res.status(200).json(rate);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all rates for a specific trip
// @route   GET /api/rates/trip/:tripId
// @access  Public
const getRatesByTripId = async (req, res, next) => {
  try {
    const rates = await Rate.getAllRatesByTripId(req.params.tripId);
    res.status(200).json(rates);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a rate
// @route   POST /api/rates
// @access  Private/Admin
const createRate = async (req, res, next) => {
  try {
    const rate = await Rate.create(req.body);
    res.status(201).json(rate);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a rate
// @route   PUT /api/rates/:id
// @access  Private/Admin
const updateRate = async (req, res, next) => {
  try {
    const rate = await Rate.update(req.params.id, req.body);
    if (!rate) {
      return res.status(404).json({ message: 'Rate not found' });
    }
    res.status(200).json(rate);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a rate
// @route   DELETE /api/rates/:id
// @access  Private/Admin
const deleteRate = async (req, res, next) => {
  try {
    const rate = await Rate.delete(req.params.id);
    if (!rate) {
      return res.status(404).json({ message: 'Rate not found' });
    }
    res.status(200).json({ message: 'Rate removed' });
  } catch (error) {
    next(error);
  }
};

const deleteRatesByTripId = async (req, res, next) => {
  try {
    const rates = await Rate.deleteRatesByTripId(req.params.tripId);
    if (!rates) {
      return res.status(404).json({ message: 'Rates not found' });
    }
    res.status(200).json({ message: 'Rates removed' });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getRates,
  getRate,
  getRatesByTripId,
  createRate,
  updateRate,
  deleteRate,
  deleteRatesByTripId
};
