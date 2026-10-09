import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'medlink',
  password: process.env.DB_PASSWORD || 'medlink_secret',
  database: process.env.DB_NAME || 'medlink',
});

export default pool;