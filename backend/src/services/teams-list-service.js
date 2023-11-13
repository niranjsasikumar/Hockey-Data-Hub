import { getCurrentSeason } from "../utils/utils.js";
import { fetchDataFromNHLApi } from "../utils/nhl-api.js";
import pool from "../database/database.js";

export default async function getTeamsList(season) {
  if (season === "current") return await getCurrentTeams();
  return await getTeams(season);
}

export async function getCurrentTeams() {
  const season = await getCurrentSeason();
  const teamsData = (await fetchDataFromNHLApi(
    `/team/summary?factCayenneExp=seasonId=${season}&sort=teamFullName`, true
  )).data;

  const teams = teamsData.map(({ teamId, teamFullName }) => (
    { id: teamId, name: teamFullName }
  ));
  return teams;
}

export async function getTeams(season) {
  return (await pool.query(
    `SELECT teamId AS id, team AS name FROM standings
    WHERE season = ${season}
    ORDER BY name ASC`
  ))[0];
}