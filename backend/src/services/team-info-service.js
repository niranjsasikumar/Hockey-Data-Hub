import { fetchDataFromNHLApi, getCurrentSeason } from "../utils/utils.js";
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
  const teamInfo = (await fetchDataFromNHLApi(`/teams/${team}`)).teams[0];
  const { name, abbreviation, conference, division } = teamInfo;

  return {
    name,
    logoURL: `https://assets.nhle.com/logos/nhl/svg/${abbreviation}_light.svg`,
    conference: conference.name,
    division: division.name
  };
}

async function getCurrentPlayoffsResult(team) {
  let playoffsData = await fetchDataFromNHLApi("/tournaments/playoffs");
  if (!("rounds" in playoffsData)) return null;
  playoffsData = playoffsData.rounds;

  const teamData = (await fetchDataFromNHLApi(
    `/teams/${team}?expand=team.playoffs,team.stats&gameType=P`
  )).teams[0];

  const { madePlayoffs, inPlayoffs } = teamData.playoffInfo;
  if (!madePlayoffs) return "Did Not Qualify";

  let wins = teamData.teamStats[0].splits[0].stat.wins;
  let requiredWins = 0;

  for (let i = 0; i < playoffsData.length - 1; i++) {
    requiredWins += playoffsData[i].format.numberOfWins;
    let roundName = playoffsData[i].names.name;
    if (wins < requiredWins) {
      return inPlayoffs ? `In ${roundName}` : `Eliminated in ${roundName}`;
    }
  }

  requiredWins += playoffsData[playoffsData.length - 1].format.numberOfWins;
  return `Stanley Cup ${wins === requiredWins ? "Champions" : "Runners-up"}`;
}

async function getCurrentTeamStats(team) {
  const divisionId = (await fetchDataFromNHLApi(`/teams/${team}`)).teams[0].division.id;
  const standings = (await fetchDataFromNHLApi("/standings?expand=standings.record.overall")).records;

  for (const division of standings) {
    if ("division" in division && division.division.id != divisionId) continue;

    for (const record of division.teamRecords) {
      if (record.team.id != Number(team)) continue;

      const {
        divisionRank,
        leagueRank,
        points,
        gamesPlayed,
        leagueRecord: { wins, losses, ties, ot },
        goalsScored,
        goalsAgainst,
        records: { overallRecords },
        streak: { streakCode }
      } = record;

      const [homeRecord, awayRecord, , last10] = overallRecords;

      return {
        divisionRank: divisionRank ? divisionRank : null,
        leagueRank,
        points,
        gamesPlayed,
        wins,
        losses,
        ties: ties ? ties : null,
        overtimeLosses: ot ? ot : null,
        goalsFor: goalsScored,
        goalsAgainst,
        difference: goalsScored - goalsAgainst,
        homeRecord: getRecordString(homeRecord),
        awayRecord: getRecordString(awayRecord),
        last10: getRecordString(last10),
        streak: streakCode
      };
    }
  }
}

function getRecordString(record) {
  return `${record.wins}-${record.losses}${"ties" in record ? `-${record.ties}` : ""}${"ot" in record ? `-${record.ot}` : ""}`;
}

async function getCurrentRoster(team) {
  const currentSeason = await getCurrentSeason();
  const teamData = await fetchDataFromNHLApi(`/teams/${team}?expand=team.roster,roster.person`);

  const { abbreviation: teamAbbreviation, roster: { roster } } = teamData.teams[0];
  const forwards = [];
  const defensemen = [];
  const goalies = [];

  for (const player of roster) {
    const {
      person: {
        id,
        fullName,
        captain,
        alternateCaptain,
        primaryNumber,
        shootsCatches,
        height,
        weight,
        birthDate,
      },
      position: {
        abbreviation: position,
        type: positionType
      }
    } = player;

    const playerInfo = {
      id,
      name: fullName,
      imageURL: `https://assets.nhle.com/mugs/nhl/${currentSeason}/${teamAbbreviation}/${id}.png`,
      captain,
      alternateCaptain,
      number: primaryNumber,
      height,
      weight,
      dateOfBirth: getFormattedDate(birthDate),
      placeOfBirth: getPlaceOfBirth(player.person)
    };

    if (positionType === "Forward") {
      playerInfo.position = position;
      playerInfo.shoots = shootsCatches;
      forwards.push(playerInfo);
    } else if (positionType === "Defenseman") {
      playerInfo.shoots = shootsCatches;
      defensemen.push(playerInfo);
    } else if (positionType === "Goalie") {
      playerInfo.catches = shootsCatches;
      goalies.push(playerInfo);
    }
  }

  return {
    forwards: forwards,
    defensemen: defensemen,
    goalies: goalies
  };
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

  let result = player.birthCity;
  if (player.birthStateProvince) result += `, ${player.birthStateProvince}`;
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