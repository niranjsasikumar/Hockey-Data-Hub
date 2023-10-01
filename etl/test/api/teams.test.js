import { getTeamValues, extractTeamData } from "../../src/api/teams";

test("Get team values", async () => {
  const teamValues = await getTeamValues();
  expect(teamValues.length).toBeGreaterThan(0);
});

const team = {
  id: 1,
  name: "New Jersey Devils",
  link: "/api/v1/teams/1",
  venue: {
    name: "Prudential Center",
    link: "/api/v1/venues/null",
    city: "Newark",
    timeZone: { id: "America/New_York", offset: -4, tz: "EDT" }
  },
  abbreviation: "NJD",
  teamName: "Devils",
  locationName: "New Jersey",
  firstYearOfPlay: "1982",
  division: {
    id: 18,
    name: "Metropolitan",
    nameShort: "Metro",
    link: "/api/v1/divisions/18",
    abbreviation: "M"
  },
  conference: { id: 6, name: "Eastern", link: "/api/v1/conferences/6" },
  franchise: {
    franchiseId: 23,
    teamName: "Devils",
    link: "/api/v1/franchises/23"
  },
  shortName: "New Jersey",
  officialSiteUrl: "http://www.newjerseydevils.com/",
  franchiseId: 23,
  active: true
};

test("Extract team data", async () => {
  const teamData = await extractTeamData(team);
  expect(teamData[1]).toBe("New Jersey Devils");
  expect(teamData.length).toBe(12);
});