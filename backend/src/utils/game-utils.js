import { getLogoUrl } from "./utils.js";

// Extract the required game data from the response received from the NHL API
export function extractGames(scheduleData) {
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

export const gameTypes = {
  PR: "Pre-Season",
  R: "Regular Season",
  P: "Playoffs",
  A: "All-Star Game",
  WA: "Women's All-Star Game"
};

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

export const queryColumns = [
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