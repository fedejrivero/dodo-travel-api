const db = require('../config/db');

class Rate {
  // Get all rates
  static async findAll() {
    const [rows] = await db.query('SELECT * FROM rates');
    return rows;
  }

  // Get a single rate by ID
  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM rates WHERE id = ?', [id]);
    return rows[0] || null;
  }

  // Get all rates for a specific trip
  static async getAllRatesByTripId(tripId) {
    const [rows] = await db.query('SELECT * FROM rates WHERE trip_id = ?', [tripId]);
    return rows;
  }

  // Create a new rate
  static async create(rateData) {
    const { hotel, date, nights, busBed, regime, asist, excursions, price, trip_id } = rateData;
    
    const [result] = await db.query(
      'INSERT INTO rates (hotel, date, nights, busBed, regime, asist, excursions, price, trip_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [hotel, date, nights, busBed, regime, asist, excursions, price, trip_id]
    );
    
    return this.findById(result.insertId);
  }

  // Update a rate
  static async update(id, rateData) {
    const { hotel, date, nights, busBed, regime, asist, excursions, price, trip_id } = rateData;
    
    await db.query(
      'UPDATE rates SET hotel = ?, date = ?, nights = ?, busBed = ?, regime = ?, asist = ?, excursions = ?, price = ?, trip_id = ? WHERE id = ?',
      [hotel, date, nights, busBed, regime, asist, excursions, price, trip_id, id]
    );
    
    return this.findById(id);
  }

  // Delete a rate
  static async delete(id) {
    const rate = await this.findById(id);
    if (!rate) return null;
    
    await db.query('DELETE FROM rates WHERE id = ?', [id]);
    return rate;
  }

  static async deleteRatesByTripId(tripId) {
    const [rows] = await db.query('DELETE FROM rates WHERE trip_id = ?', [tripId]);
    return rows;
  }
}

module.exports = Rate;
