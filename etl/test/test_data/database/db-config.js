import dotenv from "dotenv";
dotenv.config();

export const TEST_DB_CONFIG = {
  host: process.env.TEST_DB_HOST,
  port: process.env.TEST_DB_PORT,
  user: process.env.TEST_DB_USER,
  password: process.env.TEST_DB_PASSWORD,
  database: process.env.TEST_DB_DATABASE,
  connectionLimit: 10
};