import dotenv from "dotenv";
dotenv.config();

export const API_BASE_URL = "https://statsapi.web.nhl.com/api/v1";

export const CURRENT_SEASON = 20232024;
export const CURRENT_SEASON_YEAR = 2023;

export const SEASONS = [];
for (let year = 1917; year < CURRENT_SEASON_YEAR; year++) {
  if (year === 2004) continue; // Season not played due to labour lockout
  const season = parseInt(year.toString() + (year+1).toString());
  SEASONS.push(season);
}

// Seasons to consider for playoffs data, the seasons that are not included are due to missing or inconsistent data
export const PLAYOFFS_DATA_SEASONS = SEASONS.filter(
  season => (season >= 19421943 && season <= 19721973) || season >= 19811982
);

export const DB_CONFIG = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
};