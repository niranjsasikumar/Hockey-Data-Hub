import { API_BASE_URL } from "../constants.js";

// Fetch data from the given NHL API endpoint
export async function fetchDataFromApi(endpoint) {
  const response = await fetch(API_BASE_URL + endpoint);
  const data = await response.json();
  return data;
}

// Get the URL of the logo a team used during a given season
export function getLogoUrl(season, teamId) {
  return "https://www-league.nhlstatic.com/images/logos/teams-" + season + "-light/" + teamId + ".svg";
}