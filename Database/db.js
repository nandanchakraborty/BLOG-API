const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({

    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,

    ssl: isProduction
        ? {
              rejectUnauthorized: false
          }
        : false
});

pool.connect()
    .then(() => {
        console.log('Database connected successfully');
    })
    .catch((err) => {
        console.log('Database connection error:', err);
    });

module.exports = pool;