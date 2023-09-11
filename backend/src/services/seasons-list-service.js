import pool from "../database/database.js";
import { getCurrentSeason, seasonHasPlayoffsData } from "../utils/utils.js";

export default async function getSeasonsList() {
  const [results] = await pool.query(
    `SELECT id, playoffRounds FROM seasons
    ORDER BY id DESC`
  );

  const seasons = results.map(({ id, playoffRounds }) => ({
    value: id,
    string: convertSeasonIdtoString(id),
    hasPlayoffsData: Boolean(playoffRounds)
  }));

  const currentSeason = await getCurrentSeason();

  if (seasons[0].value !== currentSeason) {
    seasons.unshift({
      value: "current",
      string: convertSeasonIdtoString(currentSeason),
      hasPlayoffsData: await seasonHasPlayoffsData(currentSeason)
    });
  }

  return seasons;
}

function convertSeasonIdtoString(id) {
  const idString = id.toString();
  return idString.slice(0, 4) + "-" + idString.slice(4);
}