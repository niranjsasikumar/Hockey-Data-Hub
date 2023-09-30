import { fetchDataFromApi, getLogoUrl } from "../../src/api/api.js";

test("Successfully fetch data from NHL API", async () => {
  const data = await fetchDataFromApi("/expands");
  expect(data.length).toBeGreaterThan(0);
  expect(data).toContainEqual({
    name: "game.team",
    description: "Expands the team object"
  });
});

test("Get logo URL for valid season and team ID", async () => {
  const url = await getLogoUrl(19171918, 8);
  expect(url).toBe(
    "https://assets.nhle.com/logos/nhl/svg/MTL_19171918-19181919_light.svg"
  );
});

test("Get logo URL for invalid season or team ID", async () => {
  const url = await getLogoUrl(19171918, 55);
  expect(url).toBe("");
});