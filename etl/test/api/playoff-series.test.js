import {
  getPlayoffSeriesValues,
  hasPlayoffsData,
  getPlayoffsData,
  extractPlayoffSeriesData
} from "../../src/api/playoff-series";
import round from "../test_data/playoff-round-data.json";

describe("getPlayoffSeriesValues", () => {
  test("Provided seasons do not have playoffs data", async () => {
    const values = await getPlayoffSeriesValues([19171918, 19181919]);
    expect(values.length).toBe(0);
  });

  test("Some of the provided seasons do not have playoffs data", async () => {
    const values = await getPlayoffSeriesValues([19171918, 19421943]);
    expect(values.length).toBe(3);
  });

  test("Provided seasons have playoffs data", async () => {
    const values = await getPlayoffSeriesValues([19421943, 19431944]);
    expect(values.length).toBe(6);
  });
});

describe("hasPlayoffsData", () => {
  test("Provided season has valid playoffs data", () => {
    const seasonHasPlayoffsData = hasPlayoffsData(19171918);
    expect(seasonHasPlayoffsData).toBe(false);
  });

  test("Provided season does not have valid playoffs data", async () => {
    const seasonHasPlayoffsData = hasPlayoffsData(19421943);
    expect(seasonHasPlayoffsData).toBe(true);
  });
});

test("getPlayoffsData", async () => {
  const playoffsData = await getPlayoffsData([19421943, 19431944]);
  expect(playoffsData.length).toBe(2);
  expect(playoffsData[0]).toHaveProperty("rounds");
});

test("extractPlayoffSeriesData", async () => {
  const season = 19421943;
  const series = round.series[0];
  const seriesData = await extractPlayoffSeriesData(season, round, series);
  expect(seriesData[0]).toBe(1942194311);
});