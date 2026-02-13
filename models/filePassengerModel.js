const db = require('../config/db');

class FilePassengerModel {
  static async findPassengersByFileId(fileId) {
    const [rows] = await db.query(
      `
        SELECT p.*
        FROM file_passengers fp
        INNER JOIN passengers p ON p.id = fp.passenger_id
        WHERE fp.file_id = ?
        ORDER BY p.surname ASC, p.name ASC
      `,
      [fileId]
    );
    return rows;
  }

  static async addPassengerToFile(fileId, passengerId) {
    // Evitar duplicados por PK (file_id, passenger_id)
    await db.query(
      'INSERT IGNORE INTO file_passengers (file_id, passenger_id) VALUES (?, ?)',
      [fileId, passengerId]
    );
    return true;
  }

  static async removePassengerFromFile(fileId, passengerId) {
    await db.query(
      'DELETE FROM file_passengers WHERE file_id = ? AND passenger_id = ?',
      [fileId, passengerId]
    );
    return true;
  }
}

module.exports = FilePassengerModel;

