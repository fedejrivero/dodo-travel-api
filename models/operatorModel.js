const db = require('../config/db');

class Operator {
  static async findAll() {
    const [rows] = await db.query('SELECT * FROM operators ORDER BY name ASC');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM operators WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create(operatorData) {
    const { name, cuit } = operatorData;
    const [result] = await db.query(
      'INSERT INTO operators (name, cuit) VALUES (?, ?)',
      [name, cuit]
    );
    return this.findById(result.insertId);
  }

  static async update(id, operatorData) {
    const { name, cuit } = operatorData;
    await db.query(
      'UPDATE operators SET name = ?, cuit = ? WHERE id = ?',
      [name, cuit, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    await db.query('DELETE FROM operators WHERE id = ?', [id]);
    return true;
  }
}

module.exports = Operator;
