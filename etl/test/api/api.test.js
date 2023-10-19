import { fetchDataFromApi, getLogoUrl } from "../../src/api/api";

test("fetchDataFromApi", async () => {
  const endpoint = "/expands";
  const data = await fetchDataFromApi(endpoint);
  expect(data.length).toBeGreaterThan(0);
  expect(data).toContainEqual({
    name: "game.team",
    description: "Expands the team object"
  });
});

describe("getLogoUrl", () => {
  test("Valid season and teamId", async () => {
    const season = 19171918;
    const teamId = 8;
    const url = await getLogoUrl(season, teamId);
    expect(url).toBe(
      "https://assets.nhle.com/logos/nhl/svg/MTL_19171918-19181919_light.svg"
    );
  });
  
  test("Invalid season or teamId", async () => {
    const season = 19171918;
    const teamId = 55;
    const url = await getLogoUrl(season, teamId);
    expect(url).toBe("");
  });
});