const mysql = require('mysql2');
require('dotenv').config();

const env = process.env;

// buat koneksi ke database
const db = mysql.createConnection({
    host: env.DB_HOST || 'localhost',
    user: env.DB_USER || 'root',
    password: env.DB_PASS || '',
    database: env.DB_NAME || 'risol_mayo'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database');
});

module.exports = db;
