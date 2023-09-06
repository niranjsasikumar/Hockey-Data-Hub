import connection from "../database/database.js";

export default async function getGoalieStats(season, sort) {
  return await getStats(season, sort);
}

async function getStats(season, sort) {
  const minGamesPlayed = await getMinGamesPlayed(season);
  let sortString;

  switch (sort) {
    case "gamesPlayed":
      sortString = "gamesPlayed DESC, gamesStarted DESC, wins DESC";
      break;
    case "gamesStarted":
      sortString = "gamesStarted DESC, gamesPlayed DESC, wins DESC";
      break;
    case "wins":
      sortString = "wins DESC, gamesPlayed ASC, gamesStarted DESC";
      break;
    case "shotsAgainst":
      sortString = "shotsAgainst DESC, saves DESC";
      break;
    case "saves":
      sortString = "saves DESC, savePercentage DESC";
      break;
    case "goalsAgainst":
      sortString = "goalsAgainst DESC, gamesPlayed ASC";
      break;
    case "savePercentage":
      sortString = "savePercentage DESC, saves DESC";
      break;
    case "goalsAgainstAverage":
      sortString = "goalsAgainstAverage ASC, gamesPlayed DESC, gamesStarted DESC";
      break;
    case "shutouts":
      sortString = "shutouts DESC, gamesPlayed DESC, gamesStarted DESC";
      break;
    case "timeOnIce":
      sortString = "timeOnIce DESC";
      break;
  }
  
  const [stats] = await connection.query(
    `SELECT ${queryColumns} FROM goalies
    WHERE season = ${season} AND gamesPlayed >= ${minGamesPlayed}
    ORDER BY ${sortString}, playerId ASC
    LIMIT 20`
  );

  for (const player of stats) {
    player.savePercentage = player.savePercentage ? Math.round((player.savePercentage + Number.EPSILON) * 10000) / 100 : null;
    player.goalsAgainstAverage = Math.round((player.goalsAgainstAverage + Number.EPSILON) * 1000) / 1000;
  }

  return {
    minGamesPlayed: minGamesPlayed,
    stats: stats
  };
}

// Get the minimum number of games a goalie should have played to be included in the stats
async function getMinGamesPlayed(season) {
  const numberOfGames = (await connection.query(
    `SELECT numberOfGames FROM seasons
    WHERE id = ${season}`
  ))[0][0].numberOfGames;

  return Math.round(0.3 * numberOfGames);
}

const queryColumns = [
  "playerId",
  "player",
  "imageURL",
  "teamAbbreviation",
  "teamLogoURL",
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