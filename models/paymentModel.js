const db = require('../config/db');

class Payment {
  static async findByFileId(fileId) {
    const [rows] = await db.query(`
      SELECT
        id,
        file_id,
        date,
        value,
        currency,
        type,
        detail,
        receipt
      FROM payments
      WHERE file_id = ?
      ORDER BY date DESC, id DESC
    `, [fileId]);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query(`
      SELECT
        id,
        file_id,
        date,
        value,
        currency,
        type,
        detail,
        receipt
      FROM payments
      WHERE id = ?
    `, [id]);
    return rows[0] || null;
  }

  static async create(paymentData) {
    const { fileId, date, value, currency, type, detail, receipt } = paymentData;
    const [result] = await db.query(
      'INSERT INTO payments (file_id, date, value, currency, type, detail, receipt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [fileId, date, value, currency, type, detail ?? null, receipt]
    );
    return this.findById(result.insertId);
  }

  static async update(id, paymentData) {
    const { date, value, currency, type, detail, receipt } = paymentData;
    await db.query(
      'UPDATE payments SET date = ?, value = ?, currency = ?, type = ?, detail = ?, receipt = ? WHERE id = ?',
      [date, value, currency, type, detail ?? null, receipt, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    await db.query('DELETE FROM payments WHERE id = ?', [id]);
    return true;
  }
}

module.exports = Payment;
