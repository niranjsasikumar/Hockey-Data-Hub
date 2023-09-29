import { PLAYOFFS_DATA_SEASONS } from "../constants.js";
import { fetchDataFromApi, getLogoUrl } from "./api.js";

// Get the games schedule for a season
async function getSeasonSchedule(season) {
  const playoffsExpand = PLAYOFFS_DATA_SEASONS.includes(season)
    ? ",series.round"
    : "";
  const startYear = season.toString().slice(0, 4);
  const endYear = season.toString().slice(4);

  const dateRanges = [
    [startYear + "-08-01", startYear + "-09-01"],
    [startYear + "-09-02", startYear + "-10-01"],
    [startYear + "-10-02", startYear + "-11-01"],
    [startYear + "-11-02", startYear + "-12-01"],
    [startYear + "-12-02", endYear + "-01-01"],
    [endYear + "-01-02", endYear + "-02-01"],
    [endYear + "-02-02", endYear + "-03-01"],
    [endYear + "-03-02", endYear + "-04-01"],
    [endYear + "-04-02", endYear + "-05-01"],
    [endYear + "-05-02", endYear + "-06-01"],
    [endYear + "-06-02", endYear + "-07-01"],
    [endYear + "-07-02", endYear + "-07-31"],
  ];

  // Fetch data in chunks instead of for whole season to prevent timeout error
  const seasonSchedulePromises = dateRanges.map(
    range => fetchDataFromApi(
      "/schedule?expand=schedule.teams,schedule.scoringplays,schedule.linescore"
      + ",schedule.game.seriesSummary,seriesSummary.series" + playoffsExpand
      + "&startDate=" + range[0] + "&endDate=" + range[1]
    )
  );

  const seasonSchedule = await Promise.all(seasonSchedulePromises);
  return seasonSchedule.map(month => month.dates).flat();
}

// Get schedule data for the given seasons from NHL API
async function getScheduleData(seasons) {
  const scheduleDataPromises = seasons.map(
    season => getSeasonSchedule(season)
  );
  return await Promise.all(scheduleDataPromises);
}

// Get goal scorer information for the away and home sides in a game
function getGoalScorers(game) {
  let awayId = game.teams?.away?.team?.id;
  let awayGoalScorers = "";
  let homeGoalScorers = "";

  for (const goal of game.scoringPlays) {
    for (const player of goal.players) {
      if (player.playerType === "Scorer") {
        const playerName = player.player?.fullName;
        if (goal.team?.id === awayId) {
          awayGoalScorers += (awayGoalScorers ? " | " : "") + playerName;
        } else {
          homeGoalScorers += (homeGoalScorers ? " | " : "") + playerName;
        }
        break;
      }
    }

    const goalInfo = " (" + goal.about?.ordinalNum + ", "
      + goal.about?.periodTime + ")";
    
    if (goal.team?.id === awayId) awayGoalScorers += goalInfo;
    else homeGoalScorers += goalInfo;
  }

  if (awayGoalScorers === "") {
    awayGoalScorers = game.teams?.away?.score > 0
      ? "Goal scorer information not available"
      : "No goals";
  }

  if (homeGoalScorers === "") {
    homeGoalScorers = game.teams?.home?.score > 0
      ? "Goal scorer information not available"
      : "No goals";
  }

  return [awayGoalScorers, homeGoalScorers];
}

// Returns a row of values to insert into "games" table
async function extractGameData(season, game) {
  const [awayGoalScorers, homeGoalScorers] = getGoalScorers(game);
  const currentPeriod = game.linescore?.currentPeriodOrdinal;
  const series = game.seriesSummary?.series;
  const { away, home } = game.teams;
  const awayLogoUrl = await getLogoUrl(season, away.team?.id);
  const homeLogoUrl = await getLogoUrl(season, home.team?.id);

  const gameStatus = currentPeriod === "3rd" || currentPeriod === "2nd"
    ? "Final"
    : "Final/" + currentPeriod;
  
  const playoffRound = "seriesSummary" in game
    ? series.round?.names?.name
    : null;
  
  const playoffSeriesId = "seriesSummary" in game ? parseInt(
    season.toString() + series.round?.number.toString()
    + series.seriesNumber.toString()
  ) : null;

  return [
    game.gamePk,
    season,
    game.gameType,
    game.gameDate,
    currentPeriod,
    gameStatus,
    game.venue?.name,
    playoffRound,
    playoffSeriesId,
    game.seriesSummary?.gameLabel,
    away.team?.id,
    away.team?.name,
    away.team?.teamName,
    away.team?.abbreviation,
    awayLogoUrl,
    away.score,
    awayGoalScorers,
    home.team?.id,
    home.team?.name,
    home.team?.teamName,
    home.team?.abbreviation,
    homeLogoUrl,
    home.score,
    homeGoalScorers
  ];
}

/* Convert game data from NHL API for the given seasons to rows of values to
insert into "games" table */
export async function getGameValues(seasons) {
  const scheduleData = await getScheduleData(seasons);
  const gameValues = [];

  for (let i = 0; i < seasons.length; i++) {
    for (const date of scheduleData[i]) {
      for (const game of date.games) {
        if (
          !PLAYOFFS_DATA_SEASONS.includes(seasons[i]) && game.gameType === "P"
        ) continue;
        if (game.linescore?.currentPeriodOrdinal === undefined) continue;
        gameValues.push(await extractGameData(seasons[i], game));
      }
    }
  }

  return gameValues;
}