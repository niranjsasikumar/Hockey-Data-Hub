import pool from "../database/database.js";
import { fetchDataFromNHLApi } from "../utils/nhl-api.js";

export default async function getSeasonInfo(season) {
  if (season === "current") return await getCurrentSeasonInfo();

  return (await pool.query(
    `SELECT ${queryColumns} FROM seasons
    WHERE id = ${season}`
  ))[0][0];
}

async function getCurrentSeasonInfo() {
  const seasonInfo = (await fetchDataFromNHLApi("/seasons/current")).seasons[0];
  const { conferencesInUse, divisionsInUse, tiesInUse } = seasonInfo;

  return {
    id: "current",
    conferencesInUse: conferencesInUse,
    divisionsInUse: divisionsInUse,
    conferences: null,
    divisions: null,
    tiesInUse: tiesInUse,
    overtimeLossPointInUse: true,
    powerPlayStatsTracked: true,
    shootingStatsTracked: true,
    faceoffStatsTracked: true,
    saveStatsTracked: true
  };
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