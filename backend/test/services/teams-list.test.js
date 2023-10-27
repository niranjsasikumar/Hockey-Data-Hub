import { jest } from "@jest/globals";
import mockReturns from "../test_data/services/teams-list.json";
import MockPool from "../mock/mock-pool";

jest.unstable_mockModule("../../src/utils/nhl-api", () => ({
  fetchDataFromNHLApi: jest.fn().mockReturnValue(mockReturns.fetch)
}));

jest.unstable_mockModule("mysql2/promise", () => ({
  createPool: jest.fn().mockReturnValue(new MockPool([
    mockReturns.query, mockReturns.query
  ]))
}));

const {
  default: getTeamsList, getCurrentTeams, getTeams
} = await import("../../src/services/teams-list-service");

describe("getTeamsList", () => {
  test("Current season", async () => {
    const season = "current";
    const teamsList = await getTeamsList(season);
    expect(teamsList.length).toBe(2);
    expect(teamsList[0].id).toBe(1);
  });

  test("Past season", async () => {
    const season = "20222023";
    const teamsList = await getTeamsList(season);
    expect(teamsList.length).toBe(2);
    expect(teamsList[0].id).toBe(1);
  });
});

test("getCurrentTeams", async () => {
  const teamsList = await getCurrentTeams();
  expect(teamsList.length).toBe(2);
  expect(teamsList[0].id).toBe(1);
});

test("getTeams", async () => {
  const season = "20222023";
  const teamsList = await getTeams(season);
  expect(teamsList.length).toBe(2);
  expect(teamsList[0].id).toBe(1);
});