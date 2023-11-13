import { fetchDataFromNHLApi } from "./nhl-api.js";

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
  const response = await fetchDataFromNHLApi("/componentSeason", true);
  return Number(response.data[0].seasonId);
}

export async function seasonHasPlayoffsData(season) {
  const today = new Date()
  const seasonData = await fetchDataFromNHLApi(
    `/season?cayenneExp=id=${season}`, true
  );
  if (!("regularSeasonEndDate" in seasonData.data[0])) return false;
  const regularSeasonEndDate = seasonData.data[0].regularSeasonEndDate;
  return today.toISOString() > regularSeasonEndDate;
}