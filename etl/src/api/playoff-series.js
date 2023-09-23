import { PLAYOFFS_DATA_SEASONS } from "../constants.js";
import { getLogoUrl, fetchDataFromApi } from "./api.js";

// Returns whether the season has valid playoffs data
function hasPlayoffsData(season) {
  return PLAYOFFS_DATA_SEASONS.includes(season);
}

// Get playoffs data for the given seasons from NHL API
async function getPlayoffsData(seasons) {
  const playoffsDataPromises = seasons.map(
    season => fetchDataFromApi("/tournaments/playoffs?expand=round.series,schedule.game.seriesSummary,series.matchup.team&season=" + season)
  );
  return await Promise.all(playoffsDataPromises);
}

// Returns a row of values to insert into "playoff_series" table
async function extractPlayoffSeriesData(season, round, series) {
  const team1 = series.matchupTeams[0].team;
  const team2 = series.matchupTeams[1].team;
  const team1LogoUrl = await getLogoUrl(season, team1.id);
  const team2LogoUrl = await getLogoUrl(season, team2.id);

  return [
    parseInt(season.toString() + round.number.toString() + series.seriesNumber.toString()),
    season,
    round.number,
    round.names?.name,
    series.seriesNumber,
    team1.id,
    team1.name,
    team1.teamName,
    team1.abbreviation,
    team1LogoUrl,
    team2.id,
    team2.name,
    team2.teamName,
    team2.abbreviation,
    team2LogoUrl,
    series.currentGame?.seriesSummary?.seriesStatus,
    series.currentGame?.seriesSummary?.seriesStatusShort
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
        playoffSeriesValues.push(await extractPlayoffSeriesData(validSeasons[i], round, series));
      }
    }
  }

  return playoffSeriesValues;
}