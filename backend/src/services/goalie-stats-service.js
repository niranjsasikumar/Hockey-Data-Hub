import { getCurrentSeason} from "../utils/utils.js";
import axios from "axios";
import { fetchDataFromNHLApi, getLogoUrl } from "../utils/nhl-api.js";
import pool from "../database/database.js";

export default async function getGoalieStats(season, sort) {
  if (season === "current") return await getCurrentSeasonStats(sort);
  return await getStats(season, sort);
}

async function getCurrentSeasonStats(sort) {
  const sortArray = getSortArray(sort);
  const minGamesPlayed = await getCurrentMinGamesPlayed();
  const currentSeason = await getCurrentSeason();
  const url = `https://api.nhle.com/stats/rest/en/goalie/summary?isAggregate=false&isGame=false&sort=${JSON.stringify(sortArray)}&start=0&limit=20&factCayenneExp=gamesPlayed%3E=${minGamesPlayed}&cayenneExp=gameTypeId=2%20and%20seasonId%3C=${currentSeason}%20and%20seasonId%3E=${currentSeason}`;
  const { data } = await axios.get(url);

  const statsData = { minGamesPlayed: minGamesPlayed, stats: [] };

  for (const player of data.data) {
    const playerData = extractPlayerData(player);
    statsData.stats.push(playerData);
  }

  return statsData;
}

function getSortArray(sort) {
  let sortArray;

  switch (sort) {
    case "gamesPlayed":
      sortArray = [
        { property: "gamesPlayed", direction: "DESC" },
        { property: "gamesStarted", direction: "DESC" },
        { property: "wins", direction: "DESC" }
      ];
      break;
    case "gamesStarted":
      sortArray = [
        { property: "gamesStarted", direction: "DESC" },
        { property: "gamesPlayed", direction: "DESC" },
        { property: "wins", direction: "DESC" }
      ];
      break;
    case "wins":
      sortArray = [
        { property: "wins", direction: "DESC" },
        { property: "gamesPlayed", direction: "ASC" },
        { property: "gamesStarted", direction: "DESC" }
      ];
      break;
    case "shotsAgainst":
      sortArray = [
        { property: "shotsAgainst", direction: "DESC" },
        { property: "saves", direction: "DESC" }
      ];
      break;
    case "saves":
      sortArray = [
        { property: "saves", direction: "DESC" },
        { property: "savePct", direction: "DESC" }
      ];
      break;
    case "goalsAgainst":
      sortArray = [
        { property: "goalsAgainst", direction: "DESC" },
        { property: "gamesPlayed", direction: "ASC" }
      ];
      break;
    case "savePercentage":
      sortArray = [
        { property: "savePct", direction: "DESC" },
        { property: "saves", direction: "DESC" }
      ];
      break;
    case "goalsAgainstAverage":
      sortArray = [
        { property: "goalsAgainstAverage", direction: "ASC" },
        { property: "gamesPlayed", direction: "DESC" },
        { property: "gamesStarted", direction: "DESC" }
      ];
      break;
    case "shutouts":
      sortArray = [
        { property: "shutouts", direction: "DESC" },
        { property: "gamesPlayed", direction: "DESC" },
        { property: "gamesStarted", direction: "DESC" }
      ];
      break;
    case "timeOnIce":
      sortArray = [
        { property: "timeOnIce", direction: "DESC" }
      ];
      break;
  }

  sortArray.push({ property: "playerId", direction: "ASC" });
  return sortArray;
}

// Get the minimum number of games a goalie should have played in the current season to be included in the stats
async function getCurrentMinGamesPlayed() {
  const standings = (await fetchDataFromNHLApi("/standings")).records;
  let numberOfGames = 0;

  for (const division of standings) {
    for (const team of division.teamRecords) {
      if (team.gamesPlayed > numberOfGames) {
        numberOfGames = team.gamesPlayed;
      }
    }
  }

  if (numberOfGames === 1) return 1;
  return Math.round(0.3 * numberOfGames);
}

