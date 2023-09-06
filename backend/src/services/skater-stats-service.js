import connection from "../database/database.js";

export default async function getSkaterStats(season, sort) {
  return await getStats(season, sort);
}

async function getStats(season, sort) {
  let sortString;

  switch (sort) {
    case "gamesPlayed":
      sortString = "gamesPlayed DESC";
      break;
    case "goals":
      sortString = "goals DESC, assists DESC";
      break;
    case "assists":
      sortString = "assists DESC, goals DESC";
      break;
    case "points":
      sortString = "points DESC, goals DESC, assists DESC";
      break;
    case "pointsPerGamesPlayed":
      sortString = "pointsPerGamesPlayed DESC, gamesPlayed ASC";
      break;
    case "powerPlayGoals":
      sortString = "powerPlayGoals DESC, powerPlayPoints DESC";
      break;
    case "powerPlayPoints":
      sortString = "powerPlayPoints DESC, powerPlayGoals DESC";
      break;
    case "shots":
      sortString = "shots DESC, shootingPercentage DESC";
      break;
    case "shootingPercentage":
      sortString = "shootingPercentage DESC, goals DESC";
      break;
    case "faceoffPercentage":
      sortString = "faceoffPercentage DESC, gamesPlayed DESC";
      break;
  }
  
  const [stats] = await connection.query(
    `SELECT ${queryColumns} FROM skaters
    WHERE season = ${season}
    ORDER BY ${sortString}, playerId ASC
    LIMIT 20`
  );

  return stats;
}

const queryColumns = [
  "playerId",
  "player",
  "imageURL",
  "teamAbbreviation",
  "teamLogoURL",
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