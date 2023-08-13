import { PLAYOFFS_DATA_SEASONS } from "../constants.js";
import { fetchDataFromApi, getLogoUrl } from "./api.js";

// Get the games schedule for a season
async function getSeasonSchedule(season) {
  let scheduleData = [];
  const playoffsExpand = PLAYOFFS_DATA_SEASONS.includes(season) ? ",series.round" : "";
  let startYear = parseInt(season.toString().slice(0, 4));
  let startMonth = 8;
  let startDay = "-01";
  let endYear = startYear;
  let endMonth = startMonth + 1;
  let endDay = "-01";

  // Fetch data in chunks instead of for whole season to prevent timeout error
  while (startMonth !== 8 || endDay !== "-31") {
    scheduleData = scheduleData.concat(
      (await fetchDataFromApi(
        "/schedule?expand=schedule.teams,schedule.scoringplays,schedule.linescore,schedule.game.seriesSummary,seriesSummary.series" +
        playoffsExpand +
        "&startDate=" + startYear + "-" + (startMonth < 10 ? 0 : "") + startMonth + startDay +
        "&endDate=" + endYear + "-" + (endMonth < 10 ? 0 : "") + endMonth + endDay
      )).dates
    );

    if (startMonth === 8) startDay = "-02";

    if (startMonth === 12) {
      startMonth = 1;
      startYear++;
    } else {
      startMonth++;
    }

    if (endMonth === 12) {
      endMonth = 1;
      endYear++;
    } else if (endMonth === 7) {
      endDay = "-31";
    } else {
      endMonth++;
    }
  }

  return scheduleData;
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

// Returns a row of values to insert into "games" table
function extractGameData(season, game) {
  const [awayGoalScorers, homeGoalScorers] = getGoalScorers(game);
  const currentPeriod = game.linescore?.currentPeriodOrdinal;
  const series = game.seriesSummary?.series;
  const { away, home } = game.teams;

  return [
    game.gamePk,
    season,
    game.gameType,
    game.gameDate.slice(0, 19).replace("T", " "),
    currentPeriod,
    currentPeriod === "3rd" ? "Final" : "Final/" + currentPeriod,
    game.venue?.name,
    "seriesSummary" in game ? series.round?.names?.name : null,
    "seriesSummary" in game ? parseInt(season.toString() + series.round?.number.toString() + series.seriesNumber.toString()) : null,
    game.seriesSummary?.gameLabel,
    away.team?.id,
    away.team?.name,
    away.team?.abbreviation,
    getLogoUrl(season, away.team?.id),
    away.score,
    awayGoalScorers,
    home.team?.id,
    home.team?.name,
    home.team?.abbreviation,
    getLogoUrl(season, home.team?.id),
    home.score,
    homeGoalScorers
  ];
}

// Convert game data from NHL API for the given seasons to rows of values to insert into "games" table
export async function getGameValues(seasons) {
  const gameValues = [];

  for (const season of seasons) {
    const scheduleData = await getSeasonSchedule(season);

    for (const date of scheduleData) {
      for (const game of date.games) {
        if (!PLAYOFFS_DATA_SEASONS.includes(season) && game.gameType === "P") continue;
        if (game.linescore?.currentPeriodOrdinal === undefined) continue;
        gameValues.push(extractGameData(season, game));
      }
    }
  }

  return gameValues;
}