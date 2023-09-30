import { getDatabaseConnection, getColumns } from "../../src/database/database";

test("Get database connection successfully", async () => {
  const connection = await getDatabaseConnection();
  expect(connection).toBeDefined();
  connection.end();
});

test("Get database columns successfully", async () => {
  const connection = await getDatabaseConnection();
  const columns = await getColumns(connection);
  expect(columns.teams.length).toBeGreaterThan(0);
  connection.end();
});