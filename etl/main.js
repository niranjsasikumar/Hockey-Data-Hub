import { getDatabaseConnection, getColumns } from "./src/database/database.js";
import {
  updateTeamsData,
  insertSeasonData,
  insertPlayoffSeriesData,
  insertStandingsData,
  insertPlayerData,
  insertGameData
} from "./src/database/insert.js";
import { SEASONS } from "./src/constants.js";

const connection = await getDatabaseConnection();
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