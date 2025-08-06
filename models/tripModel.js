const db = require('../config/db');

class Trip {
  // Get all trips
  static async findAll() {
    const [rows] = await db.query('SELECT * FROM trips');
    // Parse JSON fields
    return rows.map(trip => ({
      ...trip,
      dates: JSON.parse(trip.dates),
      amenities: JSON.parse(trip.amenities)
    }));
  }

  // Get a single trip by ID
  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM trips WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    
    const trip = rows[0];
    return {
      ...trip,
      dates: JSON.parse(trip.dates),
      amenities: JSON.parse(trip.amenities)
    };
  }

  // Create a new trip
  static async create(tripData) {
    const { name, category, dates, price, currency, amenities, image_url, image_filename } = tripData;
    
    const [result] = await db.query(
      'INSERT INTO trips (name, category, dates, price, currency, amenities, image_url, image_filename) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        name,
        category,
        JSON.stringify(dates),
        price,
        currency,
        JSON.stringify(amenities),
        image_url,
        image_filename || null
      ]
    );
    
    return this.findById(result.insertId);
  }

  // Update a trip
  static async update(id, tripData) {
    const { name, category, dates, price, currency, amenities, image_url, image_filename } = tripData;
    
    // If we have a new image, update both URL and filename
    // If we don't have a new image but have an existing URL, keep the existing filename
    const updateFields = [
      'name = ?', 'category = ?', 'dates = ?', 'price = ?', 
      'currency = ?', 'amenities = ?', 'image_url = ?',
      image_filename !== undefined ? 'image_filename = ?' : null
    ].filter(Boolean);
    
    const params = [
      name,
      category,
      JSON.stringify(dates),
      price,
      currency,
      JSON.stringify(amenities),
      image_url,
      image_filename
    ].filter((param, index) => {
      // Only include image_filename if it was provided
      if (param === image_filename && image_filename === undefined) return false;
      return true;
    });
    
    params.push(id); // Add id for WHERE clause
    const query = `UPDATE trips SET ${updateFields.join(', ')} WHERE id = ?`;
    const [result] = await db.query(query, params);
    
    return this.findById(id);
  }

  // Delete a trip
  static async delete(id) {
    await db.query('DELETE FROM trips WHERE id = ?', [id]);
    return true;
  }
}

module.exports = Trip;
