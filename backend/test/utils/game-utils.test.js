import {
  extractGames, getGoalScorers, getGameStatus
} from "../../src/utils/game-utils";
import scheduleData from "../test_data/utils/extractGames.json";
import gamesGoalInfo from "../test_data/utils/getGoalScorers.json";
import gamesStatus from "../test_data/utils/getGameStatus.json";

test("extractGames", () => {
  const games = extractGames(scheduleData);
  expect(games.length).toBe(2);
  expect(games[0].playoffRound).toBeNull();
  expect(games[0].playoffGameNumber).toBeNull();
  expect(games[0].awayGoals).toBeNull();
  expect(games[0].homeGoals).toBeNull();
  expect(games[1].playoffRound).toBe("Stanley Cup Final");
  expect(games[1].playoffGameNumber).toBe("Game 5");
  expect(games[1].awayGoals).toBe(3);
  expect(games[1].homeGoals).toBe(9);
});

describe("getGoalScorers", () => {
  test("No goals for away team", () => {
    const game = gamesGoalInfo.noAwayGoals;
    const [awayGoalScorers, homeGoalScorers] = getGoalScorers(game);
    expect(awayGoalScorers).toBe("No goals");
    expect(homeGoalScorers).not.toBe("No goals");
  });

  test("No goals for home team", () => {
    const game = gamesGoalInfo.noHomeGoals;
    const [awayGoalScorers, homeGoalScorers] = getGoalScorers(game);
    expect(awayGoalScorers).not.toBe("No goals");
    expect(homeGoalScorers).toBe("No goals");
  });

  test("Goal scorer information not available", () => {
    const game = gamesGoalInfo.noGoalScorerInfo;
    const [awayGoalScorers, homeGoalScorers] = getGoalScorers(game);
    expect(awayGoalScorers).toBe("Goal scorer information not available");
    expect(homeGoalScorers).toBe("Goal scorer information not available");
  });
});

describe("getGameStatus", () => {
  function testGetGameStatus(statusCode, expectedStatus) {
    test(`Game status ${statusCode}`, () => {
      const game = gamesStatus[statusCode - 1];
      const status = getGameStatus(game);
      expect(status).toBe(expectedStatus);
    });
  }

  const expectedStatuses = [
    "Scheduled",
    "Scheduled",
    "2nd, 10:00",
    "3rd, 1:00",
    "Final",
    "Final",
    "Final/OT",
    "Time TBD",
    "Postponed"
  ];

  for (let i = 1; i <= 9; i++) {
    testGetGameStatus(i, expectedStatuses[i-1]);
  }
});