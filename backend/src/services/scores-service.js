import connection from "../database/database.js";
import { getTodaysDate, fetchDataFromNHLApi } from "../utils/utils.js";
import { extractGames, queryColumns, gameTypes } from "../utils/game-utils.js";

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

// Get scores data from the database
export async function getScoresData(dateString, days) {
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