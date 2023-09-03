import axios from "axios";

const apiBaseURL = "https://statsapi.web.nhl.com/api/v1";

export async function fetchDataFromNHLApi(endpoint) {
  const response = await axios.get(apiBaseURL + endpoint);
  return response.data;
};

export function getLogoUrl(season, teamId) {
  return "https://www-league.nhlstatic.com/images/logos/teams-" + season + "-light/" + teamId + ".svg";
};