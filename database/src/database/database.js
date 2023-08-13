import mysql from "mysql";
import { DB_CONFIG } from "../constants.js";

export const connection = mysql.createConnection(DB_CONFIG);

connection.connect(error => {
  if (error) {
    console.error("Error connecting to database: ", error);
  } else {
    console.log("Connected to database");
  }
});

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
  await new Promise((resolve, reject) => {
    connection.query("SHOW COLUMNS FROM " + key, (error, rows) => {
      if (error) return reject(error);
      rows.forEach(row => value.push(row.Field));
      resolve(rows);
    })
  });
}

// Insert the given rows into the specified table, the column names are given as an array of strings and the rows to insert is an array containing arrays of values
export function insertIntoTable(table, columns, rows) {
  if (rows.length === 0) return;
  const statement = "REPLACE INTO " + table + " (`" + columns.join("`, `") + "`) VALUES ?";
  connection.query(statement, [rows], error => {
    if (error) throw error;
  });
}

// Delete all rows in teams table
export async function clearTeamsTable() {
  connection.query("DELETE FROM teams", error => {
    if (error) throw error;
  });
}