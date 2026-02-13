const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'srv847.hstgr.io', 
  database: process.env.DB_NAME || 'u308739288_backoffice',
  user: process.env.DB_USER || 'u308739288_admin',
  password: process.env.DB_PASSWORD || 'Porron124',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
