import { getTeamValues, extractTeamData } from "../../src/api/teams";
import team from "../test_data/api/team-data.json";

test("getTeamValues", async () => {
  const teamValues = await getTeamValues();
  expect(teamValues.length).toBeGreaterThan(0);
});

test("extractTeamData", async () => {
  const teamData = await extractTeamData(team);
  expect(teamData[1]).toBe("New Jersey Devils");
  expect(teamData.length).toBe(12);
});