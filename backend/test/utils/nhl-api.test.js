import { fetchDataFromNHLApi, getLogoUrl } from "../../src/utils/nhl-api";

test("fetchDataFromNHLApi", async () => {
  const endpoint = "/seasons/20222023";
  const data = await fetchDataFromNHLApi(endpoint);
  expect(data.seasons[0].seasonId).toBe("20222023");
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