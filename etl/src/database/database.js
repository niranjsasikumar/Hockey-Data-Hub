import mysql from "mysql2/promise";

export async function getDatabaseConnection(config) {
  const connection = await mysql.createConnection(config);
  console.log("Connected to database");
  return connection;
}

// Get column names of each table from database
export async function getColumns(connection) {
  const columns = {
    teams: [],
    seasons: [],
    playoff_series: [],
    standings: [],
    goalies: [],
    skaters: [],
    games: []
  };

  for (const [key, value] of Object.entries(columns)) {
    const [rows] = await connection.query("SHOW COLUMNS FROM " + key);
    rows.forEach(row => value.push(row.Field));
  }

  return columns;
}

/* Insert the given rows into the specified table, the column names are given as
an array of strings and the rows to insert is an array containing arrays of
values */
export async function insertIntoTable(connection, table, columns, rows) {
  if (rows.length === 0) return;
  const statement = "REPLACE INTO " + table + " (`" + columns.join("`, `")
    + "`) VALUES ?";
  await connection.query(statement, [rows]);
}

// Delete all rows in teams table
export async function clearTable(connection, table) {
  await connection.query(`DELETE FROM ${table}`);
}