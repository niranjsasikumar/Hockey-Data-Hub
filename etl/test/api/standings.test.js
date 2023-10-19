import {
  getStandingsValues, getStandingsData, extractStandingsData, getRecordString
} from "../../src/api/standings";
import division1917 from "../test_data/api/standings-data-1917-1918.json";
import division2000 from "../test_data/api/standings-data-2000-2001.json";
import record2022 from "../test_data/api/standings-record-data.json"

test("getStandingsValues", async () => {
  const seasons = [19171918];
  const standingsValues = await getStandingsValues(seasons);
  expect(standingsValues.length).toBe(4);
});

test("getStandingsData", async () => {
  const seasons = [19171918];
  const standingsData = await getStandingsData(seasons);
  expect(standingsData[0]).toHaveProperty("records");
});

describe("extractStandingsData", () => {
  test("No conferences, divisions, or overtime losses", async () => {
    const team = division1917.teamRecords[0];
    const standingsData = await extractStandingsData(division1917, team);
    expect(standingsData.length).toBe(25);
    expect(standingsData[7]).toBeNull();
    expect(standingsData[8]).toBeNull();
    expect(standingsData[10]).toBeNull();
    expect(standingsData[17]).toBeNull();
  });

  test("Has conferences, divisions, and overtime losses", async () => {
    const team = division2000.teamRecords[0];
    const standingsData = await extractStandingsData(division2000, team);
    expect(standingsData.length).toBe(25);
    expect(standingsData[7]).toBe("Eastern");
    expect(standingsData[8]).toBe("Atlantic");
    expect(standingsData[10]).toBe("1");
    expect(standingsData[17]).toBe(3);
  });
});

describe("getRecordString", () => {
  test("No overtime losses", () => {
    const record = division1917.teamRecords[0].records.overallRecords[0];
    const recordString = getRecordString(record);
    expect(recordString).toBe("8-3-0");
  });

  test("No ties", () => {
    const recordString = getRecordString(record2022);
    expect(recordString).toBe("28-10-3");
  });

  test("Has ties and overtime losses", () => {
    const record = division2000.teamRecords[0].records.overallRecords[0];
    const recordString = getRecordString(record);
    expect(recordString).toBe("24-11-6-0");
  });
});