const db = require('../config/db');

class Passenger {
  static async findByClientId(clientId) {
    const [rows] = await db.query('SELECT * FROM passengers WHERE client_id = ? ORDER BY surname ASC, name ASC', [clientId]);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM passengers WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create(passengerData, connection = null) {
    const executor = connection || db;
    const { clientId, dni, name, surname, birthday } = passengerData;
    const [result] = await executor.query(
      'INSERT INTO passengers (client_id, dni, name, surname, birthday) VALUES (?, ?, ?, ?, ?)',
      [clientId, dni, name, surname, birthday]
    );
    const [rows] = await executor.query('SELECT * FROM passengers WHERE id = ?', [result.insertId]);
    return rows[0];
  }

  static async update(id, passengerData) {
    const { dni, name, surname, birthday } = passengerData;
    await db.query(
      'UPDATE passengers SET dni = ?, name = ?, surname = ?, birthday = ? WHERE id = ?',
      [dni, name, surname, birthday, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    await db.query('DELETE FROM passengers WHERE id = ?', [id]);
    return true;
  }
}

module.exports = Passenger;
