import { jest } from "@jest/globals";
import MockPool from "../mock/mock-pool";

const mockFetchResult = {
  seasons: [
    {
      conferencesInUse: true,
      divisionsInUse: true,
      tiesInUse: false
    }
  ]
};

jest.unstable_mockModule("../../src/utils/nhl-api", () => ({
  fetchDataFromNHLApi: jest.fn().mockReturnValue(mockFetchResult)
}));

const mockQueryResult = [[
  {
    id: 20222023,
    conferencesInUse: 1,
    divisionsInUse: 1,
    conferences: "Conferences",
    divisions: "Divisions",
    tiesInUse: 0,
    overtimeLossPointInUse: 1,
    powerPlayStatsTracked: 1,
    shootingStatsTracked: 1,
    faceoffStatsTracked: 1,
    saveStatsTracked: 1
  }
]];

jest.unstable_mockModule("mysql2/promise", () => ({
  createPool: jest.fn().mockReturnValue(
    new MockPool([mockQueryResult, mockQueryResult])
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