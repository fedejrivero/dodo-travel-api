const Payment = require('../models/paymentModel');
const Service = require('../models/serviceModel');
const FileModel = require('../models/fileModel');

const EPS = 0.0001;

const sumByCurrency = (items, field) => {
  return (items || []).reduce((acc, item) => {
    const currency = item.currency || '$';
    const value = Number(item[field] || 0);
    acc[currency] = (acc[currency] || 0) + value;
    return acc;
  }, {});
};

const maybeMarkFileComplete = async (fileId) => {
  if (!fileId) return;
  
  const file = await FileModel.findById(fileId);
  if (!file) return;

  const services = await Service.findByFileId(fileId);
  const payments = await Payment.findByFileId(fileId);

  const serviceTotals = sumByCurrency(services, 'price');
  const paymentTotals = sumByCurrency(payments, 'value');
  // Evaluar por moneda (si hay servicios en una moneda, los pagos en esa moneda deben cubrirlos)
  const currencies = new Set(Object.keys(serviceTotals));

  const complete = Array.from(currencies).every((cur) => {
    const servicesTotal = Number(serviceTotals[cur] || 0);
    const paymentsTotal = Number(paymentTotals[cur] || 0);
    // COMPLETO si pagos >= servicios (tolerancia por decimales)
    return paymentsTotal + EPS >= servicesTotal;
  });

  await FileModel.update(fileId, {
    clientId: file.client_id,
    creationDate: file.creation_date,
    dateOut: file.date_out,
    dateIn: file.date_in,
    status: complete ? 'Completo' : 'Incompleto'
  });
};

exports.getPaymentsByFile = async (req, res) => {
  try {
    const payments = await Payment.findByFileId(req.params.fileId);
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.createPayment = async (req, res) => {
  try {
    const fileId = req.params.fileId || req.body.fileId;
    const { date, value, currency, type, detail, receipt } = req.body;
    if (!fileId || !date || !value || !currency || !type) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const payment = await Payment.create({ fileId, date, value, currency, type, detail, receipt });

    // Re-evaluate file status based on totals after adding payment
    try {
      await maybeMarkFileComplete(fileId);
    } catch (err) {
      console.error('Error updating file status after payment', err);
    }

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ success: false, error: 'Error creating payment' });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const updated = await Payment.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    // Re-evaluate file status based on totals after updating payment
    try {
      await maybeMarkFileComplete(updated.file_id);
    } catch (err) {
      console.error('Error updating file status after payment', err);
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ success: false, error: 'Error updating payment' });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const existing = await Payment.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    await Payment.delete(req.params.id);

    // Re-evaluate file status based on totals after deleting payment
    try {
      await maybeMarkFileComplete(existing.file_id);
    } catch (err) {
      console.error('Error updating file status after payment deletion', err);
    }
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ success: false, error: 'Error deleting payment' });
  }
};
