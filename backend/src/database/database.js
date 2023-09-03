import mysql from "mysql2/promise";
import DB_CONFIG from "./db-config.js";

const connection = await mysql.createConnection(DB_CONFIG);
console.log("Connected to database.");

export default connection;