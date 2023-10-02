import mysql from "mysql2/promise";
import {
  getDatabaseConnection, getColumns, insertIntoTable, clearTable
} from "../../src/database/database";
import { TEST_DB_CONFIG } from "../test_data/db-config";
import teamsColumns from "../test_data/teams-columns.json";

test("getDatabaseConnection", async () => {
  const connection = await getDatabaseConnection(TEST_DB_CONFIG);
  expect(connection).toBeDefined();
  connection.end();
});

test("getColumns", async () => {
  const connection = await mysql.createConnection(TEST_DB_CONFIG);
  const columns = await getColumns(connection);
  expect(columns.teams.length).toBeGreaterThan(0);
  connection.end();
});

test("insertIntoTable", async () => {
  const connection = await mysql.createConnection(TEST_DB_CONFIG);
  const [[row]] = (await connection.query("SELECT * FROM teams WHERE id = 1"));
  expect(row.name).toBe("New Jersey Devils");

  await connection.query("DELETE FROM teams WHERE id = 1");
  let [rows] = (await connection.query("SELECT * FROM teams"));
  expect(rows.length).toBe(31);

  const table = "teams";
  await insertIntoTable(connection, table, teamsColumns, [Object.values(row)]);
  [rows] = (await connection.query("SELECT * FROM teams"));
  expect(rows.length).toBe(32);

  connection.end();
});

test("clearTable", async () => {
  const connection = await mysql.createConnection(TEST_DB_CONFIG);
  const [teamRows] = (await connection.query("SELECT * FROM teams"));
  expect(teamRows.length).toBe(32);

  await clearTable(connection, "teams");
  let [rows] = (await connection.query("SELECT * FROM teams"));
  expect(rows.length).toBe(0);

  const teamValues = teamRows.map(row => Object.values(row));
  const statement = `INSERT INTO teams (\`${teamsColumns.join("`, `")}\`)
  VALUES ?`;
  await connection.query(statement, [teamValues]);
  [rows] = (await connection.query("SELECT * FROM teams"));
  expect(rows.length).toBe(32);

  connection.end();
});