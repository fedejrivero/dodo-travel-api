const Operator = require('../models/operatorModel');

exports.getOperators = async (req, res) => {
  try {
    const operators = await Operator.findAll();
    res.status(200).json({ success: true, data: operators });
  } catch (error) {
    console.error('Error fetching operators:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.createOperator = async (req, res) => {
  try {
    const { name, cuit } = req.body;
    if (!name || !cuit) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const operator = await Operator.create({ name, cuit });
    res.status(201).json({ success: true, data: operator });
  } catch (error) {
    console.error('Error creating operator:', error);
    res.status(500).json({ success: false, error: 'Error creating operator' });
  }
};

exports.updateOperator = async (req, res) => {
  try {
    const updated = await Operator.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Operator not found' });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating operator:', error);
    res.status(500).json({ success: false, error: 'Error updating operator' });
  }
};

exports.deleteOperator = async (req, res) => {
  try {
    await Operator.delete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting operator:', error);
    res.status(500).json({ success: false, error: 'Error deleting operator' });
  }
};
