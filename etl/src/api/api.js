import { API_BASE_URL } from "../constants.js";

// Fetch data from the given NHL API endpoint
export async function fetchDataFromApi(endpoint) {
  const response = await fetch(API_BASE_URL + endpoint);
  const data = await response.json();
  return data;
}

// Get the URL of the logo a team used during a given season
export async function getLogoUrl(season, teamId) {
  const response = await fetch(
    `https://records.nhl.com/site/api/logo?cayenneExp=teamId=${teamId}%20and%20background=%22light%22%20and%20startSeason%3C=${season}%20and%20endSeason%3E=${season}`
  );
  const data = await response.json();
  if (data.data.length === 0) return ""
  return data?.data[0]?.secureUrl;
}