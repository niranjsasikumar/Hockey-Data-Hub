// Extract the required game data from the response received from the NHL API
export function extractGames(scheduleData) {
  const games = [];

  for (const date of scheduleData) {
    for (const game of date.games) {
      const { gamePk, gameType, gameDate, status: { statusCode } } = game;
      const round = game.seriesSummary?.series?.round?.names?.name;
      const gameLabel = game.seriesSummary?.gameLabel;
      const { away, home } = game.teams;
      const {
        teamName: awayShortName, abbreviation: awayAbbreviation
      } = away.team;
      const {
        teamName: homeShortName, abbreviation: homeAbbreviation
      } = home.team;

      const playoffRound = round ? round : null;
      const playoffGameNumber = gameLabel ? gameLabel : null;
      const awayLogoURL = (
        `https://assets.nhle.com/logos/nhl/svg/${awayAbbreviation}_light.svg`
      );
      const homeLogoURL = (
        `https://assets.nhle.com/logos/nhl/svg/${homeAbbreviation}_light.svg`
      );
      const awayGoals = ["3", "4", "5", "6", "7"].includes(statusCode)
        ? away.score
        : null;
      const homeGoals = ["3", "4", "5", "6", "7"].includes(statusCode)
        ? home.score
        : null;
      const [awayGoalScorers, homeGoalScorers] = getGoalScorers(game);

      games.push({
        id: gamePk,
        type: gameTypes[gameType],
        dateTime: gameDate,
        status: getGameStatus(game),
        playoffRound,
        playoffGameNumber,
        awayShortName,
        awayAbbreviation,
        awayLogoURL,
        awayGoals,
        awayGoalScorers,
        homeShortName,
        homeAbbreviation,
        homeLogoURL,
        homeGoals,
        homeGoalScorers
      });
    }
  }

  return games;
}

export function getGoalScorers(game) {
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

export const gameTypes = {
  PR: "Pre-Season",
  R: "Regular Season",
  P: "Playoffs",
  A: "All-Star Game",
  WA: "Women's All-Star Game"
};

export function getGameStatus(game) {
  const {
    currentPeriodOrdinal: currentPeriod,
    currentPeriodTimeRemaining
  } = game.linescore;

  switch (game.status.statusCode) {
    case "1":
    case "2":
      return "Scheduled";
    case "3":
    case "4":
      return `${currentPeriod}, ${currentPeriodTimeRemaining}`;
    case "5":
    case "6":
    case "7":
      let status;
      if (currentPeriod === "3rd" || currentPeriod === "2nd") status = "Final";
      else status = "Final/" + currentPeriod
      return status;
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