const db = require('../config/db');

class Client {
  static async findAll() {
    const [rows] = await db.query('SELECT * FROM clients ORDER BY surname ASC, name ASC');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM clients WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create(clientData, connection = null) {
    const executor = connection || db;
    const { dni, name, surname, cuil, birthday, mail, phone } = clientData;
    const [result] = await executor.query(
      'INSERT INTO clients (dni, name, surname, cuil, birthday, mail, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [dni, name, surname, cuil || null, birthday, mail || null, phone || null]
    );
    const [rows] = await executor.query('SELECT * FROM clients WHERE id = ?', [result.insertId]);
    return rows[0];
  }

  static async update(id, clientData) {
    const { dni, name, surname, cuil, birthday, mail, phone } = clientData;
    await db.query(
      'UPDATE clients SET dni = ?, name = ?, surname = ?, cuil = ?, birthday = ?, mail = ?, phone = ? WHERE id = ?',
      [dni, name, surname, cuil || null, birthday, mail || null, phone || null, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    await db.query('DELETE FROM clients WHERE id = ?', [id]);
    return true;
  }
}

module.exports = Client;
