const Passenger = require('../models/passengerModel');

exports.getPassengersByClient = async (req, res) => {
  try {
    const passengers = await Passenger.findByClientId(req.params.clientId);
    res.status(200).json({ success: true, data: passengers });
  } catch (error) {
    console.error('Error fetching passengers:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.createPassenger = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { dni, name, surname, birthday } = req.body;
    if (!dni || !name || !surname || !birthday) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const passenger = await Passenger.create({ clientId, dni, name, surname, birthday });
    res.status(201).json({ success: true, data: passenger });
  } catch (error) {
    console.error('Error creating passenger:', error);
    res.status(500).json({ success: false, error: 'Error creating passenger' });
  }
};

exports.updatePassenger = async (req, res) => {
  try {
    const updated = await Passenger.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Passenger not found' });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating passenger:', error);
    res.status(500).json({ success: false, error: 'Error updating passenger' });
  }
};

exports.deletePassenger = async (req, res) => {
  try {
    await Passenger.delete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting passenger:', error);
    res.status(500).json({ success: false, error: 'Error deleting passenger' });
  }
};
