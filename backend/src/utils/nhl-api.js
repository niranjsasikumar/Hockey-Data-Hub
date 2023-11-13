import axios from "axios";

const apiBaseURL = "https://api-web.nhle.com/v1";
const apiStatsBaseURL = "https://api.nhle.com/stats/rest/en";

export async function fetchDataFromNHLApi(endpoint, stats = false) {
  const baseURL = stats ? apiStatsBaseURL : apiBaseURL;
  const response = await axios.get(baseURL + endpoint);
  return response.data;
};

export async function getLogoUrl(season, teamId) {
  const response = await fetch(
    `https://records.nhl.com/site/api/logo?cayenneExp=teamId=${teamId}`
    + `%20and%20background=%22light%22%20and%20startSeason%3C=${season}`
    + `%20and%20endSeason%3E=${season}`
  );
  const data = await response.json();
  if (data.data.length === 0) return ""
  return data?.data[0]?.secureUrl;
}