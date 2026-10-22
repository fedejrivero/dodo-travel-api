const db = require('../config/db');

class ServiceDocument {
  static async findByServiceId(serviceId) {
    const [rows] = await db.query(
      `SELECT document_type, original_name, mime_type, file_size, created_at
       FROM service_documents WHERE service_id = ? ORDER BY document_type`,
      [serviceId]
    );
    return rows;
  }

  static async findByType(serviceId, documentType) {
    const [rows] = await db.query(
      `SELECT document_type, original_name, mime_type, file_size, file_data
       FROM service_documents WHERE service_id = ? AND document_type = ?`,
      [serviceId, documentType]
    );
    return rows[0] || null;
  }

  static async save(serviceId, documentType, file) {
    await db.query(
      `INSERT INTO service_documents
        (service_id, document_type, original_name, mime_type, file_size, file_data)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         original_name = VALUES(original_name),
         mime_type = VALUES(mime_type),
         file_size = VALUES(file_size),
         file_data = VALUES(file_data),
         updated_at = CURRENT_TIMESTAMP`,
      [serviceId, documentType, file.originalname, file.mimetype, file.size, file.buffer]
    );
    return this.findByServiceId(serviceId);
  }

  static async delete(serviceId, documentType) {
    await db.query(
      'DELETE FROM service_documents WHERE service_id = ? AND document_type = ?',
      [serviceId, documentType]
    );
  }
}

module.exports = ServiceDocument;
