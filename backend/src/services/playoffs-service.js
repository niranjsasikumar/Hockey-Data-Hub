import pool from "../database/database.js";
import { fetchDataFromNHLApi } from "../utils/nhl-api.js";

export default async function getPlayoffs(season) {
  if (season === "current") return await getCurrentSeasonPlayoffs();
  return await getPlayoffsData(season);
}

export async function getCurrentSeasonPlayoffs() {
  const year = new Date().getFullYear();
  const seriesData = (await fetchDataFromNHLApi(`/playoff-bracket/${year}`)).series;
  
  const playoffs = [];
  
  for (const series of seriesData) {
    if ("topSeedTeam" in series && "bottomSeedTeam" in series) {
      const { playoffRound, seriesLetter, topSeedTeam, bottomSeedTeam } = series;
      if (playoffs.length != playoffRound) {
        const roundName = getPlayoffRoundName(playoffRound);
        playoffs.push({ round: roundName, series: [] });
      }
      const seriesStatus = getSeriesStatus(series);
      playoffs[playoffRound-1].series.push({
        id: seriesLetter,
        team1Id: topSeedTeam.id,
        team1Abbreviation: topSeedTeam.abbrev,
        team1LogoURL: topSeedTeam.logo.replace("dark", "light"),
        team2Id: bottomSeedTeam.id,
        team2Abbreviation: bottomSeedTeam.abbrev,
        team2LogoURL: bottomSeedTeam.logo.replace("dark", "light"),
        statusShort: seriesStatus
      });
    }
  }

  return playoffs;
}

function getPlayoffRoundName(roundNumber) {
  switch (roundNumber) {
    case 1:
      return "First Round";
    case 2:
      return "Second Round";
    case 3:
      return "Conference Finals";
    case 4:
      return "Stanley Cup Final";
    default:
      return "";
  }
}

function getSeriesStatus(series) {
  const { topSeedWins, bottomSeedWins, topSeedTeam, bottomSeedTeam } = series;

  if (topSeedWins > bottomSeedWins) {
    if (topSeedWins == 4) {
      return `${topSeedTeam.abbrev} wins ${topSeedWins} - ${bottomSeedWins}`;
    }
    return `${topSeedTeam.abbrev} leads ${topSeedWins} - ${bottomSeedWins}`;
  } else if (bottomSeedWins > topSeedWins) {
    if (bottomSeedWins == 4) {
      return `${bottomSeedTeam.abbrev} wins ${bottomSeedWins} - ${topSeedWins}`;
    }
    return `${bottomSeedTeam.abbrev} leads ${bottomSeedWins} - ${topSeedWins}`;
  }

  return `Series tied ${topSeedWins} - ${bottomSeedWins}`;
}

export async function getPlayoffsData(season) {
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