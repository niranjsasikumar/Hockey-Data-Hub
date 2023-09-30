import { clearTable, insertIntoTable } from "./database.js";
import { getTeamValues } from "../api/teams.js";
import { getSeasonValues } from "../api/seasons.js";
import { getPlayoffSeriesValues } from "../api/playoff-series.js";
import { getStandingsValues } from "../api/standings.js";
import { getPlayerValues } from "../api/players.js";
import { getGameValues } from "../api/games.js";

// Overwrite the data in "teams" table
export async function updateTeamsData(connection, columns) {
  console.log("Start overwriting \"teams\" table");
  await clearTable(connection, "teams");
  const teamValues = await getTeamValues();
  await insertIntoTable(connection, "teams", columns, teamValues);
  console.log("Finished overwriting \"teams\" table");
}

// Insert or update data in "seasons" table
export async function insertSeasonData(connection, columns, seasons) {
  console.log("Start inserting into / updating \"seasons\" table");
  const seasonValues = await getSeasonValues(seasons);
  await insertIntoTable(connection, "seasons", columns, seasonValues);
  console.log("Finished inserting into / updating \"seasons\" table");
}

// Insert or update data in "playoff_series" table
export async function insertPlayoffSeriesData(connection, columns, seasons) {
  console.log("Start inserting into / updating \"playoff_series\" table");
  const playoffSeriesValues = await getPlayoffSeriesValues(seasons);
  await insertIntoTable(
    connection, "playoff_series", columns, playoffSeriesValues
  );
  console.log("Finished inserting into / updating \"playoff_series\" table");
}

// Insert or update data in "standings" table
export async function insertStandingsData(connection, columns, seasons) {
  console.log("Start inserting into / updating \"standings\" table");
  const standingsValues = await getStandingsValues(seasons);
  await insertIntoTable(connection, "standings", columns, standingsValues);
  console.log("Finished inserting into / updating \"standings\" table");
}

// Insert or update data in "skaters" and "goalies" tables
export async function insertPlayerData(
  connection, skaterColumns, goalieColumns, seasons
) {
  console.log(
    "Start inserting into / updating \"skaters\" and \"goalies\" tables"
  );
  const [skaterValues, goalieValues] = await getPlayerValues(seasons);
  await insertIntoTable(connection, "skaters", skaterColumns, skaterValues);
  await insertIntoTable(connection, "goalies", goalieColumns, goalieValues);
  console.log(
    "Finished inserting into / updating \"skaters\" and \"goalies\" tables"
  );
}

// Insert or update data in "games" table
export async function insertGameData(connection, columns, seasons) {
  console.log("Start inserting into / updating \"games\" table");
  const gameValues = await getGameValues(seasons);
  await insertIntoTable(connection, "games", columns, gameValues);
  console.log("Finished inserting into / updating \"games\" table");
}