const Service = require('../models/serviceModel');

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

exports.getServicesByFile = async (req, res) => {
  try {
    const services = await Service.findByFileId(req.params.fileId);
    res.status(200).json({ success: true, data: services });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.getAllServices = async (_req, res) => {
  try {
    const services = await Service.findAll();
    res.status(200).json({ success: true, data: services });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.createService = async (req, res) => {
  try {
    const fileId = req.params.fileId || req.body.fileId;
    if (!fileId) {
      return res.status(400).json({ success: false, error: 'fileId is required' });
    }
    const payload = {
      fileId,
      operatorId: req.body.operatorId,
      type: req.body.type,
      description: req.body.description,
      price: req.body.price,
      currency: req.body.currency,
      status: req.body.status || 'Incompleto',
      dateOut: req.body.dateOut,
      dateIn: req.body.dateIn,
      dateProfitability: req.body.dateProfitability,
      cost: req.body.cost,
      bankExpense: req.body.bankExpense,
      bill: req.body.bill,
      liquidation: req.body.liquidation
    };
    if (!payload.operatorId || !payload.type || !payload.price || !payload.currency || !payload.dateOut || !isNonEmptyString(payload.description)) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const service = await Service.create(payload);
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ success: false, error: 'Error creating service' });
  }
};

exports.updateService = async (req, res) => {
  try {
    // Preserve fields not sent by older UIs
    const existing = await Service.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }

    const payload = {
      ...req.body,
      cost: req.body.cost === undefined ? existing.cost : req.body.cost,
      bankExpense: req.body.bankExpense === undefined ? existing.bank_expense : req.body.bankExpense,
      bill: req.body.bill === undefined ? existing.bill : req.body.bill,
      liquidation: req.body.liquidation === undefined ? existing.liquidation : req.body.liquidation,
      description: req.body.description === undefined ? existing.description : req.body.description,
      dateIn: req.body.dateIn === undefined ? existing.date_in : req.body.dateIn,
      dateProfitability: req.body.dateProfitability === undefined ? existing.date_profitability : req.body.dateProfitability
    };

    if (!isNonEmptyString(payload.description)) {
      return res.status(400).json({ success: false, error: 'description is required' });
    }

    const updated = await Service.update(req.params.id, payload);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ success: false, error: 'Error updating service' });
  }
};

exports.deleteService = async (req, res) => {
  try {
    await Service.delete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ success: false, error: 'Error deleting service' });
  }
};
