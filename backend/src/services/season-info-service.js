import pool from "../database/database.js";
import { getCurrentSeason } from "../utils/utils.js";
import { fetchDataFromNHLApi } from "../utils/nhl-api.js";

export default async function getSeasonInfo(season) {
  if (season === "current") return await getCurrentSeasonInfo();
  return await getSeasonInfoFromDatabase(season);
}

export async function getCurrentSeasonInfo() {
  const season = await getCurrentSeason();
  const seasonInfo = (await fetchDataFromNHLApi(
    `/season?cayenneExp=id=${season}`, true
  )).data[0];

  const {
    conferencesInUse, divisionsInUse, tiesInUse, pointForOTLossInUse
  } = seasonInfo;

  return {
    id: "current",
    conferencesInUse: conferencesInUse,
    divisionsInUse: divisionsInUse,
    conferences: null,
    divisions: null,
    tiesInUse: tiesInUse,
    overtimeLossPointInUse: pointForOTLossInUse,
    powerPlayStatsTracked: true,
    shootingStatsTracked: true,
    faceoffStatsTracked: true,
    saveStatsTracked: true
  };
}

export async function getSeasonInfoFromDatabase(season) {
  return (await pool.query(
    `SELECT ${queryColumns} FROM seasons
    WHERE id = ${season}`
  ))[0][0];
}

const queryColumns = [
  "id",
  "conferencesInUse",
  "divisionsInUse",
  "conferences",
  "divisions",
  "tiesInUse",
  "overtimeLossPointInUse",
  "powerPlayStatsTracked",
  "shootingStatsTracked",
  "faceoffStatsTracked",
  "saveStatsTracked"
];