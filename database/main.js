import { connection } from "./src/database/database.js";
import { updateTeamsData, insertSeasonData, insertPlayoffSeriesData, insertStandingsData, insertPlayerData, insertGameData } from "./src/database/insert.js";
import { SEASONS } from "./src/constants.js";

await updateTeamsData();
await insertSeasonData(SEASONS);
await insertPlayoffSeriesData(SEASONS);
await insertStandingsData(SEASONS);
await insertPlayerData(SEASONS);
await insertGameData(SEASONS);

connection.end();