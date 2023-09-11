import pool from "../database/database.js";
import { fetchDataFromNHLApi } from "../utils/utils.js";

export default async function getPlayoffs(season) {
  if (season === "current") return await getCurrentSeasonPlayoffs();

  const playoffRounds = (await pool.query(
    `SELECT playoffRounds FROM seasons
    WHERE id = ${season}`
  ))[0][0].playoffRounds;

  if (playoffRounds === null) return [];

  const playoffs = [];

  for (const round of playoffRounds.split(",")) {
    const [series] = await pool.query(
      `SELECT ${queryColumns} FROM playoff_series
      WHERE season = ${season} AND round = "${round}"`
    );

    playoffs.push({
      round: round,
      series: series
    });
  }

  return playoffs;
}

async function getCurrentSeasonPlayoffs() {
  const playoffsData = (await fetchDataFromNHLApi("/tournaments/playoffs?expand=round.series,schedule.game.seriesSummary,series.matchup.team")).rounds;
  const playoffs = [];

  for (const round of playoffsData) {
    const { number, names } = round;
    const seriesList = [];

    for (const series of round.series) {
      const { seriesNumber, matchupTeams, currentGame } = series;
      const team1 = matchupTeams[0].team;
      const team2 = matchupTeams[1].team;

      seriesList.push({
        id: number.toString() + seriesNumber,
        team1Id: team1.id,
        team1Abbreviation: team1.abbreviation,
        team1LogoURL: `https://assets.nhle.com/logos/nhl/svg/${team1.abbreviation}_light.svg`,
        team2Id: team2.id,
        team2Abbreviation: team2.abbreviation,
        team2LogoURL: `https://assets.nhle.com/logos/nhl/svg/${team2.abbreviation}_light.svg`,
        statusShort: currentGame.seriesSummary?.seriesStatusShort
      });
    }

    playoffs.push({
      round: names.name,
      series: seriesList
    });
  }

  return playoffs;
}

const queryColumns = [
  "id",
  "team1Id",
  "team1Abbreviation",
  "team1LogoURL",
  "team2Id",
  "team2Abbreviation",
  "team2LogoURL",
  "statusShort"
];