const db = require('../config/db');

class Service {
  static async findAll() {
    const [rows] = await db.query(`
      SELECT s.*,
             o.name AS operator_name,
             o.cuit AS operator_cuit,
             f.id AS file_number,
             f.date_out AS file_date_out,
             f.creation_date AS file_creation_date,
             c.surname AS client_surname,
             c.name AS client_name
      FROM services s
      INNER JOIN operators o ON s.operator_id = o.id
      INNER JOIN files f ON s.file_id = f.id
      INNER JOIN clients c ON f.client_id = c.id
      ORDER BY s.date_out DESC, s.id DESC
    `);
    return rows;
  }

  static async findByFileId(fileId) {
    const [rows] = await db.query(`
      SELECT s.*,
             o.name AS operator_name,
             o.cuit AS operator_cuit
      FROM services s
      INNER JOIN operators o ON s.operator_id = o.id
      WHERE s.file_id = ?
      ORDER BY s.date_out DESC, s.id DESC
    `, [fileId]);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query(`
      SELECT s.*,
             o.name AS operator_name,
             o.cuit AS operator_cuit
      FROM services s
      INNER JOIN operators o ON s.operator_id = o.id
      WHERE s.id = ?
    `, [id]);
    return rows[0] || null;
  }

  static async create(serviceData) {
    const {
      fileId,
      operatorId,
      type,
      description,
      price,
      currency,
      conversion,
      status,
      dateOut,
      dateIn,
      file,
      cost,
      bankExpense,
      bill,
      dateProfitability
    } = serviceData;
    const [result] = await db.query(
      'INSERT INTO services (file_id, operator_id, type, description, price, currency, conversion, status, date_out, date_in, date_profitability, `file`, cost, bank_expense, bill) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [fileId, operatorId, type, description, price, currency, conversion ?? null, status || 'Incompleto', dateOut, dateIn ?? null, dateProfitability ?? null, file ?? null, cost ?? null, bankExpense ?? null, bill ?? null]
    );
    return this.findById(result.insertId);
  }

  static async update(id, serviceData) {
    const {
      operatorId,
      type,
      description,
      price,
      currency,
      conversion,
      status,
      dateOut,
      dateIn,
      file,
      cost,
      bankExpense,
      bill,
      dateProfitability
    } = serviceData;
    await db.query(
      `
        UPDATE services
        SET operator_id = ?,
            type = ?,
            description = ?,
            price = ?,
            currency = ?,
            conversion = ?,
            status = ?,
            date_out = ?,
            date_in = ?,
            date_profitability = ?,
            \`file\` = ?,
            cost = ?,
            bank_expense = ?,
            bill = ?
        WHERE id = ?
      `,
      [operatorId, type, description, price, currency, conversion ?? null, status || 'Incompleto', dateOut, dateIn ?? null, dateProfitability ?? null, file ?? null, cost ?? null, bankExpense ?? null, bill ?? null, id]
    );
    return this.findById(id);
  }

  static async updateStatus(id, status, dateProfitability) {
    if (dateProfitability === undefined) {
      await db.query('UPDATE services SET status = ? WHERE id = ?', [status, id]);
      return this.findById(id);
    }

    await db.query(
      'UPDATE services SET status = ?, date_profitability = ? WHERE id = ?',
      [status, dateProfitability, id]
    );
    return this.findById(id);
  }

  static async updateDatesByFileId(fileId, dateOut, dateIn) {
    await db.query(
      'UPDATE services SET date_out = ?, date_in = ? WHERE file_id = ?',
      [dateOut, dateIn ?? null, fileId]
    );
    return true;
  }

  static async delete(id) {
    await db.query('DELETE FROM services WHERE id = ?', [id]);
    return true;
  }
}

module.exports = Service;
