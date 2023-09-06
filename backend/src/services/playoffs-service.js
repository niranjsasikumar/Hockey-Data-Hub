import connection from "../database/database.js";

export default async function getPlayoffs(season) {
  const playoffRounds = (await connection.query(
    `SELECT playoffRounds FROM seasons
    WHERE id = ${season}`
  ))[0][0].playoffRounds;

  if (playoffRounds === null) return [];

  const playoffs = [];

  for (const round of playoffRounds.split(",")) {
    const [series] = await connection.query(
      `SELECT ${queryColumns} FROM playoff_series
      WHERE season = ${season} AND round = "${round}"`
    );

    playoffs.push({
      round: round,
      series: series
    });
  }

  return playoffs;
}

const queryColumns = [
  "id",
  "team1Id",
  "team1Abbreviation",
  "team1LogoURL",
  "team2Id",
  "team2Abbreviation",
  "team2LogoURL",
  "statusShort"
];