import pool from "../database/database.js";
import { getTodaysDate } from "../utils/utils.js";
import { fetchDataFromNHLApi } from "../utils/nhl-api.js";
import { extractGameData, queryColumns, gameTypes } from "../utils/game-utils.js";

// Get scores data from database or NHL API
export default async function getScores(date, offset) {
  const lastSeasonEndDate = await getLastSeasonEndDate(offset);
  if (date === "null") return await getDefaultScores(lastSeasonEndDate, offset);
  else if (date > lastSeasonEndDate) return await fetchScoresData(date, 1);
  return await queryScoresData(date, 1);
}

// Get the end date of the most recent season in the database
export async function getLastSeasonEndDate(offset) {
  const [results] = await pool.query(
    `SELECT seasonEndDate FROM seasons
    WHERE id = (SELECT MAX(id) FROM seasons)`
  );
  let lastSeasonEndDate = new Date(results[0].seasonEndDate);
  lastSeasonEndDate.setMinutes(
    lastSeasonEndDate.getMinutes() + 1440 + Number(offset)
  );
  lastSeasonEndDate = lastSeasonEndDate.toISOString();
  return lastSeasonEndDate;
}

// Get the scores to display if no date is specified
export async function getDefaultScores(lastSeasonEndDate, offset) {
  const today = getTodaysDate(Number(offset));
  const scoresData = await fetchScoresData(today.toISOString(), 7);
  if (scoresData.length > 0) return scoresData;
  return await queryScoresData(lastSeasonEndDate, 8);
}

// Fetch scores data from NHL API
export async function fetchScoresData(dateString, days) {
  const dateTimeRanges = getDateTimeRanges(dateString, days);
  const games = [];
  const date = new Date(dateTimeRanges[dateTimeRanges.length - 1].startString);
  const endDate = new Date(dateTimeRanges[0].endString);

  while (getDateString(date) <= getDateString(endDate)) {
    const gamesToAdd = (
      await fetchDataFromNHLApi(`/score/${getDateString(date)}`)
    ).games;
    gamesToAdd.forEach(game => games.push(game));
    date.setDate(date.getDate() + 1);
  }

  return extractScoresFromSchedule(games, dateTimeRanges);
}

export function getDateString(date) {
  return date.toISOString().substring(0, 10);
}

// Get the start and end times of the dates leading up to the provided date
export function getDateTimeRanges(dateTimeString, days) {
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

// Extract score data from the schedule fetched from the NHL API
export function extractScoresFromSchedule(games, dateTimeRanges) {
  const gamesData = games.map(game => extractGameData(game));
  const scores = [];

  for (const range of dateTimeRanges) {
    const gamesInRange = gamesData.filter(game => (
      game.dateTime >= range.startString && game.dateTime < range.endString
    ));
    if (gamesInRange.length === 0) continue;
    scores.push({
      date: range.date,
      games: gamesInRange
    });
  }

  return scores;
}

// Query scores data from the database
export async function queryScoresData(dateString, days) {
  const dateTimeRanges = getDateTimeRanges(dateString, days);
  const scores = [];

  for (const range of dateTimeRanges) {
    const [results] = await pool.query(
      `SELECT ${queryColumns.toString()} FROM games
      WHERE dateTime >= "${range.startString}"
      AND dateTime < "${range.endString}"
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