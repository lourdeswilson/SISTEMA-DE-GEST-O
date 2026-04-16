const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'sistema_gestao',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

const connectDatabase = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✅ PostgreSQL conectado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao conectar PostgreSQL:', error.message);
  }
};

module.exports = { pool, connectDatabase };