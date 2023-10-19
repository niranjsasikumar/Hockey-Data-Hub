import { getLogoUrl, fetchDataFromApi } from "./api.js";

/* Convert standings data from NHL API for the given seasons to rows of values
to insert into "standings" table */
export async function getStandingsValues(seasons) {
  const standingsData = await getStandingsData(seasons);
  const standingsValues = [];

  for (const season of standingsData) {
    for (const division of season.records) {
      for (const team of division.teamRecords) {
        standingsValues.push(await extractStandingsData(division, team));
      }
    }
  }

  return standingsValues;
}

// Get standings data for the given seasons from NHL API
export async function getStandingsData(seasons) {
  const standingsDataPromises = seasons.map(
    season => fetchDataFromApi(
      "/standings?expand=standings.record,standings.team&season=" + season
    )
  );
  return await Promise.all(standingsDataPromises);
}

// Returns a row of values to insert into "standings" table
export async function extractStandingsData(division, team) {
  const { season } = division;
  const { id, name, teamName, abbreviation } = team.team;
  const teamLogoUrl = await getLogoUrl(season, id);

  return [
    parseInt(season.toString() + id.toString()),
    id,
    name,
    teamName,
    abbreviation,
    season,
    teamLogoUrl,
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
    season >= 19992000 ? team.leagueRecord?.ot : null,
    team.goalsScored,
    team.goalsAgainst,
    team.goalsScored - team.goalsAgainst,
    getRecordString(team.records?.overallRecords[0]),
    getRecordString(team.records?.overallRecords[1]),
    getRecordString(team.records?.overallRecords[3]),
    team.streak?.streakCode
  ];
}

// Returns a formatted string given a record object from standings data
export function getRecordString(record) {
  return (
    record.wins + "-" + record.losses
    + ("ties" in record ? "-" + record.ties : "")
    + ("ot" in record ? "-" + record.ot : "")
  );
}