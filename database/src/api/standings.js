import { getLogoUrl, fetchDataFromApi } from "./api.js";

// Get standings data for the given seasons from NHL API
async function getStandingsData(seasons) {
  const standingsDataPromises = seasons.map(
    season => fetchDataFromApi("/standings?expand=standings.record,standings.team&season=" + season)
  );
  return await Promise.all(standingsDataPromises);
}

// Returns a formatted string given a record object from standings data
function getRecordString(record) {
  return record.wins + "-" + record.losses + ("ties" in record ? "-" + record.ties : "") + ("ot" in record ? "-" + record.ot : "");
}

// Returns a row of values to insert into "standings" table
function extractStandingsData(division, team) {
  const { id, name, teamName, abbreviation } = team.team;

  return [
    parseInt(division.season.toString() + id.toString()),
    id,
    name,
    teamName,
    abbreviation,
    division.season,
    getLogoUrl(division.season, id),
    division.conference?.name ? division.conference?.name : null,
    division.division?.name ? division.division?.name : null,
    team.clinchIndicator,
    team.divisionRank === "0" ? null : team.divisionRank,
    team.leagueRank,
    team.points,
    team.gamesPlayed,
    team.leagueRecord?.wins,
    team.leagueRecord?.losses,
    team.leagueRecord?.ties,
    team.leagueRecord?.ot,
    team.goalsScored,
    team.goalsAgainst,
    team.goalsScored - team.goalsAgainst,
    getRecordString(team.records?.overallRecords[0]),
    getRecordString(team.records?.overallRecords[1]),
    getRecordString(team.records?.overallRecords[3]),
    team.streak?.streakCode
  ];
}

// Convert standings data from NHL API for the given seasons to rows of values to insert into "standings" table
export async function getStandingsValues(seasons) {
  const standingsData = await getStandingsData(seasons);
  const standingsValues = [];

  for (const season of standingsData) {
    for (const division of season.records) {
      for (const team of division.teamRecords) {
        standingsValues.push(extractStandingsData(division, team));
      }
    }
  }

  return standingsValues;
}