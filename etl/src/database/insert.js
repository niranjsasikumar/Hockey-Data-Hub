import { clearTable, insertIntoTable } from "./database.js";
import { getTeamValues } from "../api/teams.js";
import { getSeasonValues } from "../api/seasons.js";
import { getPlayoffSeriesValues } from "../api/playoff-series.js";
import { getStandingsValues } from "../api/standings.js";
import { getPlayerValues } from "../api/players.js";
import { getGameValues } from "../api/games.js";

// Overwrite the data in "teams" table
export async function updateTeamsData(pool, columns) {
  console.log("Start overwriting \"teams\" table");
  await clearTable(pool, "teams");
  const teamValues = await getTeamValues();
  await insertIntoTable(pool, "teams", columns, teamValues);
  console.log("Finished overwriting \"teams\" table");
}

// Insert or update data in "seasons" table
export async function insertSeasonData(pool, columns, seasons) {
  console.log("Start inserting into / updating \"seasons\" table");
  const seasonValues = await getSeasonValues(seasons);
  await insertIntoTable(pool, "seasons", columns, seasonValues);
  console.log("Finished inserting into / updating \"seasons\" table");
}

// Insert or update data in "playoff_series" table
export async function insertPlayoffSeriesData(pool, columns, seasons) {
  console.log("Start inserting into / updating \"playoff_series\" table");
  const playoffSeriesValues = await getPlayoffSeriesValues(seasons);
  await insertIntoTable(pool, "playoff_series", columns, playoffSeriesValues);
  console.log("Finished inserting into / updating \"playoff_series\" table");
}

// Insert or update data in "standings" table
export async function insertStandingsData(pool, columns, seasons) {
  console.log("Start inserting into / updating \"standings\" table");
  const standingsValues = await getStandingsValues(seasons);
  await insertIntoTable(pool, "standings", columns, standingsValues);
  console.log("Finished inserting into / updating \"standings\" table");
}

// Insert or update data in "skaters" and "goalies" tables
export async function insertPlayerData(
  pool, skaterColumns, goalieColumns, seasons
) {
  console.log(
    "Start inserting into / updating \"skaters\" and \"goalies\" tables"
  );
  const [skaterValues, goalieValues] = await getPlayerValues(seasons);
  await Promise.all([
    insertIntoTable(pool, "skaters", skaterColumns, skaterValues),
    insertIntoTable(pool, "goalies", goalieColumns, goalieValues)
  ]);
  console.log(
    "Finished inserting into / updating \"skaters\" and \"goalies\" tables"
  );
}

// Insert or update data in "games" table
export async function insertGameData(pool, columns, seasons) {
  console.log("Start inserting into / updating \"games\" table");
  const gameValues = await getGameValues(seasons);
  await insertIntoTable(pool, "games", columns, gameValues);
  console.log("Finished inserting into / updating \"games\" table");
}