function extractPlayerData(player) {
  const {
    playerId,
    goalieFullName,
    seasonId,
    teamAbbrevs,
    shootsCatches,
    gamesPlayed,
    gamesStarted,
    wins,
    shotsAgainst,
    saves,
    goalsAgainst,
    savePct,
    goalsAgainstAverage,
    shutouts,
    timeOnIce
  } = player;

  const currentTeam = teamAbbrevs.slice(-3);

  return {
    playerId: playerId,
    player: goalieFullName,
    imageURL: `https://assets.nhle.com/mugs/nhl/${seasonId}/${currentTeam}/${playerId}.png`,
    teamAbbreviation: teamAbbrevs.split(",").join(", "),
    teamLogoURL: `https://assets.nhle.com/logos/nhl/svg/${currentTeam}_light.svg`,
    catches: shootsCatches,
    gamesPlayed: gamesPlayed,
    gamesStarted: gamesStarted,
    wins: wins,
    shotsAgainst: shotsAgainst,
    saves: saves,
    goalsAgainst: goalsAgainst,
    savePercentage: savePct ? Math.round((savePct + Number.EPSILON) * 10000) / 100 : null,
    goalsAgainstAverage: Math.round((goalsAgainstAverage + Number.EPSILON) * 1000) / 1000,
    shutouts: shutouts,
    timeOnIce: Math.floor(timeOnIce / 60) + ":" + (timeOnIce % 60)
  };
}

async function getStats(season, sort) {
  const minGamesPlayed = await getMinGamesPlayed(season);
  const sortString = getSortString(sort);
  
  const [stats] = await pool.query(
    `SELECT ${queryColumns}, GROUP_CONCAT(teamAbbreviation ORDER BY id SEPARATOR ", ") AS teamAbbreviation, GROUP_CONCAT(teamId ORDER BY id SEPARATOR ",") AS teamIds FROM goalies
    WHERE season = ${season} AND gamesPlayed >= ${minGamesPlayed}
    GROUP BY ${queryColumns}
    ORDER BY ${sortString}, playerId ASC
    LIMIT 20`
  );

  for (const player of stats) {
    const teamAbbreviation = player.teamAbbreviation.split(", ")[0];
    const teamId = player.teamIds.split(",")[0];
    player.imageURL = `https://assets.nhle.com/mugs/nhl/${season}/${teamAbbreviation}/${player.playerId}.png`;
    player.teamLogoURL = await getLogoUrl(season, teamId);
    player.savePercentage = player.savePercentage ? Math.round((player.savePercentage + Number.EPSILON) * 10000) / 100 : null;
    player.goalsAgainstAverage = Math.round((player.goalsAgainstAverage + Number.EPSILON) * 1000) / 1000;
  }

  return {
    minGamesPlayed: minGamesPlayed,
    stats: stats
  };
}

function getSortString(sort) {
  switch (sort) {
    case "gamesPlayed":
      return "gamesPlayed DESC, gamesStarted DESC, wins DESC";
    case "gamesStarted":
      return "gamesStarted DESC, gamesPlayed DESC, wins DESC";
    case "wins":
      return "wins DESC, gamesPlayed ASC, gamesStarted DESC";
    case "shotsAgainst":
      return "shotsAgainst DESC, saves DESC";
    case "saves":
      return "saves DESC, savePercentage DESC";
    case "goalsAgainst":
      return "goalsAgainst DESC, gamesPlayed ASC";
    case "savePercentage":
      return "savePercentage DESC, saves DESC";
    case "goalsAgainstAverage":
      return "goalsAgainstAverage ASC, gamesPlayed DESC, gamesStarted DESC";
    case "shutouts":
      return "shutouts DESC, gamesPlayed DESC, gamesStarted DESC";
    case "timeOnIce":
      return "timeOnIce DESC";
  }
}

// Get the minimum number of games a goalie should have played to be included in the stats
async function getMinGamesPlayed(season) {
  const numberOfGames = (await pool.query(
    `SELECT numberOfGames FROM seasons
    WHERE id = ${season}`
  ))[0][0].numberOfGames;

  return Math.round(0.3 * numberOfGames);
}

const queryColumns = [
  "playerId",
  "player",
  "catches",
  "gamesPlayed",
  "gamesStarted",
  "wins",
  "shotsAgainst",
  "saves",
  "goalsAgainst",
  "savePercentage",
  "goalsAgainstAverage",
  "shutouts",
  "timeOnIce"
];