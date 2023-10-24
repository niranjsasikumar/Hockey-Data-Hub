import {
  getPlayerValues,
  getTeamData,
  getPlayerStatsData,
  extractGoalieData,
  extractSkaterData,
  extractPlayerData,
  getPlayerImageUrl,
  getPlaceOfBirth
} from "../../src/api/players";
import teamRoster from "../test_data/api/team-roster.json";
import team from "../test_data/api/team-1917-MTL.json";
import goalie from "../test_data/api/goalie.json";
import skater from "../test_data/api/skater.json";

describe("getPlayerValues", () => {
  test("Team with no roster property", async () => {
    const seasons = [19261927];
    const [skaterValues, goalieValues] = await getPlayerValues(seasons);
    expect(skaterValues.length + goalieValues.length).toBe(162);
    expect(skaterValues[0][1]).toBe(8445940);
  }, 20000);

  test("Player with no stats", async () => {
    const seasons = [19381939];
    const [skaterValues, goalieValues] = await getPlayerValues(seasons);
    expect(skaterValues.length + goalieValues.length).toBe(165);
    const player = goalieValues.find(goalie => goalie[1] === 8449960);
    expect(player[19]).toBeNull();
  }, 20000);
});

test("getTeamData", async () => {
  const seasons = [19171918];
  const teamData = await getTeamData(seasons);
  expect(teamData.length).toBe(1);
  expect(teamData[0].teams[0].id).toBe(36);
}, 20000);

test("getPlayerStatsData", async () => {
  const season = 19171918;
  const playerStats = await getPlayerStatsData(teamRoster, season);
  expect(playerStats.length).toBe(12);
  expect(playerStats[0].stats[0].splits[0].stat.points).toBe(1);
}, 10000);

describe("extractGoalieData", () => {
  test("Player has stats", async () => {
    const season = 19171918;
    const player = goalie.player;
    const hasStats = true;
    const playerStats = goalie.stats;
    const goalieData = await extractGoalieData(
      season, team, player, hasStats, playerStats
    );
    expect(goalieData[19]).toBe(21);
  });

  test("Player does not have stats", async () => {
    const season = 19171918;
    const player = goalie.player;
    const hasStats = false;
    const playerStats = [];
    const goalieData = await extractGoalieData(
      season, team, player, hasStats, playerStats
    );
    expect(goalieData[19]).toBeNull();
  });
});

describe("extractSkaterData", () => {
  test("Player has stats", async () => {
    const season = 19171918;
    const player = skater.player;
    const hasStats = true;
    const playerStats = skater.stats;
    const skaterData = await extractSkaterData(
      season, team, player, hasStats, playerStats
    );
    expect(skaterData[24]).toBe(1);
  });

  test("Player does not have stats", async () => {
    const season = 19171918;
    const player = skater.player;
    const hasStats = false;
    const playerStats = [];
    const skaterData = await extractSkaterData(
      season, team, player, hasStats, playerStats
    );
    expect(skaterData[24]).toBeNull();
  });
});

test("extractPlayerData", async () => {
  const season = 19171918;
  const player = skater.player;
  const playerData = await extractPlayerData(season, team, player);
  expect(playerData[1]).toBe(8445044);
});

test("getPlayerImageUrl", () => {
  const season = 19171918;
  const team = "MTL";
  const playerId = 8445044;
  const playerImageUrl = getPlayerImageUrl(season, team, playerId);
  expect(playerImageUrl).toBe(
    "https://assets.nhle.com/mugs/nhl/19171918/MTL/8445044.png"
  );
});

describe("getPlaceOfBirth", () => {
  test("No place of birth info", () => {
    const player = { id: 1 };
    const placeOfBirth = getPlaceOfBirth(player);
    expect(placeOfBirth).toBe("");
  });

  test("No birth state/province", () => {
    const player = { id: 1, birthCity: "Helsinki", birthCountry: "FIN" };
    const placeOfBirth = getPlaceOfBirth(player);
    expect(placeOfBirth).toBe("Helsinki, FIN");
  });

  test("Has all info", () => {
    const player = {
      id: 1, birthCity: "Toronto", birthStateProvince: "ON", birthCountry: "CAN"
    };
    const placeOfBirth = getPlaceOfBirth(player);
    expect(placeOfBirth).toBe("Toronto, ON, CAN");
  });
});