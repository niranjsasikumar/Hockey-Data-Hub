import { jest } from "@jest/globals";

const mockReturn1 = {
  seasons: [
    {
      seasonId: "19171918"
    }
  ]
};

const mockReturn2 = {
  rounds: []
};

jest.unstable_mockModule("../../src/utils/nhl-api", () => ({
  fetchDataFromNHLApi: jest.fn().mockReturnValueOnce(
    mockReturn1
  ).mockReturnValueOnce(
    mockReturn2
  )
}));

const {
  getTodaysDate, getCurrentSeason, seasonHasPlayoffsData
} = await import("../../src/utils/utils");

test("getTodaysDate", () => {
  const offset = 0;
  const today = getTodaysDate(offset);
  expect(today).toBeInstanceOf(Date);
});

test("getCurrentSeason", async () => {
  const season = await getCurrentSeason();
  expect(season).toBe(19171918);
});

test("seasonHasPlayoffsData", async () => {
  const season = 20222023;
  const hasPlayoffsData = await seasonHasPlayoffsData(season);
  expect(hasPlayoffsData).toBe(true);
});