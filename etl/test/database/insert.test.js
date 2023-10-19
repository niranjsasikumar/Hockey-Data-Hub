import { createPool } from "mysql2/promise";
import { TEST_DB_CONFIG } from "../test_data/database/db-config";
import {
  insertSeasonData,
  insertPlayoffSeriesData,
  insertStandingsData,
  insertPlayerData,
  insertGameData
} from "../../src/database/insert";
import seasonsColumns from "../test_data/database/seasons-columns.json"
import playoffsColumns from "../test_data/database/playoff-series-columns.json"
import standingsColumns from "../test_data/database/standings-columns.json"
import skatersColumns from "../test_data/database/skaters-columns.json"
import goaliesColumns from "../test_data/database/goalies-columns.json"
import gamesColumns from "../test_data/database/games-columns.json"

let pool;
let getRows;

beforeAll(async () => {
  pool = createPool(TEST_DB_CONFIG);
  getRows = async (selectQuery) => (await pool.query(selectQuery))[0];
});

afterAll(() => {
  pool.end();
});

describe("insertSeasonData", () => {
  const season = 19171918;
  const selectQuery = `SELECT * FROM seasons WHERE id = ${season}`;
  const numRows = 1; // Expected number of rows returned from selectQuery
  let rows;
  const getSeasonRows = async () => await getRows(selectQuery);

  test("Insert new data", async () => {
    rows = await getSeasonRows();
    expect(rows.length).toBe(numRows);
  
    await pool.query(`DELETE FROM seasons WHERE id = ${season}`);
    rows = await getSeasonRows();
    expect(rows.length).toBe(0);
  
    await insertSeasonData(pool, seasonsColumns, [season]);
    rows = await getSeasonRows();
    expect(rows.length).toBe(numRows);
  });

  test("Update existing data", async () => {
    rows = await getSeasonRows();
    expect(rows.length).toBe(numRows);
  
    await insertSeasonData(pool, seasonsColumns, [season]);
    rows = await getSeasonRows();
    expect(rows.length).toBe(numRows);
  });
});

describe("insertPlayoffSeriesData", () => {
  const season = 19421943;
  const selectQuery = `SELECT * FROM playoff_series WHERE season = ${season}`;
  const numRows = 3; // Expected number of rows returned from selectQuery
  let rows;
  const getPlayoffRows = async () => await getRows(selectQuery);

  test("Insert new data", async () => {
    rows = await getPlayoffRows();
    expect(rows.length).toBe(numRows);
  
    await pool.query(
      `DELETE FROM playoff_series WHERE season = ${season}`
    );
    rows = await getPlayoffRows();
    expect(rows.length).toBe(0);
  
    await insertPlayoffSeriesData(pool, playoffsColumns, [season]);
    rows = await getPlayoffRows();
    expect(rows.length).toBe(numRows);
  });

  test("Update existing data", async () => {
    rows = await getPlayoffRows();
    expect(rows.length).toBe(numRows);
  
    await insertPlayoffSeriesData(pool, playoffsColumns, [season]);
    rows = await getPlayoffRows();
    expect(rows.length).toBe(numRows);
  });
});

describe("insertStandingsData", () => {
  const season = 19171918;
  const selectQuery = `SELECT * FROM standings WHERE season = ${season}`;
  const numRows = 4; // Expected number of rows returned from selectQuery
  let rows;
  const getStandingsRows = async () => await getRows(selectQuery);

  test("Insert new data", async () => {
    rows = await getStandingsRows();
    expect(rows.length).toBe(numRows);
  
    await pool.query(`DELETE FROM standings WHERE season = ${season}`);
    rows = await getStandingsRows();
    expect(rows.length).toBe(0);
  
    await insertStandingsData(pool, standingsColumns, [season]);
    rows = await getStandingsRows();
    expect(rows.length).toBe(numRows);
  });

  test("Update existing data", async () => {
    rows = await getStandingsRows();
    expect(rows.length).toBe(numRows);
  
    await insertStandingsData(pool, standingsColumns, [season]);
    rows = await getStandingsRows();
    expect(rows.length).toBe(numRows);
  });
});

describe("insertPlayerData", () => {
  const season = 19171918;
  const skatersSelectQuery = `SELECT * FROM skaters WHERE season = ${season}`;
  const goaliesSelectQuery = `SELECT * FROM goalies WHERE season = ${season}`;
  const skatersNumRows = 45; // Expected number of rows from skaters table
  const goaliesNumRows = 6; // Expected number of rows from goalies table
  let skaterRows, goalieRows;
  const getSkaterRows = async () => await getRows(skatersSelectQuery);
  const getGoalieRows = async () => await getRows(goaliesSelectQuery);

  test("Insert new data", async () => {
    [skaterRows, goalieRows] = await Promise.all(
      [getSkaterRows(), getGoalieRows()]
    );
    expect(skaterRows.length).toBe(skatersNumRows);
    expect(goalieRows.length).toBe(goaliesNumRows);

    await Promise.all([
      pool.query(`DELETE FROM skaters WHERE season = ${season}`),
      pool.query(`DELETE FROM goalies WHERE season = ${season}`)
    ]);
    [skaterRows, goalieRows] = await Promise.all(
      [getSkaterRows(), getGoalieRows()]
    );
    expect(skaterRows.length).toBe(0);
    expect(goalieRows.length).toBe(0);
  
    await insertPlayerData(pool, skatersColumns, goaliesColumns, [season]);
    [skaterRows, goalieRows] = await Promise.all(
      [getSkaterRows(), getGoalieRows()]
    );
    expect(skaterRows.length).toBe(skatersNumRows);
    expect(goalieRows.length).toBe(goaliesNumRows);
  });

  test("Update existing data", async () => {
    [skaterRows, goalieRows] = await Promise.all(
      [getSkaterRows(), getGoalieRows()]
    );
    expect(skaterRows.length).toBe(skatersNumRows);
    expect(goalieRows.length).toBe(goaliesNumRows);
  
    await insertPlayerData(pool, skatersColumns, goaliesColumns, [season]);
    [skaterRows, goalieRows] = await Promise.all(
      [getSkaterRows(), getGoalieRows()]
    );
    expect(skaterRows.length).toBe(skatersNumRows);
    expect(goalieRows.length).toBe(goaliesNumRows);
  });
});

describe("insertGameData", () => {
  const season = 19171918;
  const selectQuery = `SELECT * FROM games WHERE season = ${season}`;
  const numRows = 36; // Expected number of rows returned from selectQuery
  let rows;
  const getGameRows = async () => await getRows(selectQuery);

  test("Insert new data", async () => {
    rows = await getGameRows();
    expect(rows.length).toBe(numRows);
  
    await pool.query(`DELETE FROM games WHERE season = ${season}`);
    rows = await getGameRows();
    expect(rows.length).toBe(0);
  
    await insertGameData(pool, gamesColumns, [season]);
    rows = await getGameRows();
    expect(rows.length).toBe(numRows);
  }, 10000);

  test("Update existing data", async () => {
    rows = await getGameRows();
    expect(rows.length).toBe(numRows);
  
    await insertGameData(pool, gamesColumns, [season]);
    rows = await getGameRows();
    expect(rows.length).toBe(numRows);
  });
});