import { fetchDataFromApi } from "./api.js";
import { PLAYOFFS_DATA_SEASONS } from "../constants.js";

// Get season data for the given seasons from NHL API
async function getSeasonData(seasons) {
  const seasonDataPromises = seasons.map(
    season => fetchDataFromApi("/seasons/" + season)
  );

  const standingsDataPromises = seasons.map(
    season => fetchDataFromApi("/standings?season=" + season)
  );

  const playoffsDataPromises = seasons.map(
    season => fetchDataFromApi("/tournaments/playoffs?season=" + season)
  );

  return await Promise.all(
    seasonDataPromises.concat(standingsDataPromises).concat(playoffsDataPromises)
  );
}

// Returns two strings with names of the conferences and divisions respectively
function getSeasonStructure(standingsData) {
  let conferences = new Set();
  let divisions = [];

  if (standingsData.length > 1) {
    for (const division of standingsData) {
      divisions.push(division.division?.name);
      if ("conference" in division && division.conference?.name !== "") {
        conferences.add(division.conference?.name);
      }
    }
  }

  conferences = conferences.size === 0 ? null : Array.from(conferences).toString();
  divisions = divisions.length === 0 ? null : divisions.toString();

  return [conferences, divisions];
}

// Returns a string with names of the playoff rounds
function getPlayoffRounds(playoffsData) {
  if (playoffsData === null) return null;

  const roundNames = [];
  playoffsData.forEach((round) => roundNames.push(round.names?.name));
  return roundNames.toString();
}

// Returns a row of values to insert into "seasons" table
function extractSeasonData(seasonData, standingsData, playoffsData) {
  const id = seasonData.seasonId;
  const [conferences, divisions] = getSeasonStructure(standingsData);

  return [
    id,
    seasonData.regularSeasonStartDate,
    seasonData.regularSeasonEndDate,
    seasonData.seasonEndDate,
    seasonData.numberOfGames,
    seasonData.conferencesInUse,
    seasonData.divisionsInUse,
    seasonData.wildCardInUse,
    conferences,
    divisions,
    getPlayoffRounds(playoffsData),
    seasonData.tiesInUse,
    id >= 19992000 ? true : false,
    id >= 19331934 ? true : false,
    id >= 19591960 ? true : false,
    id >= 19971998 ? true : false,
    id >= 19551956 ? true : false,
  ];
}

// Convert data of seasons from NHL API to rows of values to insert into "seasons" table
export async function getSeasonValues(seasons) {
  const data = await getSeasonData(seasons);
  const len = seasons.length;
  const seasonData = data.slice(0, len);
  const standingsData = data.slice(len, len*2);
  const playoffsData = data.slice(len*2);
  const seasonValues = [];

  for (let i = 0; i < len; i++) {
    seasonValues.push(
      extractSeasonData(
        seasonData[i].seasons[0],
        standingsData[i].records,
        PLAYOFFS_DATA_SEASONS.includes(seasons[i]) ? playoffsData[i].rounds : null
      )
    );
  }

  return seasonValues;
}