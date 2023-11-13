import pool from "../database/database.js";
import { getTodaysDate, getCurrentSeason } from "../utils/utils.js";
import { fetchDataFromNHLApi } from "../utils/nhl-api.js";
import { extractGameData, queryColumns, gameTypes } from "../utils/game-utils.js";

// Get schedule data from database or NHL API
export default async function getSchedule(team, date, offset) {
  const [results] = await pool.query(
    `SELECT seasonEndDate FROM seasons
    WHERE id = (SELECT MAX(id) FROM seasons)`
  );
  let lastSeasonEndDate = new Date(results[0].seasonEndDate);
  lastSeasonEndDate.setMinutes(lastSeasonEndDate.getMinutes() - 10080 + Number(offset));
  lastSeasonEndDate = lastSeasonEndDate.toISOString();

  if (date === "null") {
    const today = getTodaysDate(Number(offset));
    let scheduleData = await fetchScheduleData(team, today.toISOString(), 7);
    if (scheduleData.length > 0) return scheduleData;
    scheduleData = await fetchNextSeasonSchedule(team, Number(offset));
    if (scheduleData.length > 0) return scheduleData;
    return await getScheduleData(team, lastSeasonEndDate, 8);
  } else if (date > lastSeasonEndDate) {
    return await fetchScheduleData(team, date, 7);
  }

  return await getScheduleData(team, date, 7);
}

// Fetch schedule data from NHL API
async function fetchScheduleData(team, dateString, days) {
  const dateTimeRanges = getDateTimeRanges(dateString, days);
  const games = [];
  const date = new Date(dateTimeRanges[0].startString);
  const endDate = new Date(dateTimeRanges[dateTimeRanges.length - 1].endString);

  while (getDateString(date) <= getDateString(endDate)) {
    const gamesToAdd = (
      await fetchDataFromNHLApi(`/score/${getDateString(date)}`)
    ).games;
    gamesToAdd.filter(game => gameOfTeam(game, team)).forEach(game => games.push(game));
    date.setDate(date.getDate() + 1);
  }
  
  return extractScheduleFromData(games, dateTimeRanges);
}

export function getDateString(date) {
  return date.toISOString().substring(0, 10);
}

function gameOfTeam(game, team) {
  if (team === "all") return true;
  const { awayTeam, homeTeam } = game;
  const teamId = parseInt(team);
  if (awayTeam.id === teamId || homeTeam.id === teamId) return true;
  return false;
}

// Fetch the schedule of the next season from NHL API
async function fetchNextSeasonSchedule(team, offset) {
  const nextSeason = (await getCurrentSeason()) + 10001;
  let preSeasonStartDate;

  try {
    preSeasonStartDate = (await fetchDataFromNHLApi(`/season?cayenneExp=id=${nextSeason}`, true)).data[0].preseasonStartdate;
  } catch {
    return [];
  }

  preSeasonStartDate = new Date(preSeasonStartDate);
  preSeasonStartDate.setMinutes(preSeasonStartDate.getMinutes() - 1440 + Number(offset));
  preSeasonStartDate = preSeasonStartDate.toISOString();
  
  const dateTimeRanges = getDateTimeRanges(preSeasonStartDate, 8);
  const games = [];
  const date = new Date(dateTimeRanges[0].startString);
  const endDate = new Date(dateTimeRanges[dateTimeRanges.length - 1].endString);

  while (getDateString(date) <= getDateString(endDate)) {
    const gamesToAdd = (
      await fetchDataFromNHLApi(`/score/${getDateString(date)}`)
    ).games;
    gamesToAdd.filter(game => gameOfTeam(game, team)).forEach(game => games.push(game));
    date.setDate(date.getDate() + 1);
  }
  
  return extractScheduleFromData(games, dateTimeRanges);
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

function extractScheduleFromData(games, dateTimeRanges) {
  const gamesData = games.map(game => extractGameData(game));
  const schedule = [];

  for (const range of dateTimeRanges) {
    const gamesInRange = gamesData.filter(game => (
      game.dateTime >= range.startString && game.dateTime < range.endString
    ));
    if (gamesInRange.length === 0) continue;
    schedule.push({
      date: range.date,
      games: gamesInRange
    });
  }

  return schedule;
}

// Get schedule data from the database
async function getScheduleData(team, dateString, days) {
  const dateTimeRanges = getDateTimeRanges(dateString, days);
  const schedule = [];

  for (const range of dateTimeRanges) {
    const [results] = await pool.query(
      `SELECT ${queryColumns.toString()} FROM games
      WHERE dateTime >= "${range.startString}" AND dateTime < "${range.endString}"
      ${team !== "all" ? `AND (awayId = ${team} OR homeId = ${team})` : ""}
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