import getSeasonInfo from "./season-info-service.js";
import { fetchDataFromNHLApi } from "../utils/nhl-api.js";
import pool from "../database/database.js";

export default async function getStandings(season) {
  const seasonInfo = await getSeasonInfo(season);
  const { id, conferencesInUse, divisionsInUse, conferences, divisions } = seasonInfo;

  if (id === "current") return await getCurrentSeasonStandings(conferencesInUse, divisionsInUse);

  if (conferencesInUse) {
    return await getStandingsConference(id, conferences, divisions);
  } else if (divisionsInUse) {
    return await getStandingsDivision(id, divisions);
  }

  return await getStandingsLeague(id);
}

async function getCurrentSeasonStandings(conferencesInUse, divisionsInUse) {
  const standingsData = (await fetchDataFromNHLApi("/standings/now")).standings;
  let standings;

  if (conferencesInUse) standings = await getCurrentStandingsConference(standingsData);
  else if (divisionsInUse) standings = await getCurrentStandingsDivision(standingsData);
  else standings = await getCurrentStandingsLeague(standingsData);

  return standings;
}

async function getCurrentStandingsConference(standingsData) {
  const standings = [];

  for (const team of standingsData) {
    const { conferenceName, divisionName } = team;
    const conferenceIndex = getConferenceIndex(standings, conferenceName);
    const divisionIndex = getDivisionIndex(standings[conferenceIndex].divisions, divisionName, true);
    standings[conferenceIndex].divisions[divisionIndex].standings.push(await extractTeamRecord(team));
  }

  return standings;
}

async function getCurrentStandingsDivision(standingsData) {
  const standings = [];

  for (const team of standingsData) {
    const divisionIndex = getDivisionIndex(standings, team.divisionName, false);
    standings[divisionIndex].standings.push(await extractTeamRecord(team));
  }

  return standings;
}

async function getCurrentStandingsLeague(standingsData) {
  return standingsData.map(async (team) => await extractTeamRecord(team));
}

function getConferenceIndex(standings, conferenceName) {
  let conferenceIndex = standings.findIndex(
    conference => conference.conference === conferenceName
  );

  if (conferenceIndex === -1) {
    standings.push({
      conference: conferenceName,
      divisions: []
    })
    conferenceIndex = standings.length - 1;
  }

  return conferenceIndex;
}

function getDivisionIndex(standings, divisionName, conferencesInUse) {
  let divisionIndex = standings.findIndex(
    division => (
      conferencesInUse ? division.name : division.division
    ) === divisionName
  );

  if (divisionIndex === -1) {
    standings.push(
      conferencesInUse
      ? { name: divisionName, standings: [] }
      : { division: divisionName, standings: [] }
    )
    divisionIndex = standings.length - 1;
  }

  return divisionIndex;
}

async function extractTeamRecord(team) {
  const {
    placeName: { default: placeName },
    teamName: { default: teamName },
    teamAbbrev: { default: teamAbbreviation },
    teamLogo,
    conferenceName,
    divisionName,
    clinchIndicator,
    divisionSequence,
    leagueSequence,
    points,
    gamesPlayed,
    wins,
    losses,
    otLosses,
    goalFor,
    goalAgainst,
    goalDifferential,
    homeWins,
    homeLosses,
    homeOtLosses,
    roadWins,
    roadLosses,
    roadOtLosses,
    l10Wins,
    l10Losses,
    l10OtLosses,
    streakCode,
    streakCount
  } = team;

  return {
    teamId: await getTeamId(teamAbbreviation),
    teamShortName: teamName.slice(placeName.length + 1),
    teamAbbreviation,
    logoURL: teamLogo,
    conference: conferenceName ? conferenceName : null,
    division: divisionName ? divisionName : null,
    clinchIndicator: clinchIndicator ? clinchIndicator : null,
    divisionRank: divisionSequence ? divisionSequence : null,
    leagueRank: leagueSequence,
    points,
    gamesPlayed,
    wins,
    losses,
    ties: null,
    overtimeLosses: otLosses,
    goalsFor: goalFor,
    goalsAgainst: goalAgainst,
    difference: goalDifferential,
    homeRecord: `${homeWins}-${homeLosses}-${homeOtLosses}`,
    awayRecord: `${roadWins}-${roadLosses}-${roadOtLosses}`,
    last10: `${l10Wins}-${l10Losses}-${l10OtLosses}`,
    streak: streakCode ? streakCode + streakCount : "-"
  };
}

async function getTeamId(abbreviation) {
  const teamsData = (await fetchDataFromNHLApi(`/team`, true)).data;
  const team = teamsData.find(teamObj => teamObj.triCode === abbreviation);
  return team.id;
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
      const [results] = await pool.query(
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
    const [results] = await pool.query(
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
  return (await pool.query(
    `SELECT ${queryColumns} FROM standings
    WHERE season = ${season}
    ORDER BY leagueRank ASC`
  ))[0];
}