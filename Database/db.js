const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    // Add this SSL block so Render doesn't reject the connection
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
module.exports = {pool};