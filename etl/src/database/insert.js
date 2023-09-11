import { clearTeamsTable, insertIntoTable, columns } from "./database.js";
import { getTeamValues } from "../api/teams.js";
import { getSeasonValues } from "../api/seasons.js";
import { getPlayoffSeriesValues } from "../api/playoff-series.js";
import { getStandingsValues } from "../api/standings.js";
import { getPlayerValues } from "../api/players.js";
import { getGameValues } from "../api/games.js";

// Overwrite the data in "teams" table
export async function updateTeamsData() {
  console.log("Start overwriting \"teams\" table");
  await clearTeamsTable();
  const teamValues = await getTeamValues();
  await insertIntoTable("teams", columns.teams, teamValues);
  console.log("Finished overwriting \"teams\" table");
}

// Insert or update data in "seasons" table
export async function insertSeasonData(seasons) {
  console.log("Start inserting into / updating \"seasons\" table");
  const seasonValues = await getSeasonValues(seasons);
  await insertIntoTable("seasons", columns.seasons, seasonValues);
  console.log("Finished inserting into / updating \"seasons\" table");
}

// Insert or update data in "playoff_series" table
export async function insertPlayoffSeriesData(seasons) {
  console.log("Start inserting into / updating \"playoff_series\" table");
  const playoffSeriesValues = await getPlayoffSeriesValues(seasons);
  await insertIntoTable("playoff_series", columns.playoff_series, playoffSeriesValues);
  console.log("Finished inserting into / updating \"playoff_series\" table");
}

// Insert or update data in "standings" table
export async function insertStandingsData(seasons) {
  console.log("Start inserting into / updating \"standings\" table");
  const standingsValues = await getStandingsValues(seasons);
  await insertIntoTable("standings", columns.standings, standingsValues);
  console.log("Finished inserting into / updating \"standings\" table");
}

// Insert or update data in "skaters" and "goalies" tables
export async function insertPlayerData(seasons) {
  console.log("Start inserting into / updating \"skaters\" and \"goalies\" tables");
  const [skaterValues, goalieValues] = await getPlayerValues(seasons);
  await insertIntoTable("skaters", columns.skaters, skaterValues);
  await insertIntoTable("goalies", columns.goalies, goalieValues);
  console.log("Finished inserting into / updating \"skaters\" and \"goalies\" tables");
}

// Insert or update data in "games" table
export async function insertGameData(seasons) {
  console.log("Start inserting into / updating \"games\" table");
  const gameValues = await getGameValues(seasons);
  await insertIntoTable("games", columns.games, gameValues);
  console.log("Finished inserting into / updating \"games\" table");
}