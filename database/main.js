import { connection } from "./src/database/database.js";
import { updateTeamsData, insertSeasonData, insertPlayoffSeriesData, insertStandingsData, insertPlayerData, insertGameData } from "./src/database/insert.js";
import { SEASONS } from "./src/constants.js";

await Promise.all([
  updateTeamsData(),
  insertSeasonData(SEASONS),
  insertPlayoffSeriesData(SEASONS),
  insertStandingsData(SEASONS),
  insertPlayerData(SEASONS),
  insertGameData(SEASONS)
]);

connection.end();