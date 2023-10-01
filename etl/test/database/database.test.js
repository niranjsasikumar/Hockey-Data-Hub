import { getDatabaseConnection, getColumns } from "../../src/database/database";
import { TEST_DB_CONFIG } from "./db-config";

test("Get database connection successfully", async () => {
  const connection = await getDatabaseConnection(TEST_DB_CONFIG);
  expect(connection).toBeDefined();
  connection.end();
});

test("Get database columns successfully", async () => {
  const connection = await getDatabaseConnection(TEST_DB_CONFIG);
  const columns = await getColumns(connection);
  expect(columns.teams.length).toBeGreaterThan(0);
  connection.end();
});