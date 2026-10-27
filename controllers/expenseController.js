const Expense = require('../models/expenseModel');

const validateExpenseData = (data) => {
  const errors = [];

  const date = data?.date;
  const description = (data?.description ?? data?.decription ?? '').toString();
  const value = data?.value;
  const currency = data?.currency;
  const conversion = data?.conversion;
  const isFromFedeProvided = data && Object.prototype.hasOwnProperty.call(data, 'isFromFede');
  const isFromFede = data?.isFromFede;

  if (!date) {
    errors.push('Date is required');
  }

  if (!description || description.trim() === '') {
    errors.push('Description is required');
  }

  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    errors.push('Valid value is required');
  } else if (Number(value) < 0) {
    errors.push('Value must be >= 0');
  }

  const validCurrencies = ['USD', '$'];
  if (!currency || !validCurrencies.includes(currency)) {
    errors.push('Valid currency is required (USD or $)');
  }

  if (isFromFedeProvided && ![0, '0', 1, '1'].includes(isFromFede)) {
    errors.push('isFromFede must be 0 or 1');
  }

  if (currency === 'USD') {
    // For USD we store conversion as null
    if (conversion !== undefined && conversion !== null && conversion !== '') {
      if (Number.isNaN(Number(conversion))) {
        errors.push('Conversion must be a number');
      }
    }
  } else if (currency === '$') {
    if (conversion !== undefined && conversion !== null && conversion !== '') {
      if (Number.isNaN(Number(conversion))) {
        errors.push('Conversion must be a number');
      } else if (Number(conversion) <= 0) {
        errors.push('Conversion must be > 0');
      }
    }
  }

  return { isValid: errors.length === 0, errors };
};

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll();
    res.status(200).json({ success: true, count: expenses.length, data: expenses });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.getExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }
    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const validation = validateExpenseData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.errors
      });
    }

    const expenseData = {
      date: req.body.date,
      description: (req.body.description ?? req.body.decription)?.toString()?.trim(),
      value: Number(req.body.value),
      currency: req.body.currency,
      conversion:
        req.body.currency === '$' && req.body.conversion !== '' && req.body.conversion !== undefined
          ? Number(req.body.conversion)
          : null,
      isFromFede: req.body.isFromFede === undefined ? undefined : Number(req.body.isFromFede)
    };

    const expense = await Expense.create(expenseData);
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating expense',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const validation = validateExpenseData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.errors
      });
    }

    const expenseData = {
      date: req.body.date,
      description: (req.body.description ?? req.body.decription)?.toString()?.trim(),
      value: Number(req.body.value),
      currency: req.body.currency,
      conversion:
        req.body.currency === '$' && req.body.conversion !== '' && req.body.conversion !== undefined
          ? Number(req.body.conversion)
          : null,
      isFromFede: req.body.isFromFede === undefined ? undefined : Number(req.body.isFromFede)
    };

    const updated = await Expense.update(req.params.id, expenseData);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating expense',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    await Expense.delete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting expense',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

