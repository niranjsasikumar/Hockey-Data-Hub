import { jest } from "@jest/globals";
import mockReturns from "../test_data/services/season-info.json";
import MockPool from "../mock/mock-pool";

jest.unstable_mockModule("../../src/utils/nhl-api", () => ({
  fetchDataFromNHLApi: jest.fn().mockReturnValue(mockReturns.fetch)
}));

jest.unstable_mockModule("mysql2/promise", () => ({
  createPool: jest.fn().mockReturnValue(
    new MockPool([mockReturns.query, mockReturns.query])
  )
}));

const {
  default: getSeasonInfo, getCurrentSeasonInfo, getSeasonInfoFromDatabase
} = await import("../../src/services/season-info-service");

describe("getSeasonInfo", () => {
  test("Current season", async () => {
    const season = "current";
    const seasonInfo = await getSeasonInfo(season);
    expect(seasonInfo.id).toBe("current");
  });

  test("Past season", async () => {
    const season = "20222023";
    const seasonInfo = await getSeasonInfo(season);
    expect(seasonInfo.id).toBe(20222023);
  });
});

test("getCurrentSeasonInfo", async () => {
  const seasonInfo = await getCurrentSeasonInfo();
  expect(seasonInfo.id).toBe("current");
});

test("getSeasonInfoFromDatabase", async () => {
  const season = "20222023";
  const seasonInfo = await getSeasonInfoFromDatabase(season);
  expect(seasonInfo.id).toBe(20222023);
});