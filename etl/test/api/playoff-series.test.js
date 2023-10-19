import {
  getPlayoffSeriesValues,
  hasPlayoffsData,
  getPlayoffsData,
  extractPlayoffSeriesData
} from "../../src/api/playoff-series";
import round from "../test_data/api/playoff-round-data.json";

describe("getPlayoffSeriesValues", () => {
  test("Provided seasons do not have playoffs data", async () => {
    const seasons = [19171918, 19181919];
    const values = await getPlayoffSeriesValues(seasons);
    expect(values.length).toBe(0);
  });

  test("Some of the provided seasons do not have playoffs data", async () => {
    const seasons = [19171918, 19421943];
    const values = await getPlayoffSeriesValues(seasons);
    expect(values.length).toBe(3);
  });

  test("Provided seasons have playoffs data", async () => {
    const seasons = [19421943, 19431944];
    const values = await getPlayoffSeriesValues(seasons);
    expect(values.length).toBe(6);
  });
});

describe("hasPlayoffsData", () => {
  test("Provided season has valid playoffs data", () => {
    const season = 19171918;
    const seasonHasPlayoffsData = hasPlayoffsData(season);
    expect(seasonHasPlayoffsData).toBe(false);
  });

  test("Provided season does not have valid playoffs data", () => {
    const season = 19421943;
    const seasonHasPlayoffsData = hasPlayoffsData(season);
    expect(seasonHasPlayoffsData).toBe(true);
  });
});

test("getPlayoffsData", async () => {
  const seasons = [19421943, 19431944];
  const playoffsData = await getPlayoffsData(seasons);
  expect(playoffsData.length).toBe(2);
  expect(playoffsData[0]).toHaveProperty("rounds");
});

test("extractPlayoffSeriesData", async () => {
  const season = 19421943;
  const series = round.series[0];
  const seriesData = await extractPlayoffSeriesData(season, round, series);
  expect(seriesData[0]).toBe(1942194311);
});