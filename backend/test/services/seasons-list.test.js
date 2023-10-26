import { jest } from "@jest/globals";
import MockPool from "../mock/mock-pool";
import mockQueryReturn from "../test_data/services/seasons-list.json";

jest.unstable_mockModule("../../src/utils/utils", () => ({
  getCurrentSeason: jest.fn().mockReturnValueOnce(
    20222023
  ).mockReturnValueOnce(
    20232024
  ),
  seasonHasPlayoffsData: jest.fn().mockReturnValue(true)
}));

jest.unstable_mockModule("mysql2/promise", () => ({
  createPool: jest.fn().mockReturnValue(
    new MockPool([mockQueryReturn, mockQueryReturn])
  )
}));

const { default: getSeasonsList, convertSeasonIdtoString } = await import(
  "../../src/services/seasons-list-service"
);

describe("getSeasonsList", () => {
  test("Current season in database", async () => {
    const seasonsList = await getSeasonsList();
    expect(seasonsList.length).toBe(2);
  });

  test("Current season not in database", async () => {
    const seasonsList = await getSeasonsList();
    expect(seasonsList.length).toBe(3);
  });
});

test("convertSeasonIdtoString", () => {
  const id = 20222023;
  const seasonString = convertSeasonIdtoString(id);
  expect(seasonString).toBe("2022-2023");
});