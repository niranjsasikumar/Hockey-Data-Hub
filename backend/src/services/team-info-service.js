import { fetchDataFromNHLApi } from "../utils/nhl-api.js";
import { getCurrentSeason } from "../utils/utils.js";
import pool from "../database/database.js";

export default async function getTeamInfo(season, team) {
  let basicInfoPromise, playoffsPromise, statsPromise, rosterPromise;

  if (season === "current") {
    basicInfoPromise = getCurrentBasicTeamInfo(team);
    playoffsPromise = getCurrentPlayoffsResult(team);
    statsPromise = getCurrentTeamStats(team);
    rosterPromise = getCurrentRoster(team);
  } else {
    basicInfoPromise = getBasicTeamInfo(season, team);
    playoffsPromise = getPlayoffsResult(season, team);
    statsPromise = getTeamStats(season, team);
    rosterPromise = getRoster(season, team);
  }

  const [basicInfo, playoffs, stats, roster] = await Promise.all([
    basicInfoPromise,
    playoffsPromise,
    statsPromise,
    rosterPromise
  ]);

  return {
    ...basicInfo,
    playoffs: playoffs,
    stats: stats,
    roster: roster
  };
}

async function getCurrentBasicTeamInfo(team) {
  const teamAbbr = await getTeamAbbreviation(team);
  const teamStandings = await getTeamFromStandings(teamAbbr);
  const {
    teamName: { default: name }, teamLogo, conferenceName, divisionName
  } = teamStandings;

  return {
    name,
    logoURL: teamLogo,
    conference: conferenceName,
    division: divisionName
  };
}

async function getTeamAbbreviation(teamId) {
  const teamsData = (await fetchDataFromNHLApi(`/team`, true)).data;
  const team = teamsData.find(teamObj => teamObj.id === parseInt(teamId));
  return team.triCode;
}

async function getTeamFromStandings(teamAbbr) {
  const standings = (await fetchDataFromNHLApi(`/standings/now`)).standings;
  const team = standings.find(teamObj => teamObj.teamAbbrev.default === teamAbbr);
  return team;
}

async function getCurrentPlayoffsResult(team) {
  return null;
}

async function getCurrentTeamStats(team) {
  const teamAbbr = await getTeamAbbreviation(team);
  const teamStandings = await getTeamFromStandings(teamAbbr);

  const {
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
  } = teamStandings;

  return {
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
  }
}

async function getCurrentRoster(team) {
  const currentSeason = await getCurrentSeason();
  const teamAbbr = await getTeamAbbreviation(team);
  const roster = await fetchDataFromNHLApi(`/roster/${teamAbbr}/${currentSeason}`);

  const forwards = [];
  const defensemen = [];
  const goalies = [];

  for (const player of roster.forwards) {
    const playerInfo = extractPlayerInfo(player);
    playerInfo.position = player.positionCode;
    playerInfo.shoots = player.shootsCatches;
    forwards.push(playerInfo);
  }

  for (const player of roster.defensemen) {
    const playerInfo = extractPlayerInfo(player);
    playerInfo.shoots = player.shootsCatches;
    defensemen.push(playerInfo);
  }

  for (const player of roster.goalies) {
    const playerInfo = extractPlayerInfo(player);
    playerInfo.catches = player.shootsCatches;
    goalies.push(playerInfo);
  }

  return {
    forwards,
    defensemen,
    goalies
  };
}

function extractPlayerInfo(player) {
  const {
    id,
    firstName,
    lastName,
    headshot,
    sweaterNumber,
    heightInInches,
    weightInPounds,
    birthDate
  } = player;

  return {
    id,
    name: `${firstName.default} ${lastName.default}`,
    imageURL: headshot,
    captain: null,
    alternateCaptain: null,
    number: sweaterNumber,
    height: getFormattedHeight(heightInInches),
    weight: weightInPounds,
    dateOfBirth: getFormattedDate(birthDate),
    placeOfBirth: getPlaceOfBirth(player)
  };
}

function getFormattedHeight(height) {
  const feet = Math.floor(height / 12);
  const inches = height % 12;
  return `${feet}'${inches}"`;
}

function getFormattedDate(date) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  });
}

function getPlaceOfBirth(player) {
  if (!("birthCity" in player)) return "";

  let result = player.birthCity.default;
  if (player.birthStateProvince) result += `, ${player.birthStateProvince.default}`;
  if (player.birthCountry) result += `, ${player.birthCountry}`;

  return result;
}

async function getBasicTeamInfo(season, team) {
  return (await pool.query(
    `SELECT team AS name, logoURL, conference, division FROM standings
    WHERE season = ${season} AND teamId = ${team}`
  ))[0][0];
}

async function getPlayoffsResult(season, team) {
  const playoffRounds = (await pool.query(
    `SELECT playoffRounds FROM seasons
    WHERE id = ${season}`
  ))[0][0].playoffRounds;

  if (playoffRounds === null) return null;

  const [series] = await pool.query(
    `SELECT ${playoffsQueryColumns} FROM playoff_series
    WHERE season = ${season} AND (team1Id = ${team} OR team2Id = ${team})
    ORDER BY id DESC`
  );

  if (series.length === 0) return "Did Not Qualify";

  const {
    round,
    team1Id,
    team1Abbreviation,
    team2Abbreviation,
    statusShort
  } = series[0];

  const abbreviation = team1Id === Number(team) ? team1Abbreviation : team2Abbreviation;

  if (round === "Stanley Cup Final") {
    return `Stanley Cup ${statusShort.includes(abbreviation) ? "Champions" : "Runners-up"}`;
  } else {
    return `Eliminated in ${round}`;
  }
}

const playoffsQueryColumns = [
  "round",
  "team1Id",
  "team1Abbreviation",
  "team2Id",
  "team2Abbreviation",
  "statusShort"
];

async function getTeamStats(season, team) {
  return (await pool.query(
    `SELECT ${statsQueryColumns} FROM standings
    WHERE season = ${season} AND teamId = ${team}`
  ))[0][0];
}

const statsQueryColumns = [
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

async function getRoster(season, team) {
  const [forwards, defensemen, goalies] = await Promise.all([
    getForwards(season, team),
    getDefensemen(season, team),
    getGoalies(season, team)
  ]);

  return {
    forwards: forwards,
    defensemen: defensemen,
    goalies: goalies
  };
}

async function getForwards(season, team) {
  return (await pool.query(
    `SELECT ${rosterQueryColumns}, position, shoots FROM skaters
    WHERE season = ${season} AND teamId = ${team} AND positionType = "Forward"`
  ))[0];
}

async function getDefensemen(season, team) {
  return (await pool.query(
    `SELECT ${rosterQueryColumns}, shoots FROM skaters
    WHERE season = ${season} AND teamId = ${team} AND positionType = "Defenseman"`
  ))[0];
}

async function getGoalies(season, team) {
  return (await pool.query(
    `SELECT ${rosterQueryColumns}, catches FROM goalies
    WHERE season = ${season} AND teamId = ${team}`
  ))[0];
}

const rosterQueryColumns = [
  "playerId AS id",
  "player AS name",
  "imageURL",
  "captain",
  "alternateCaptain",
  "number",
  "height",
  "weight",
  `DATE_FORMAT(dateOfBirth, "%b %e, %Y") AS dateOfBirth`,
  "placeOfBirth"
];