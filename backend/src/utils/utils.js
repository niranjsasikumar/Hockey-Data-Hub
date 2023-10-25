import { fetchDataFromNHLApi } from "./nhl-api";

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
  const playoffsData = await fetchDataFromNHLApi(
    `/tournaments/playoffs?season=${season}`
  );
  return "rounds" in playoffsData;
}