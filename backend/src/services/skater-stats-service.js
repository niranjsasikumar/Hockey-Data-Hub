import { getCurrentSeason } from "../utils/utils.js";
import axios from "axios";
import connection from "../database/database.js";

export default async function getSkaterStats(season, sort) {
  if (season === "current") return await getCurrentSeasonStats(sort);
  return await getStats(season, sort);
}

async function getCurrentSeasonStats(sort) {
  const sortArray = getSortArray(sort);
  const currentSeason = await getCurrentSeason();
  const url = `https://api.nhle.com/stats/rest/en/skater/summary?isAggregate=false&isGame=false&sort=${JSON.stringify(sortArray)}&start=0&limit=20&factCayenneExp=gamesPlayed%3E=1&cayenneExp=gameTypeId=2%20and%20seasonId%3C=${currentSeason}%20and%20seasonId%3E=${currentSeason}`;
  const { data } = await axios.get(url);

  const stats = [];

  for (const player of data.data) {
    const playerData = extractPlayerData(player);
    stats.push(playerData);
  }

  return stats;
}

function getSortArray(sort) {
  let sortArray;

  switch (sort) {
    case "gamesPlayed":
      sortArray = [
        { property: "gamesPlayed", direction: "DESC" }
      ];
      break;
    case "goals":
      sortArray = [
        { property: "goals", direction: "DESC" },
        { property: "assists", direction: "DESC" }
      ];
      break;
    case "assists":
      sortArray = [
        { property: "assists", direction: "DESC" },
        { property: "goals", direction: "DESC" }
      ];
      break;
    case "points":
      sortArray = [
        { property: "points", direction: "DESC" },
        { property: "goals", direction: "DESC" },
        { property: "assists", direction: "DESC" }
      ];
      break;
    case "pointsPerGamesPlayed":
      sortArray = [
        { property: "pointsPerGame", direction: "DESC" },
        { property: "gamesPlayed", direction: "ASC" }
      ];
      break;
    case "powerPlayGoals":
      sortArray = [
        { property: "ppGoals", direction: "DESC" },
        { property: "ppPoints", direction: "DESC" }
      ];
      break;
    case "powerPlayPoints":
      sortArray = [
        { property: "ppPoints", direction: "DESC" },
        { property: "ppGoals", direction: "DESC" }
      ];
      break;
    case "shots":
      sortArray = [
        { property: "shots", direction: "DESC" },
        { property: "shootingPct", direction: "DESC" }
      ];
      break;
    case "shootingPercentage":
      sortArray = [
        { property: "shootingPct", direction: "DESC" },
        { property: "goals", direction: "DESC" }
      ];
      break;
    case "faceoffPercentage":
      sortArray = [
        { property: "faceoffWinPct", direction: "DESC" },
        { property: "gamesPlayed", direction: "DESC" }
      ];
      break;
  }

  sortArray.push({ property: "playerId", direction: "ASC" });
  return sortArray;
}

function extractPlayerData(player) {
  const {
    playerId,
    skaterFullName,
    seasonId,
    teamAbbrevs,
    positionCode,
    shootsCatches,
    gamesPlayed,
    goals,
    assists,
    points,
    pointsPerGame,
    ppGoals,
    ppPoints,
    shots,
    shootingPct,
    faceoffWinPct
  } = player;

  const currentTeam = teamAbbrevs.slice(-3);

  return {
    playerId: playerId,
    player: skaterFullName,
    imageURL: `https://assets.nhle.com/mugs/nhl/${seasonId}/${currentTeam}/${playerId}.png`,
    teamAbbreviation: teamAbbrevs.split(",").join(", "),
    teamLogoURL: `https://assets.nhle.com/logos/nhl/svg/${currentTeam}_light.svg`,
    position: positionCode === "L" || positionCode === "R" ? positionCode + "W" : positionCode,
    shoots: shootsCatches,
    gamesPlayed: gamesPlayed,
    goals: goals,
    assists: assists,
    points: points,
    pointsPerGamesPlayed: pointsPerGame ? Math.round((pointsPerGame + Number.EPSILON) * 1000) / 1000 : null,
    powerPlayGoals: ppGoals,
    powerPlayPoints: ppPoints,
    shots: shots,
    shootingPercentage: shootingPct ? Math.round((shootingPct + Number.EPSILON) * 10000) / 100 : null,
    faceoffPercentage: faceoffWinPct ? Math.round((faceoffWinPct + Number.EPSILON) * 10000) / 100 : null
  };
}

async function getStats(season, sort) {
  const sortString = getSortString(sort);
  
  const [stats] = await connection.query(
    `SELECT ${queryColumns}, GROUP_CONCAT(teamAbbreviation ORDER BY id SEPARATOR ", ") AS teamAbbreviation, GROUP_CONCAT(teamId ORDER BY id SEPARATOR ",") AS teamIds FROM skaters
    WHERE season = ${season}
    GROUP BY ${queryColumns}
    ORDER BY ${sortString}, playerId ASC
    LIMIT 20`
  );

  for (const player of stats) {
    const teamAbbreviation = player.teamAbbreviation.split(", ")[0];
    const teamId = player.teamIds.split(",")[0];
    player.imageURL = `https://assets.nhle.com/mugs/nhl/${season}/${teamAbbreviation}/${player.playerId}.png`;
    player.teamLogoURL = `https://www-league.nhlstatic.com/images/logos/teams-${season}-light/${teamId}.svg`;
  }

  return stats;
}

function getSortString(sort) {
  switch (sort) {
    case "gamesPlayed":
      return "gamesPlayed DESC";
    case "goals":
      return "goals DESC, assists DESC";
    case "assists":
      return "assists DESC, goals DESC";
    case "points":
      return "points DESC, goals DESC, assists DESC";
    case "pointsPerGamesPlayed":
      return "pointsPerGamesPlayed DESC, gamesPlayed ASC";
    case "powerPlayGoals":
      return "powerPlayGoals DESC, powerPlayPoints DESC";
    case "powerPlayPoints":
      return "powerPlayPoints DESC, powerPlayGoals DESC";
    case "shots":
      return "shots DESC, shootingPercentage DESC";
    case "shootingPercentage":
      return "shootingPercentage DESC, goals DESC";
    case "faceoffPercentage":
      return "faceoffPercentage DESC, gamesPlayed DESC";
  }
}

const queryColumns = [
  "playerId",
  "player",
  "position",
  "shoots",
  "gamesPlayed",
  "goals",
  "assists",
  "points",
  "pointsPerGamesPlayed",
  "powerPlayGoals",
  "powerPlayPoints",
  "shots",
  "shootingPercentage",
  "faceoffPercentage"
];