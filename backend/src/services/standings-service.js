import getSeasonInfo from "./season-info-service.js";
import connection from "../database/database.js";

export default async function getStandings(season) {
  const seasonInfo = await getSeasonInfo(season);

  const { id, conferencesInUse, divisionsInUse, conferences, divisions } = seasonInfo;

  if (conferencesInUse) {
    return await getStandingsConference(id, conferences, divisions);
  } else if (divisionsInUse) {
    return await getStandingsDivision(id, divisions);
  }

  return await getStandingsLeague(id);
}

async function getStandingsConference(season, conferences, divisions) {
  conferences = conferences.split(",");
  divisions = divisions.split(",");
  const divsPerConf = divisions.length / conferences.length;
  const standings = [];

  for (let i = 0; i < conferences.length; i++) {
    standings.push({
      conference: conferences[i],
      divisions: []
    });

    for (let j = i * divsPerConf; j < (i + 1) * divsPerConf; j++) {
      const [results] = await connection.query(
        `SELECT ${queryColumns} FROM standings
        WHERE season = ${season} AND division = "${divisions[j]}"
        ORDER BY divisionRank ASC`
      );

      standings[i].divisions.push({
        name: divisions[j],
        standings: results
      });
    }
  }

  return standings;
}

const queryColumns = [
  "teamId",
  "teamShortName",
  "teamAbbreviation",
  "logoURL",
  "conference",
  "division",
  "clinchIndicator",
  "divisionRank",
  "leagueRank",
  "points",
  "gamesPlayed",
  "wins",
  "losses",
  "ties",
  "overtimeLosses",
  "goalsFor",
  "goalsAgainst",
  "difference",
  "homeRecord",
  "awayRecord",
  "last10",
  "streak"
];

async function getStandingsDivision(season, divisions) {
  divisions = divisions.split(",");
  const standings = [];

  for (const division of divisions) {
    const [results] = await connection.query(
      `SELECT ${queryColumns} FROM standings
      WHERE season = ${season} AND division = "${division}"
      ORDER BY divisionRank ASC`
    );

    standings.push({
      division: division,
      standings: results
    });
  }

  return standings;
}

async function getStandingsLeague(season) {
  return (await connection.query(
    `SELECT ${queryColumns} FROM standings
    WHERE season = ${season}
    ORDER BY leagueRank ASC`
  ))[0];
}