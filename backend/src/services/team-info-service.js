import connection from "../database/database.js";

export default async function getTeamInfo(season, team) {
  return await getPastSeasonTeamInfo(season, team);
}

async function getPastSeasonTeamInfo(season, team) {
  const [basicInfo, playoffs, stats, roster] = await Promise.all([
    getBasicTeamInfo(season, team),
    getPlayoffsResult(season, team),
    getTeamStats(season, team),
    getRoster(season, team)
  ]);

  return {
    ...basicInfo,
    playoffs: playoffs,
    stats: stats,
    roster: roster
  };
}

async function getBasicTeamInfo(season, team) {
  return (await connection.query(
    `SELECT team AS name, logoURL, conference, division FROM standings
    WHERE season = ${season} AND teamId = ${team}`
  ))[0][0];
}

async function getPlayoffsResult(season, team) {
  const playoffRounds = (await connection.query(
    `SELECT playoffRounds FROM seasons
    WHERE id = ${season}`
  ))[0][0].playoffRounds;

  if (playoffRounds === null) return null;

  const [series] = await connection.query(
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
    return statusShort.includes(abbreviation) ? "Stanley Cup Champions" : "Stanley Cup Runners-up";
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
  return (await connection.query(
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
  return (await connection.query(
    `SELECT ${rosterQueryColumns}, position, shoots FROM skaters
    WHERE season = ${season} AND teamId = ${team} AND positionType = "Forward"`
  ))[0];
}

async function getDefensemen(season, team) {
  return (await connection.query(
    `SELECT ${rosterQueryColumns}, shoots FROM skaters
    WHERE season = ${season} AND teamId = ${team} AND positionType = "Defenseman"`
  ))[0];
}

async function getGoalies(season, team) {
  return (await connection.query(
    `SELECT ${rosterQueryColumns}, catches FROM goalies
    WHERE season = ${season} AND teamId = ${team}`
  ))[0];
}

const rosterQueryColumns = [
  "player",
  "imageURL",
  "captain",
  "alternateCaptain",
  "number",
  "height",
  "weight",
  "dateOfBirth",
  "placeOfBirth"
];