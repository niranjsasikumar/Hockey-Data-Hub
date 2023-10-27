import { jest } from "@jest/globals";
import mockReturns from "../test_data/services/playoffs.json";
import MockPool from "../mock/mock-pool";

jest.unstable_mockModule("../../src/utils/nhl-api", () => ({
  fetchDataFromNHLApi: jest.fn().mockReturnValue(mockReturns.fetch)
}));

jest.unstable_mockModule("mysql2/promise", () => ({
  createPool: jest.fn().mockReturnValue(new MockPool([
    mockReturns.queries[0],
    mockReturns.queries[0],
    mockReturns.queries[1],
    mockReturns.queries[2],
    mockReturns.queries[2]
  ]))
}));

const {
  default: getPlayoffs, getCurrentSeasonPlayoffs, getPlayoffsData
} = await import("../../src/services/playoffs-service");

describe("getPlayoffs", () => {
  test("Current season", async () => {
    const season = "current";
    const playoffs = await getPlayoffs(season);
    expect(playoffs.length).toBe(2);
    expect(playoffs[0].series.length).toBe(1);
  });

  test("Past season", async () => {
    const season = "20222023";
    const playoffs = await getPlayoffs(season);
    expect(playoffs).toEqual([]);
  });
});

test("getCurrentSeasonPlayoffs", async () => {
  const playoffs = await getCurrentSeasonPlayoffs();
  expect(playoffs.length).toBe(2);
  expect(playoffs[0].series.length).toBe(1);
});

describe("getPlayoffsData", () => {
  test("Given season does not have playoffs information", async () => {
    const season = "19171918";
    const playoffs = await getPlayoffsData(season);
    expect(playoffs).toEqual([]);
  });

  test("Given season has playoffs information", async () => {
    const season = "20222023";
    const playoffs = await getPlayoffsData(season);
    expect(playoffs.length).toBe(2);
  expect(playoffs[0].series.length).toBe(2);
  });
});