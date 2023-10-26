import { jest } from "@jest/globals";
import mockReturns from "../test_data/utils/utils.json";

jest.unstable_mockModule("../../src/utils/nhl-api", () => ({
  fetchDataFromNHLApi: jest.fn().mockReturnValueOnce(
    mockReturns.getCurrentSeason
  ).mockReturnValueOnce(
    mockReturns.seasonHasPlayoffsData
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