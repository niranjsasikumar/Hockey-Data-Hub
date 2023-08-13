import { fetchDataFromApi } from "./api.js";
import { PLAYOFFS_DATA_SEASONS } from "../constants.js";

// Get the names of the conferences, divisions, and playoff rounds for the given season
async function getSeasonStructure(season) {
  const standingsData = (await fetchDataFromApi("/standings?season=" + season)).records;

  const conferences = new Set();
  const divisions = [];
  const playoffRounds = [];

  if (standingsData.length > 1) {
    for (const division of standingsData) {
      divisions.push(division.division?.name);
      if ("conference" in division) {
        conferences.add(division.conference?.name);
      }
    }
  }

  if (PLAYOFFS_DATA_SEASONS.includes(season)) {
    const playoffsData = await fetchDataFromApi("/tournaments/playoffs?season=" + season);
    if ("rounds" in playoffsData) {
      playoffsData.rounds.forEach((round) => playoffRounds.push(round.names?.name));
    }
  }

  return [Array.from(conferences).toString(), divisions.toString(), playoffRounds.toString()];
}

// Returns a row of values to insert into "seasons" table
async function extractSeasonData(season) {
  const [conferences, divisions, playoffRounds] = await getSeasonStructure(parseInt(season.seasonId));

  return [
    season.seasonId,
    season.regularSeasonStartDate,
    season.regularSeasonEndDate,
    season.seasonEndDate,
    season.numberOfGames,
    season.tiesInUse,
    season.conferencesInUse,
    season.divisionsInUse,
    season.wildCardInUse,
    conferences,
    divisions,
    playoffRounds
  ];
}

// Convert data of seasons from NHL API to rows of values to insert into "seasons" table
export async function getSeasonValues(seasons) {
  const seasonsData = (await fetchDataFromApi("/seasons?season=" + seasons)).seasons;
  const seasonValues = [];

  for (const season of seasonsData) {
    seasonValues.push(await extractSeasonData(season));
  }

  return seasonValues;
}