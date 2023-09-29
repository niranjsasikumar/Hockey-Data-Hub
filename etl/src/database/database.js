import mysql from "mysql2/promise";
import { DB_CONFIG } from "../constants.js";

export const connection = await mysql.createConnection(DB_CONFIG);
console.log("Connected to database");

export const columns = {
  teams: [],
  seasons: [],
  playoff_series: [],
  standings: [],
  goalies: [],
  skaters: [],
  games: []
};

// Get column names of each table from database
for (const [key, value] of Object.entries(columns)) {
  const [rows] = await connection.query("SHOW COLUMNS FROM " + key);
  rows.forEach(row => value.push(row.Field));
}

/* Insert the given rows into the specified table, the column names are given as
an array of strings and the rows to insert is an array containing arrays of
values */
export async function insertIntoTable(table, columns, rows) {
  if (rows.length === 0) return;
  const statement = "REPLACE INTO " + table + " (`" + columns.join("`, `")
    + "`) VALUES ?";
  await connection.query(statement, [rows]);
}

// Delete all rows in teams table
export async function clearTeamsTable() {
  await connection.query("DELETE FROM teams");
}