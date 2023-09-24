import axios from "axios";

const apiBaseURL = "https://statsapi.web.nhl.com/api/v1";

export async function fetchDataFromNHLApi(endpoint) {
  const response = await axios.get(apiBaseURL + endpoint);
  return response.data;
};

export async function getLogoUrl(season, teamId) {
  const response = await fetch(
    `https://records.nhl.com/site/api/logo?cayenneExp=teamId=${teamId}%20and%20background=%22light%22%20and%20startSeason%3C=${season}%20and%20endSeason%3E=${season}`
  );
  const data = await response.json();
  if (data.data.length === 0) return ""
  return data?.data[0]?.secureUrl;
}

export function getTodaysDate(offset) {
  let today = new Date();
  today.setMinutes(today.getMinutes() - offset);
  today.setUTCMilliseconds(0);
  today.setUTCSeconds(0);
  today.setUTCMinutes(0);
  today.setUTCHours(0);
  today.setMinutes(today.getMinutes() + offset);
  return today;
}

export async function getCurrentSeason() {
  const response = await fetchDataFromNHLApi("/seasons/current");
  return Number(response.seasons[0].seasonId);
}

export async function seasonHasPlayoffsData(season) {
  const playoffsData = await fetchDataFromNHLApi(`/tournaments/playoffs?season=${season}`);
  return "rounds" in playoffsData;
}