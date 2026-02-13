const Deposit = require('../models/depositModel');
const Service = require('../models/serviceModel');

const EPS = 0.0001;

const normalizeDepositType = (type) => {
  const raw = String(type ?? '').trim();
  const t = raw.toLowerCase();
  if (!t) return raw;
  if (t === 'transferencia' || t === 'tranferencia') return Deposit.TYPES.TRANSFERENCIA;
  if (t === 'efectivo') return Deposit.TYPES.EFECTIVO;
  if (t === 'pago directo del pasajero') return Deposit.TYPES.PAGO_DIRECTO_PASAJERO;
  return raw;
};

const maybeMarkServiceComplete = async (serviceId) => {
  if (!serviceId) return;
  
  const service = await Service.findById(serviceId);
  if (!service) return;
  const deposits = await Deposit.findByServiceId(serviceId);

  const cost = service.cost === null || service.cost === undefined ? 0 : Number(service.cost || 0);
  // Si el servicio tiene moneda, solo contar pagos en esa moneda.
  const serviceCurrency = service.currency;
  const eligibleDeposits = (deposits || []).filter((d) => {
    if (!serviceCurrency) return true;
    if (!d.currency) return true;
    return d.currency === serviceCurrency;
  });
  const paid = eligibleDeposits.reduce((acc, d) => acc + Number(d.value || 0), 0);

  // COMPLETO si pagos >= costo (tolerancia por decimales)
  const complete = paid + EPS >= cost;
  // Si es COMPLETO, dateProfitability = fecha mayor de los depósitos asociados (en la moneda del servicio).
  // Si es INCOMPLETO, dateProfitability = null.
  const dateProfitability = complete ? (eligibleDeposits[0]?.date || null) : null;
  await Service.updateStatus(serviceId, complete ? 'Completo' : 'Incompleto', dateProfitability);
};

exports.getDepositsByService = async (req, res) => {
  try {
    const deposits = await Deposit.findByServiceId(req.params.serviceId);
    res.status(200).json({ success: true, data: deposits });
  } catch (error) {
    console.error('Error fetching deposits:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.createDeposit = async (req, res) => {
  try {
    const serviceId = req.params.serviceId || req.body.serviceId;
    const { date, value, currency, type, receipt } = req.body;
    if (!serviceId || !date || !value || !currency || !type) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const normalizedType = normalizeDepositType(type);
    if (!Deposit.ALLOWED_TYPES.includes(normalizedType)) {
      return res.status(400).json({ success: false, error: 'Invalid deposit type' });
    }

    const deposit = await Deposit.create({ serviceId, date, value, currency, type: normalizedType, receipt });

    // Re-evaluate service status based on totals after adding deposit
    try {
      await maybeMarkServiceComplete(serviceId);
    } catch (err) {
      console.error('Error updating service status after deposit', err);
    }

    res.status(201).json({ success: true, data: deposit });
  } catch (error) {
    console.error('Error creating deposit:', error);
    res.status(500).json({ success: false, error: 'Error creating deposit' });
  }
};

exports.updateDeposit = async (req, res) => {
  try {
    const normalizedType = normalizeDepositType(req.body?.type);
    if (req.body?.type !== undefined && !Deposit.ALLOWED_TYPES.includes(normalizedType)) {
      return res.status(400).json({ success: false, error: 'Invalid deposit type' });
    }

    const updated = await Deposit.update(req.params.id, { ...req.body, type: normalizedType });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Deposit not found' });
    }
    
    // Re-evaluate service status based on totals after updating deposit
    try {
      await maybeMarkServiceComplete(updated.service_id);
    } catch (err) {
      console.error('Error updating service status after deposit', err);
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating deposit:', error);
    res.status(500).json({ success: false, error: 'Error updating deposit' });
  }
};

exports.deleteDeposit = async (req, res) => {
  try {
    const existing = await Deposit.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Deposit not found' });
    }

    await Deposit.delete(req.params.id);

    // Re-evaluate service status based on totals after deleting deposit
    try {
      await maybeMarkServiceComplete(existing.service_id);
    } catch (err) {
      console.error('Error updating service status after deposit deletion', err);
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting deposit:', error);
    res.status(500).json({ success: false, error: 'Error deleting deposit' });
  }
};
