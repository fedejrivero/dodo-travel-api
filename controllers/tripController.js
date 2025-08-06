const Trip = require('../models/tripModel');

// Validation function for trip data
const validateTripData = (data) => {
  const { name, category, dates, price, currency, amenities } = data;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.push('Name is required and must be a non-empty string');
  }

  const validCategories = ['Nacional Bus', 'Nacional Aereo', 'Internacional', 'Grupal'];
  if (!category || !validCategories.includes(category)) {
    errors.push('Valid category is required');
  }

  if (!Array.isArray(dates) || dates.length === 0 || !dates.every(date => !isNaN(Date.parse(date)))) {
    errors.push('Valid dates array is required');
  }

  if (typeof price !== 'number' || price < 0) {
    errors.push('Valid price is required');
  }

  const validCurrencies = ['USD', '$'];
  if (!currency || !validCurrencies.includes(currency)) {
    errors.push('Valid currency is required (USD or $)');
  }

  if (!Array.isArray(amenities) || amenities.some(a => typeof a !== 'string')) {
    errors.push('Amenities must be an array of strings');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// @desc    Get all trips
// @route   GET /api/trips
// @access  Public
exports.getTrips = async (req, res) => {
  try {
    const trips = await Trip.findAll();
    res.status(200).json({ success: true, count: trips.length, data: trips });
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Public
exports.getTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }
    
    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    console.error('Error fetching trip:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Create new trip
// @route   POST /api/trips
// @access  Private/Admin
exports.createTrip = async (req, res) => {
  try {
    const validation = validateTripData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.errors
      });
    }

    const tripData = {
      ...req.body,
      // Ensure dates are in the correct format
      dates: req.body.dates.map(date => new Date(date).toISOString().split('T')[0])
    };

    const trip = await Trip.create(tripData);
    res.status(201).json({ success: true, data: trip });
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error creating trip',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update trip
// @route   PUT /api/trips/:id
// @access  Private/Admin
exports.updateTrip = async (req, res) => {
  try {
    const validation = validateTripData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.errors
      });
    }

    const tripData = {
      ...req.body,
      // Ensure dates are in the correct format
      dates: req.body.dates.map(date => new Date(date).toISOString().split('T')[0])
    };

    const trip = await Trip.update(req.params.id, tripData);
    
    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }
    
    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    console.error('Error updating trip:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error updating trip',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Private/Admin
exports.deleteTrip = async (req, res) => {
  try {
    const deleted = await Trip.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error deleting trip',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
