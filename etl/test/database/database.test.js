import { createPool } from "mysql2/promise";
import { TEST_DB_CONFIG } from "../test_data/database/db-config";
import {
  getConnectionPool, getColumns, insertIntoTable, clearTable
} from "../../src/database/database";
import teamsColumns from "../test_data/database/teams-columns.json";
import { updateTeamsData } from "../../src/database/insert";

let pool;

beforeAll(() => {
  pool = createPool(TEST_DB_CONFIG);
});

afterAll(() => {
  pool.end();
});

test("getConnectionPool", async () => {
  const db_pool = getConnectionPool(TEST_DB_CONFIG);
  expect(db_pool).toBeDefined();
  db_pool.end();
});

test("getColumns", async () => {
  const columns = await getColumns(pool);
  expect(columns.teams.length).toBeGreaterThan(0);
});

test("insertIntoTable", async () => {
  const [[row]] = await pool.query("SELECT * FROM teams WHERE id = 1");
  expect(row.name).toBe("New Jersey Devils");

  await pool.query("DELETE FROM teams WHERE id = 1");
  let [rows] = await pool.query("SELECT * FROM teams");
  expect(rows.length).toBe(31);

  const table = "teams";
  const rowToInsert = [Object.values(row)];
  await insertIntoTable(pool, table, teamsColumns, rowToInsert);
  [rows] = await pool.query("SELECT * FROM teams");
  expect(rows.length).toBe(32);
});

test("clearTable", async () => {
  const [teamRows] = await pool.query("SELECT * FROM teams");
  expect(teamRows.length).toBe(32);

  const table = "teams";
  await clearTable(pool, table);
  let [rows] = await pool.query("SELECT * FROM teams");
  expect(rows.length).toBe(0);

  const teamValues = teamRows.map(row => Object.values(row));
  const statement = `INSERT INTO teams (\`${teamsColumns.join("`, `")}\`)
  VALUES ?`;
  await pool.query(statement, [teamValues]);
  [rows] = await pool.query("SELECT * FROM teams");
  expect(rows.length).toBe(32);
});

test("updateTeamsData", async () => {
  let [rows] = await pool.query("SELECT * FROM teams");
  expect(rows.length).toBe(32);

  await pool.query("DELETE FROM teams");
  [rows] = await pool.query("SELECT * FROM teams");
  expect(rows.length).toBe(0);

  await updateTeamsData(pool, teamsColumns);
  [rows] = await pool.query("SELECT * FROM teams");
  expect(rows.length).toBe(32);
});