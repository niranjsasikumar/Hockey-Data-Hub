import connection from "../database/database.js";

export default async function getSeasonInfo(season) {
  const [results] = await connection.query(
    `SELECT ${queryColumns} FROM seasons
    WHERE id = ${season}`
  );

  return results[0];
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