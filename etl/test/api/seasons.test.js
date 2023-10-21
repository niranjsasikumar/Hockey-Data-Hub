import {
  getSeasonValues,
  getSeasonData,
  extractSeasonData,
  getSeasonStructure,
  getPlayoffRounds
} from "../../src/api/seasons";
import season1917 from "../test_data/api/season-data-1917.json";
import season2022 from "../test_data/api/season-data-2022.json";
import season1926 from "../test_data/api/season-data-1926.json";

test("getSeasonValues", async () => {
  const seasons = [19171918, 19421943];
  const seasonValues = await getSeasonValues(seasons);
  expect(seasonValues.length).toBe(2);
  expect(seasonValues[0][10]).toBeNull();
  expect(seasonValues[1][10]).toBe("Semifinals,Stanley Cup Final");
});

test("getSeasonData", async () => {
  const seasons = [19171918];
  const seasonData = await getSeasonData(seasons);
  expect(seasonData.length).toBe(3);
  expect(seasonData[0].seasons[0].seasonId).toBe("19171918");
});

describe("extractSeasonData", () => {
  function verifyExtractSeasonData(
    seasonInfo, standingsData, playoffsData, expectStats
  ) {
    const seasonData = extractSeasonData(
      seasonInfo, standingsData, playoffsData
    );
    expect(seasonData.length).toBe(17);
    
    for (let i = 12; i < 17; i++) {
      expect(seasonData[i]).toBe(expectStats);
    }
  }

  test("No additional stats tracked", () => {
    const seasonInfo = season1917.info;
    const standingsData = season1917.standings;
    const playoffsData = season1917.playoffs;
    verifyExtractSeasonData(seasonInfo, standingsData, playoffsData, false);
  });

  test("Additional stats tracked", () => {
    const seasonInfo = season2022.info;
    const standingsData = season2022.standings;
    const playoffsData = season2022.playoffs;
    verifyExtractSeasonData(seasonInfo, standingsData, playoffsData, true);
  });
});

describe("getSeasonStructure", () => {
  test("Season without divisions or conferences", () => {
    const standingsData = season1917.standings;
    const [conferences, divisions] = getSeasonStructure(standingsData);
    expect(conferences).toBeNull();
    expect(divisions).toBeNull();
  });

  test("Season with divisions, but without conferences", () => {
    const standingsData = season1926.standings;
    const [conferences, divisions] = getSeasonStructure(standingsData);
    expect(conferences).toBeNull();
    expect(divisions).toBe("Canadian,American");
  });

  test("Season with divisions and conferences", () => {
    const standingsData = season2022.standings;
    const [conferences, divisions] = getSeasonStructure(standingsData);
    expect(conferences).toBe("Eastern,Western");
    expect(divisions).toBe("Metropolitan,Atlantic,Central,Pacific");
  });
});

describe("getPlayoffRounds", () => {
  test("Null playoffsData argument", () => {
    const playoffsData = null;
    const playoffRounds = getPlayoffRounds(playoffsData);
    expect(playoffRounds).toBeNull();
  });

  test("Not null playoffsData argument", () => {
    const playoffsData = season2022.playoffs;
    const playoffRounds = getPlayoffRounds(playoffsData);
    expect(playoffRounds).toBe(
      "First Round,Second Round,Conference Finals,Stanley Cup Final"
    );
  });
});