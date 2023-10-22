import {
  getGameValues,
  getScheduleData,
  getSeasonSchedule,
  extractGameData,
  getGoalScorers
} from "../../src/api/games";
import regularGame from "../test_data/api/game-regular-season.json";
import playoffGame from "../test_data/api/game-playoffs.json";
import gameNoAwayGoals from "../test_data/api/game-no-away-goals.json";
import gameNoHomeGoals from "../test_data/api/game-no-home-goals.json";
import gameNoGoalScorers from "../test_data/api/game-no-goal-scorer-info.json";

test("getGameValues", async () => {
  const seasons = [19171918];
  const gameValues = await getGameValues(seasons);
  expect(gameValues.length).toBe(36);
  expect(gameValues[0][0]).toBe(1917020001);
}, 10000);

test("getScheduleData", async () => {
  const seasons = [19171918];
  const scheduleData = await getScheduleData(seasons);
  expect(scheduleData.length).toBe(1);
  expect(scheduleData[0][0].games[0].gamePk).toBe(1917020001);
}, 10000);

describe("getSeasonSchedule", () => {
  test("Season without playoffs data", async () => {
    const season = 19171918;
    const seasonSchedule = await getSeasonSchedule(season);
    const game = seasonSchedule[30].games[0];
    expect(game.gamePk).toBe(1917030111);
    expect("seriesSummary" in game).toBe(false);
  }, 10000);

  test("Season with playoffs data", async () => {
    const season = 19421943;
    const seasonSchedule = await getSeasonSchedule(season);
    const game = seasonSchedule[78].games[0];
    expect(game.gamePk).toBe(1942030111);
    expect("seriesSummary" in game).toBe(true);
  }, 10000);
});


describe("extractGameData", () => {
  test("Regular season game that ended in regulation time", async () => {
    const season = 19171918;
    const gameData = await extractGameData(season, regularGame);
    expect(gameData.length).toBe(24);
    expect(gameData[5]).toBe("Final");
    expect(gameData[7]).toBeNull();
    expect(gameData[8]).toBeNull();
  });

  test("Playoff game that ended in overtime", async () => {
    const season = 19421943;
    const gameData = await extractGameData(season, playoffGame);
    expect(gameData.length).toBe(24);
    expect(gameData[5]).toBe("Final/OT");
    expect(gameData[7]).toBe("Semifinals");
    expect(gameData[8]).toBe(1942194312);
  });
});

describe("getGoalScorers", () => {
  test("No goals for away team", () => {
    const [awayGoalScorers, homeGoalScorers] = getGoalScorers(gameNoAwayGoals);
    expect(awayGoalScorers).toBe("No goals");
    expect(homeGoalScorers).not.toBe("No goals");
  });

  test("No goals for home team", () => {
    const [awayGoalScorers, homeGoalScorers] = getGoalScorers(gameNoHomeGoals);
    expect(awayGoalScorers).not.toBe("No goals");
    expect(homeGoalScorers).toBe("No goals");
  });

  test("Goal scorer information not available", () => {
    const [
      awayGoalScorers, homeGoalScorers
    ] = getGoalScorers(gameNoGoalScorers);
    expect(awayGoalScorers).toBe("Goal scorer information not available");
    expect(homeGoalScorers).toBe("Goal scorer information not available");
  });
});