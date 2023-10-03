import {
  getSeasonId, getSeasons, getPlayoffsSeasons
} from "../../src/constants";

test("getSeasonId", () => {
  const year = 2022;
  const seasonId = getSeasonId(year);
  expect(seasonId).toBe(20222023);
});

test("getSeasons", () => {
  const lastSeasonYear = 2022;
  const seasons = getSeasons(lastSeasonYear);
  expect(seasons.length).toBeGreaterThanOrEqual(105);
});

test("getPlayoffsSeasons", () => {
  const seasons = [19171918, 19421943, 19741975, 19901991];
  const playoffsSeasons = getPlayoffsSeasons(seasons);
  expect(playoffsSeasons).toEqual([19421943, 19901991]);
});