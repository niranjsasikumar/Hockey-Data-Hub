import { PLAYOFFS_DATA_SEASONS } from "../constants.js";
import { getLogoUrl, fetchDataFromApi } from "./api.js";

// Returns whether the season has valid playoffs data
function hasPlayoffsData(season) {
  return PLAYOFFS_DATA_SEASONS.includes(season);
}

// Get playoffs data for the given seasons from NHL API
async function getPlayoffsData(seasons) {
  const playoffsDataPromises = seasons.map(
    season => fetchDataFromApi("/tournaments/playoffs?expand=round.series,schedule.game.seriesSummary&season=" + season)
  );
  return await Promise.all(playoffsDataPromises);
}

// Returns a row of values to insert into "playoff_series" table
function extractPlayoffSeriesData(season, round, series) {
  return [
    parseInt(season.toString() + round.number.toString() + series.seriesNumber.toString()),
    season,
    round.number,
    round.names?.name,
    series.seriesNumber,
    series.matchupTeams[0].team?.id,
    series.matchupTeams[0].team?.name,
    getLogoUrl(season, series.matchupTeams[0].team?.id),
    series.matchupTeams[1].team?.id,
    series.matchupTeams[1].team?.name,
    getLogoUrl(season, series.matchupTeams[1].team?.id),
    series.currentGame?.seriesSummary?.seriesStatus
  ];
}

// Convert playoff series data from NHL API for the given seasons to rows of values to insert into "playoff_series" table
export async function getPlayoffSeriesValues(seasons) {
  const validSeasons = seasons.filter(hasPlayoffsData);
  const playoffsData = await getPlayoffsData(validSeasons);
  const playoffSeriesValues = [];

  for (let i = 0; i < validSeasons.length; i++) {
    for (const round of playoffsData[i].rounds) {
      for (const series of round.series) {
        playoffSeriesValues.push(extractPlayoffSeriesData(validSeasons[i], round, series));
      }
    }
  }

  return playoffSeriesValues;
}