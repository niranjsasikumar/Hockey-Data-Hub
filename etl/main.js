import { getConnectionPool, getColumns } from "./src/database/database.js";
import { DB_CONFIG, SEASONS } from "./src/constants.js";
import {
  updateTeamsData,
  insertSeasonData,
  insertPlayoffSeriesData,
  insertStandingsData,
  insertPlayerData,
  insertGameData
} from "./src/database/insert.js";

const pool = getConnectionPool(DB_CONFIG);
const columns = await getColumns(pool);

await Promise.all([
  updateTeamsData(pool, columns.teams),
  insertSeasonData(pool, columns.seasons, SEASONS),
  insertPlayoffSeriesData(pool, columns.playoff_series, SEASONS),
  insertStandingsData(pool, columns.standings, SEASONS),
  insertPlayerData(pool, columns.skaters, columns.goalies, SEASONS),
  insertGameData(pool, columns.games, SEASONS)
]);

pool.end();