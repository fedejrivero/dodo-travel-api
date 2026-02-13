const FileModel = require('../models/fileModel');
const Passenger = require('../models/passengerModel');
const FilePassengerModel = require('../models/filePassengerModel');

const ensureSameClient = async ({ fileId, passengerId }) => {
  const file = await FileModel.findById(fileId);
  if (!file) {
    const err = new Error('File not found');
    err.statusCode = 404;
    throw err;
  }

  const passenger = await Passenger.findById(passengerId);
  if (!passenger) {
    const err = new Error('Passenger not found');
    err.statusCode = 404;
    throw err;
  }

  if (Number(passenger.client_id) !== Number(file.client_id)) {
    const err = new Error('Passenger does not belong to file client');
    err.statusCode = 400;
    throw err;
  }

  return { file, passenger };
};

exports.getPassengersByFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await FileModel.findById(fileId);
    if (!file) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }
    const passengers = await FilePassengerModel.findPassengersByFileId(fileId);
    res.status(200).json({ success: true, data: passengers });
  } catch (error) {
    console.error('Error fetching file passengers:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.addPassengerToFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { passengerId } = req.body;

    if (!passengerId) {
      return res.status(400).json({ success: false, error: 'passengerId is required' });
    }

    await ensureSameClient({ fileId, passengerId });
    await FilePassengerModel.addPassengerToFile(fileId, passengerId);
    const passengers = await FilePassengerModel.findPassengersByFileId(fileId);
    res.status(201).json({ success: true, data: passengers });
  } catch (error) {
    const status = error.statusCode || 500;
    const msg =
      error.message === 'File not found'
        ? 'File not found'
        : error.message === 'Passenger not found'
          ? 'Passenger not found'
          : error.message === 'Passenger does not belong to file client'
            ? 'Passenger must belong to the same client as the file'
            : 'Error adding passenger to file';
    console.error('Error adding passenger to file:', error);
    res.status(status).json({ success: false, error: msg });
  }
};

exports.removePassengerFromFile = async (req, res) => {
  try {
    const { fileId, passengerId } = req.params;

    // Validar existencia para errores claros
    const file = await FileModel.findById(fileId);
    if (!file) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }
    const passenger = await Passenger.findById(passengerId);
    if (!passenger) {
      return res.status(404).json({ success: false, error: 'Passenger not found' });
    }
    if (Number(passenger.client_id) !== Number(file.client_id)) {
      return res.status(400).json({ success: false, error: 'Passenger must belong to the same client as the file' });
    }

    await FilePassengerModel.removePassengerFromFile(fileId, passengerId);
    const passengers = await FilePassengerModel.findPassengersByFileId(fileId);
    res.status(200).json({ success: true, data: passengers });
  } catch (error) {
    console.error('Error removing passenger from file:', error);
    res.status(500).json({ success: false, error: 'Error removing passenger from file' });
  }
};

