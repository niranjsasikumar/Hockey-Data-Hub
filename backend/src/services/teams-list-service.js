import { fetchDataFromNHLApi } from "../utils/utils.js";
import pool from "../database/database.js";

export default async function getTeamsList(season) {
  if (season === "current") return await getCurrentTeams();
  return await getTeams(season);
}

async function getCurrentTeams() {
  const teamsData = (await fetchDataFromNHLApi("/teams")).teams;
  const teams = teamsData.map(({ id, name }) => ({ id, name }));
  return teams.sort((a, b) => a.name.localeCompare(b.name));
}

async function getTeams(season) {
  return (await pool.query(
    `SELECT teamId AS id, team AS name FROM standings
    WHERE season = ${season}
    ORDER BY name ASC`
  ))[0];
}