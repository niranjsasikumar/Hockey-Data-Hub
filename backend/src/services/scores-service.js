import connection from "../database/database.js";
import { fetchDataFromNHLApi, getLogoUrl } from "../utils/utils.js";

// Get scores data from database or NHL API
export default async function getScores(date, offset) {
  const [results] = await connection.query(
    `SELECT seasonEndDate FROM seasons
    WHERE id = (SELECT MAX(id) FROM seasons)`
  );
  let lastSeasonEndDate = new Date(results[0].seasonEndDate);
  lastSeasonEndDate.setMinutes(lastSeasonEndDate.getMinutes() + 1440 + Number(offset));
  lastSeasonEndDate = lastSeasonEndDate.toISOString();

  let dateTime = date;
  let rangeDays = 1;

  if (date === "null") {
    const today = getTodaysDate(Number(offset));
    const scoresData = await fetchScoresData(today.toISOString(), 7);
    if (scoresData.length > 0) return scoresData;
    dateTime = lastSeasonEndDate;
    rangeDays = 8;
  } else if (date > lastSeasonEndDate) {
    return await fetchScoresData(dateTime, 1);
  }

  return await getScoresData(dateTime, rangeDays);
}

function getTodaysDate(offset) {
  let today = new Date();
  today.setUTCMilliseconds(0);
  today.setUTCSeconds(0);
  today.setUTCMinutes(0);
  today.setUTCHours(0);
  today.setMinutes(today.getMinutes() + offset);
  return today;
}

// Fetch scores data from NHL API
async function fetchScoresData(dateString, days) {
  const dateTimeRanges = getDateTimeRanges(dateString, days);
  const startDate = dateTimeRanges[dateTimeRanges.length - 1].startString.substring(0, 10);
  const endDate = dateTimeRanges[0].endString.substring(0, 10);

  const scheduleData = await fetchDataFromNHLApi(
    `/schedule?expand=schedule.teams,schedule.scoringplays,schedule.linescore,schedule.game.seriesSummary,seriesSummary.series,series.round&startDate=${startDate}&endDate=${endDate}`
  );
  const games = extractGames(scheduleData.dates);

  const scores = [];

  for (const range of dateTimeRanges) {
    const gamesInRange = games.filter((game) => game.dateTime >= range.startString && game.dateTime < range.endString);
    if (gamesInRange.length === 0) continue;
    scores.push({
      date: range.date,
      games: gamesInRange
    });
  }

  return scores;
}

// Get the start times and end times of the dates leading up to the provided date
function getDateTimeRanges(dateTimeString, days) {
  let date = new Date(dateTimeString);
  date.setDate(date.getDate() + 1);

  let ranges = [];

  for (let i = 0; i < days; i++) {
    ranges.push({
      endString: date.toISOString(),
      date: new Date(date.setDate(date.getDate() - 1)),
      startString: date.toISOString()
    });
  }

  return ranges;
}

// Extract the required game data from the response received from the NHL API
function extractGames(scheduleData) {
  const games = [];

  for (const date of scheduleData) {
    for (const game of date.games) {
      const { away, home } = game.teams;
      const [awayGoalScorers, homeGoalScorers] = getGoalScorers(game);

      games.push({
        id: game.gamePk,
        type: gameTypes[game.gameType],
        dateTime: game.gameDate,
        status: getGameStatus(game),
        playoffRound: "seriesSummary" in game ? game.seriesSummary?.series?.round?.names?.name : null,
        playoffGameNumber: game.seriesSummary?.gameLabel,
        awayShortName: away.team?.teamName,
        awayAbbreviation: away.team?.abbreviation,
        awayLogoURL: getLogoUrl(game.season, away.team?.id),
        awayGoals: ["3", "4", "5", "6", "7"].includes(game.status.statusCode) ? away.score : null,
        awayGoalScorers: awayGoalScorers,
        homeShortName: home.team?.teamName,
        homeAbbreviation: home.team?.abbreviation,
        homeLogoURL: getLogoUrl(game.season, home.team?.id),
        homeGoals: ["3", "4", "5", "6", "7"].includes(game.status.statusCode) ? home.score : null,
        homeGoalScorers: homeGoalScorers
      });
    }
  }

  return games;
}

function getGoalScorers(game) {
  let awayId = game.teams?.away?.team?.id;
  let awayGoalScorers = "";
  let homeGoalScorers = "";

  for (const goal of game.scoringPlays) {
    for (const player of goal.players) {
      if (player.playerType === "Scorer") {
        const playerName = player.player?.fullName;
        if (goal.team?.id === awayId) {
          awayGoalScorers += awayGoalScorers === "" ? playerName : " | " + playerName;
        } else {
          homeGoalScorers += homeGoalScorers === "" ? playerName : " | " + playerName;
        }
        break;
      }
    }

    const goalInfo = " (" + goal.about?.ordinalNum + ", " + goal.about?.periodTime + ")";
    goal.team?.id === awayId ? awayGoalScorers += goalInfo : homeGoalScorers += goalInfo;
  }

  if (awayGoalScorers === "") {
    awayGoalScorers = game.teams?.away?.score > 0 ? "Goal scorer information not available" : "No goals";
  }

  if (homeGoalScorers === "") {
    homeGoalScorers = game.teams?.home?.score > 0 ? "Goal scorer information not available" : "No goals";
  }

  return [awayGoalScorers, homeGoalScorers];
}

function getGameStatus(game) {
  switch (game.status.statusCode) {
    case "1":
    case "2":
      return "Scheduled";
    case "3":
    case "4":
      return `${game.linescore?.currentPeriodOrdinal}, ${game.linescore?.currentPeriodTimeRemaining}`;
    case "5":
    case "6":
    case "7":
      const currentPeriod = game.linescore?.currentPeriodOrdinal;
      return currentPeriod === "3rd" || currentPeriod === "2nd" ? "Final" : "Final/" + currentPeriod;
    case "8":
      return "Time TBD";
    case "9":
      return "Postponed";
  }
}

// Get scores data from the database
async function getScoresData(dateString, days) {
  const dateTimeRanges = getDateTimeRanges(dateString, days);
  const scores = [];

  for (const range of dateTimeRanges) {
    const [results] = await connection.query(
      `SELECT ${queryColumns.toString()} FROM games
      WHERE dateTime >= "${range.startString}" AND dateTime < "${range.endString}"
      ORDER BY dateTime ASC`
    );

    if (results.length === 0) continue;

    for (const game of results) {
      game.type = gameTypes[game.type];
    }

    scores.push({
      date: range.date,
      games: results
    });
  }

  return scores;
}

const queryColumns = [
  "id",
  "type",
  "dateTime",
  "status",
  "playoffRound",
  "playoffGameNumber",
  "awayShortName",
  "awayAbbreviation",
  "awayLogoURL",
  "awayGoals",
  "awayGoalScorers",
  "homeShortName",
  "homeAbbreviation",
  "homeLogoURL",
  "homeGoals",
  "homeGoalScorers"
];

const gameTypes = {
  PR: "Pre-Season",
  R: "Regular Season",
  P: "Playoffs",
  A: "All-Star Game",
  WA: "Women's All-Star Game"
};