export function extractGameData(game) {
  const {
    id,
    gameType,
    startTimeUTC,
    gameState,
    awayTeam,
    homeTeam,
  } = game;

  const playoffsInfo = getPlayoffsInfo(id);
  const [awayGoalScorers, homeGoalScorers] = getGoalScorers(game);

  return {
    id,
    type: currentGameTypes[gameType - 1],
    dateTime: startTimeUTC,
    status: getGameStatus(game),
    playoffRound: playoffsInfo.round,
    playoffGameNumber: playoffsInfo.gameLabel,
    awayShortName: awayTeam.name.default,
    awayAbbreviation: awayTeam.abbrev,
    awayLogoURL: awayTeam.logo,
    awayGoals: gameState === "FUT" ? null : awayTeam.score,
    awayGoalScorers,
    homeShortName: homeTeam.name.default,
    homeAbbreviation: homeTeam.abbrev,
    homeLogoURL: homeTeam.logo,
    homeGoals: gameState === "FUT" ? null : homeTeam.score,
    homeGoalScorers
  };
}

function getPlayoffsInfo(gameId) {
  const idString = gameId.toString();
  if (idString[5] !== "3") return { round: null, gameLabel: null };
  const roundNumber = parseInt(idString[7]);
  return {
    round: playoffRounds[roundNumber - 1],
    gameLabel: `Game ${idString[9]}`
  };
}

const playoffRounds = [
  "First Round", "Second Round", "Conference Finals", "Stanley Cup Final"
];

function getGoalScorers(game) {
  if (!("goals" in game)) return [
    "Goal scorer information not available",
    "Goal scorer information not available"
  ];

  const { awayTeam, homeTeam, goals } = game;

  let awayAbbrev = awayTeam.abbrev;
  let awayGoalScorers = "";
  let homeGoalScorers = "";

  for (const goal of goals) {
    const { name, periodDescriptor, timeInPeriod, teamAbbrev } = goal;
    const playerName = name.default;
    const goalInfo = ` (${getPeriod(periodDescriptor)}, ${timeInPeriod})`;

    if (teamAbbrev === awayAbbrev) {
      awayGoalScorers += (awayGoalScorers ? " | " : "") + playerName;
      awayGoalScorers += goalInfo;
    } else {
      homeGoalScorers += (homeGoalScorers ? " | " : "") + playerName;
      homeGoalScorers += goalInfo;
    }
  }

  if (awayGoalScorers === "") {
    awayGoalScorers = awayTeam.score > 0
      ? "Goal scorer information not available"
      : "No goals";
  }

  if (homeGoalScorers === "") {
    homeGoalScorers = homeTeam.score > 0
      ? "Goal scorer information not available"
      : "No goals";
  }

  return [awayGoalScorers, homeGoalScorers];
}

function getPeriod(periodDescriptor) {
  const { number, periodType, otPeriods } = periodDescriptor;
  if (periodType === "SO" ) return "SO";
  if (periodType === "OT") return `${otPeriods > 1 ? otPeriods : ""}OT`;
  return regularPeriods[number - 1];
}

const currentGameTypes = [
  "Pre-Season", "Regular Season", "Playoffs", "All-Star Game"
];

function getGameStatus(game) {
  if ("gameOutcome" in game) {
    const { lastPeriodType, otPeriods } = game.gameOutcome;
    if (lastPeriodType === "SO" ) return "Final/SO";
    if (lastPeriodType === "OT")
      return `Final/${otPeriods > 1 ? otPeriods : ""}OT`;
    return "Final";
  }
  else if ("clock" in game) {
    const { timeRemaining, inIntermission } = game.clock;
    const { periodType, number } = game.periodDescriptor;
    if (inIntermission) return `Intermission, ${timeRemaining}`;
    if (periodType === "SO") return "Shootout";
    if (periodType === "OT")
      return `${otPeriods > 1 ? otPeriods : ""}OT, ${timeRemaining}`;
    return `${regularPeriods[number - 1]}, ${timeRemaining}`;
  }
  return "Scheduled";
}

const regularPeriods = ["1st", "2nd", "3rd"];

export const gameTypes = {
  PR: "Pre-Season",
  R: "Regular Season",
  P: "Playoffs",
  A: "All-Star Game",
  WA: "Women's All-Star Game"
};

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