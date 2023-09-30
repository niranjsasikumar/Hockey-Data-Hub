import dotenv from "dotenv";
dotenv.config();

export const API_BASE_URL = "https://statsapi.web.nhl.com/api/v1";

function getSeasonId(year) {
  return parseInt(year.toString() + (year + 1));
}

export const LAST_SEASON_YEAR = parseInt(process.env.LAST_SEASON_YEAR);
export const LAST_SEASON = getSeasonId(LAST_SEASON_YEAR);

function getSeasons() {
  const seasons = [];
  for (let year = 1917; year <= LAST_SEASON_YEAR; year++) {
    if (year === 2004) continue; // Season not played due to labour lockout
    const season = getSeasonId(year);
    seasons.push(season);
  }
  return seasons;
}

export const SEASONS = getSeasons();

/* Seasons to consider for playoffs data, the seasons that are not included are
due to missing or inconsistent data */
function getPlayoffsSeasons() {
  return SEASONS.filter(
    season => (season >= 19421943 && season <= 19721973) || season >= 19811982
  );
}

export const PLAYOFFS_DATA_SEASONS = getPlayoffsSeasons();

export const DB_CONFIG = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
};