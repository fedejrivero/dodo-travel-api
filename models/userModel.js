const bcrypt = require('bcryptjs');
const pool = require('../config/db');

class User {
  static async create({ name, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT id, name, email FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password);
  }
}

module.exports = User;
