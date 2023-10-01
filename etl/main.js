import { getDatabaseConnection, getColumns } from "./src/database/database.js";
import { DB_CONFIG, SEASONS } from "./src/constants.js";
import {
  updateTeamsData,
  insertSeasonData,
  insertPlayoffSeriesData,
  insertStandingsData,
  insertPlayerData,
  insertGameData
} from "./src/database/insert.js";

const connection = await getDatabaseConnection(DB_CONFIG);
const columns = await getColumns(connection);

await Promise.all([
  updateTeamsData(connection, columns.teams),
  insertSeasonData(connection, columns.seasons, SEASONS),
  insertPlayoffSeriesData(connection, columns.playoff_series, SEASONS),
  insertStandingsData(connection, columns.standings, SEASONS),
  insertPlayerData(connection, columns.skaters, columns.goalies, SEASONS),
  insertGameData(connection, columns.games, SEASONS)
]);

connection.end();