import {
  getDatabaseConnection, getColumns, insertIntoTable, clearTable
} from "../../src/database/database";
import { TEST_DB_CONFIG } from "./db-config";
import { updateTeamsData } from "../../src/database/insert";

let connection, columns;

beforeAll(async () => {
  connection = await getDatabaseConnection(TEST_DB_CONFIG);
  columns = await getColumns(connection);
});

afterAll(() => {
  connection.end();
});

test("getDatabaseConnection", async () => {
  expect(connection).toBeDefined();
});

test("getColumns", async () => {
  expect(columns.teams.length).toBeGreaterThan(0);
});

test("insertIntoTable", async () => {
  const table = "teams";
  const columns = [
    'id',
    'name',
    'locationName',
    'teamName',
    'abbreviation',
    'lightLogoURL',
    'venueName',
    'venueCity',
    'firstYearOfPlay',
    'conference',
    'division',
    'backgroundColour'
  ];

  const [[row]] = (await connection.query("SELECT * FROM teams WHERE id = 1"));
  expect(row.name).toBe("New Jersey Devils");

  await connection.query("DELETE FROM teams WHERE id = 1");
  let [rows] = (await connection.query("SELECT * FROM teams"));
  expect(rows.length).toBe(31);

  await insertIntoTable(connection, table, columns, [Object.values(row)]);
  [rows] = (await connection.query("SELECT * FROM teams"));
  expect(rows.length).toBe(32);
});

test("clearTable", async () => {
  let [rows] = (await connection.query("SELECT * FROM teams"));
  expect(rows.length).toBe(32);

  await clearTable(connection, "teams");
  [rows] = (await connection.query("SELECT * FROM teams"));
  expect(rows.length).toBe(0);

  await updateTeamsData(connection, columns.teams);
  [rows] = (await connection.query("SELECT * FROM teams"));
  expect(rows.length).toBe(32);
});