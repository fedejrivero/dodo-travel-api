const db = require('../config/db');

class Expense {
  static async findAll() {
    const [rows] = await db.query(
      `
      SELECT
        id,
        date,
        description,
        value,
        currency,
        conversion,
        is_from_fede AS isFromFede
      FROM expenses
      ORDER BY date DESC, id DESC
    `
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query(
      `
      SELECT
        id,
        date,
        description,
        value,
        currency,
        conversion,
        is_from_fede AS isFromFede
      FROM expenses
      WHERE id = ?
    `,
      [id]
    );
    return rows[0] || null;
  }

  static async create(expenseData) {
    const { date, description, value, currency, conversion, isFromFede } = expenseData;
    const [result] = await db.query(
      'INSERT INTO expenses (date, description, value, currency, conversion, is_from_fede) VALUES (?, ?, ?, ?, ?, ?)',
      [date, description, value, currency, conversion ?? null, isFromFede ?? 0]
    );
    return this.findById(result.insertId);
  }

  static async update(id, expenseData) {
    const { date, description, value, currency, conversion, isFromFede } = expenseData;
    await db.query(
      'UPDATE expenses SET date = ?, description = ?, value = ?, currency = ?, conversion = ?, is_from_fede = COALESCE(?, is_from_fede) WHERE id = ?',
      [date, description, value, currency, conversion ?? null, isFromFede ?? null, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    await db.query('DELETE FROM expenses WHERE id = ?', [id]);
    return true;
  }
}

module.exports = Expense;

