const db = require('../config/db');

class FileModel {
  static async findAll() {
    const [rows] = await db.query(`
      SELECT f.*, c.name AS client_name, c.surname AS client_surname
      FROM files f
      INNER JOIN clients c ON f.client_id = c.id
      ORDER BY f.creation_date DESC, f.id DESC
    `);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query(`
      SELECT f.*, c.name AS client_name, c.surname AS client_surname, c.dni AS client_dni, c.cuil AS client_cuil, c.mail AS client_mail, c.birthday AS client_birthday
      FROM files f
      INNER JOIN clients c ON f.client_id = c.id
      WHERE f.id = ?
    `, [id]);
    return rows[0] || null;
  }

  static async findByClientId(clientId) {
    const [rows] = await db.query(`
      SELECT f.*, c.name AS client_name, c.surname AS client_surname
      FROM files f
      INNER JOIN clients c ON f.client_id = c.id
      WHERE f.client_id = ?
      ORDER BY f.creation_date DESC, f.id DESC
    `, [clientId]);
    return rows;
  }

  static async create(fileData) {
    const { clientId, creationDate, dateOut, dateIn, status } = fileData;
    const creation = creationDate || new Date().toISOString().slice(0, 10);
    const [result] = await db.query(
      'INSERT INTO files (client_id, creation_date, date_out, date_in, status) VALUES (?, ?, ?, ?, ?)',
      [clientId, creation, dateOut, dateIn ?? null, status || 'Incompleto']
    );
    return this.findById(result.insertId);
  }

  static async update(id, fileData) {
    const { clientId, creationDate = null, dateOut, dateIn, status } = fileData;
    await db.query(
      'UPDATE files SET client_id = ?, creation_date = ?, date_out = ?, date_in = ?, status = ? WHERE id = ?',
      [clientId, creationDate, dateOut, dateIn ?? null, status, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    await db.query('DELETE FROM files WHERE id = ?', [id]);
    return true;
  }
}

module.exports = FileModel;
