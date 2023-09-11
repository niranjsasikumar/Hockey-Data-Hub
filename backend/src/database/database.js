import dotenv from "dotenv";
import { createPool } from "mysql2/promise";

dotenv.config();

const DB_CONFIG = {
  connectionLimit: process.env.DB_CONNECTION_LIMIT,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
};

const pool = createPool(DB_CONFIG);
export default pool;