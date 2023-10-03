import { createPool } from "mysql2/promise";

export function getConnectionPool(config) {
  const pool = createPool(config);
  console.log("Connected to database");
  return pool;
}

// Get column names of each table from database
export async function getColumns(pool) {
  const columns = {
    teams: [],
    seasons: [],
    playoff_series: [],
    standings: [],
    goalies: [],
    skaters: [],
    games: []
  };

  const connection = await pool.getConnection();
  for (const [key, value] of Object.entries(columns)) {
    const [rows] = await connection.query("SHOW COLUMNS FROM " + key);
    rows.forEach(row => value.push(row.Field));
  }
  connection.release();

  return columns;
}

/* Insert the given rows into the specified table, the column names are given as
an array of strings and the rows to insert is an array containing arrays of
values */
export async function insertIntoTable(pool, table, columns, rows) {
  if (rows.length === 0) return;
  const statement = "REPLACE INTO " + table + " (`" + columns.join("`, `")
    + "`) VALUES ?";
  const connection = await pool.getConnection();
  await connection.query(statement, [rows]);
  connection.release();
}

// Delete all rows in teams table
export async function clearTable(pool, table) {
  const connection = await pool.getConnection();
  await connection.query(`DELETE FROM ${table}`);
  connection.release();
}