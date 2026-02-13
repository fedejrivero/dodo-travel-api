const FileModel = require('../models/fileModel');
const Service = require('../models/serviceModel');
const Payment = require('../models/paymentModel');
const FilePassengerModel = require('../models/filePassengerModel');
const Passenger = require('../models/passengerModel');

exports.getFiles = async (req, res) => {
  try {
    const files = await FileModel.findAll();
    res.status(200).json({ success: true, data: files });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.getFile = async (req, res) => {
  try {
    const file = await FileModel.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }
    const services = await Service.findByFileId(req.params.id);
    const payments = await Payment.findByFileId(req.params.id);
    const passengers = await FilePassengerModel.findPassengersByFileId(req.params.id);
    res.status(200).json({ success: true, data: { ...file, services, payments, passengers } });
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.createFile = async (req, res) => {
  try {
    const { clientId, dateOut, dateIn, status, creationDate } = req.body;
    if (!clientId || !dateOut) {
      return res.status(400).json({ success: false, error: 'clientId and dateOut are required' });
    }
    const payload = {
      clientId,
      creationDate: creationDate || new Date().toISOString().slice(0, 10),
      dateOut,
      dateIn: dateIn || null,
      status: status || 'Incompleto'
    };
    const file = await FileModel.create(payload);

    // Asociar automáticamente el pasajero "principal" (mismo DNI que el cliente)
    try {
      const clientDni = file?.client_dni;
      if (file?.client_id && clientDni !== undefined && clientDni !== null) {
        const passengers = await Passenger.findByClientId(file.client_id);
        const primary = (passengers || []).find((p) => String(p.dni) === String(clientDni));
        if (primary?.id) {
          await FilePassengerModel.addPassengerToFile(file.id, primary.id);
        }
      }
    } catch (err) {
      // No bloquear la creación de la ficha si falla la asociación automática
      console.error('Error auto-linking primary passenger to file', err);
    }

    res.status(201).json({ success: true, data: file });
  } catch (error) {
    console.error('Error creating file:', error);
    res.status(500).json({ success: false, error: 'Error creating file' });
  }
};

exports.updateFile = async (req, res) => {
  try {
    const existing = await FileModel.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    // Preserve fields if not sent by older UIs
    const payload = {
      ...req.body,
      dateOut: req.body.dateOut === undefined ? existing.date_out : req.body.dateOut,
      dateIn: req.body.dateIn === undefined ? existing.date_in : req.body.dateIn
    };

    const updated = await FileModel.update(req.params.id, payload);

    // Si cambian las fechas de la ficha, propagar a todos los servicios asociados (BE)
    try {
      await Service.updateDatesByFileId(req.params.id, updated.date_out, updated.date_in);
    } catch (err) {
      console.error('Error updating services dates after file update', err);
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating file:', error);
    res.status(500).json({ success: false, error: 'Error updating file' });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    await FileModel.delete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ success: false, error: 'Error deleting file' });
  }
};
