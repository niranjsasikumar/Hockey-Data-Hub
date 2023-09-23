import { getLogoUrl, fetchDataFromApi } from "./api.js";
import { LAST_SEASON } from "../constants.js";

// Returns a row of values to insert into "teams" table
async function extractTeamData(team) {
  const logoUrl = await getLogoUrl(LAST_SEASON, team.id);
  return [
    team.id,
    team.name,
    team.locationName,
    team.teamName,
    team.abbreviation,
    logoUrl,
    team.venue?.name,
    team.venue?.city,
    team.firstYearOfPlay,
    team.conference?.name,
    team.division?.name,
    null
  ];
}

// Convert data of current teams from NHL API to rows of values to insert into "teams" table
export async function getTeamValues() {
  const teamsData = (await fetchDataFromApi("/teams")).teams;
  const teamValues = [];

  for (const team of teamsData) {
    teamValues.push(await extractTeamData(team));
  }

  return teamValues;
}