import connection from "../database/database.js";
import { getTodaysDate, getCurrentSeason, fetchDataFromNHLApi } from "../utils/utils.js";
import { getScoresData } from "./scores-service.js";
import { extractGames, queryColumns, gameTypes } from "../utils/game-utils.js";

// Get schedule data from database or NHL API
export default async function getSchedule(date, offset) {
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
    let scheduleData = await fetchScheduleData(today.toISOString(), 7);
    if (scheduleData.length > 0) return scheduleData;
    scheduleData = await fetchNextSeasonSchedule(Number(offset));
    if (scheduleData.length > 0) return scheduleData;
    return await getScoresData(lastSeasonEndDate, 8);
  } else if (date > lastSeasonEndDate) {
    return await fetchScheduleData(dateTime, 1);
  }

  return await getScheduleData(dateTime, rangeDays);
}

// Fetch schedule data from NHL API
async function fetchScheduleData(dateString, days) {
  const dateTimeRanges = getDateTimeRanges(dateString, days);
  const startDate = dateTimeRanges[0].startString.substring(0, 10);
  const endDate = dateTimeRanges[dateTimeRanges.length - 1].endString.substring(0, 10);

  const scheduleData = await fetchDataFromNHLApi(
    `/schedule?expand=schedule.teams,schedule.scoringplays,schedule.linescore,schedule.game.seriesSummary,seriesSummary.series,series.round&startDate=${startDate}&endDate=${endDate}`
  );
  
  return extractScheduleFromData(scheduleData.dates, dateTimeRanges);
}

// Fetch the schedule of the next season from NHL API
async function fetchNextSeasonSchedule(offset) {
  const nextSeason = (await getCurrentSeason()) + 10001;
  const scheduleData = (await fetchDataFromNHLApi(
    `/schedule?expand=schedule.teams,schedule.scoringplays,schedule.linescore,schedule.game.seriesSummary,seriesSummary.series,series.round&season=${nextSeason}`
  )).dates;
  if (scheduleData.length === 0) return [];

  let seasonStartDate = new Date(scheduleData[0].date);
  seasonStartDate.setMinutes(seasonStartDate.getMinutes() - 1440 + Number(offset));
  seasonStartDate = seasonStartDate.toISOString();
  
  const dateTimeRanges = getDateTimeRanges(seasonStartDate, 8);
  
  return extractScheduleFromData(scheduleData.slice(0, 9), dateTimeRanges);
}

// Get the start times and end times of the dates leading up to the provided date
function getDateTimeRanges(dateTimeString, days) {
  let date = new Date(dateTimeString);
  let ranges = [];

  for (let i = 0; i < days; i++) {
    ranges.push({
      startString: date.toISOString(),
      date: new Date(date),
      endString: new Date(date.setDate(date.getDate() + 1)).toISOString()
    });
  }

  return ranges;
}

function extractScheduleFromData(scheduleData, dateTimeRanges) {
  const games = extractGames(scheduleData);
  const schedule = [];

  for (const range of dateTimeRanges) {
    const gamesInRange = games.filter((game) => game.dateTime >= range.startString && game.dateTime < range.endString);
    if (gamesInRange.length === 0) continue;
    schedule.push({
      date: range.date,
      games: gamesInRange
    });
  }

  return schedule;
}

// Get schedule data from the database
async function getScheduleData(dateString, days) {
  const dateTimeRanges = getDateTimeRanges(dateString, days);
  const schedule = [];

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

    schedule.push({
      date: range.date,
      games: results
    });
  }

  return schedule;
}