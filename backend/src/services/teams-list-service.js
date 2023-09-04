import connection from "../database/database.js";

export default async function getTeamsList(season) {
  if (season === "current") {
    return await getCurrentTeams();
  }
}

async function getCurrentTeams() {
  const [results] = await connection.query(
    `SELECT id, name FROM teams
    ORDER BY name ASC`
  );

  return results;
}