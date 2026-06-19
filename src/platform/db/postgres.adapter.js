const { Pool } = require('pg');
const env = require('../config/env');

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: env.dbUri });
  }
  return pool;
}

async function query(text, params) {
  return getPool().query(text, params);
}

async function close() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = { query, close, getPool };
