const db = require('../config/db');

const DEPOSIT_TYPES = Object.freeze({
  TRANSFERENCIA: 'tranferencia',
  EFECTIVO: 'efectivo',
  PAGO_DIRECTO_PASAJERO: 'Pago directo del pasajero',
});

const ALLOWED_DEPOSIT_TYPES = Object.freeze(Object.values(DEPOSIT_TYPES));

class Deposit {
  static async findByServiceId(serviceId) {
    const [rows] = await db.query(
      'SELECT * FROM deposits WHERE service_id = ? ORDER BY date DESC, id DESC',
      [serviceId]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM deposits WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create(depositData) {
    const { serviceId, date, value, currency, type, receipt } = depositData;
    const [result] = await db.query(
      'INSERT INTO deposits (service_id, date, value, currency, type, receipt) VALUES (?, ?, ?, ?, ?, ?)',
      [serviceId, date, value, currency, type, receipt || null]
    );
    return this.findById(result.insertId);
  }

  static async update(id, depositData) {
    const { date, value, currency, type, receipt } = depositData;
    await db.query(
      'UPDATE deposits SET date = ?, value = ?, currency = ?, type = ?, receipt = ? WHERE id = ?',
      [date, value, currency, type, receipt || null, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    await db.query('DELETE FROM deposits WHERE id = ?', [id]);
    return true;
  }
}

Deposit.TYPES = DEPOSIT_TYPES;
Deposit.ALLOWED_TYPES = ALLOWED_DEPOSIT_TYPES;

module.exports = Deposit;
