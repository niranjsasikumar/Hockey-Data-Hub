import mysql from "mysql";

const db = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: process.argv[2],
  password: process.argv[3],
  database: "nhl_data_hub"
});

const currentSeason = 20232024;
const currentSeasonYear = 2023;

async function fetchData(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

async function insertTeamsData() {
  console.log("Start inserting into \"teams\" table");
  
  const data = await fetchData("https://statsapi.web.nhl.com/api/v1/teams");

  const statement = `INSERT INTO teams (ID, Name, LocationName, TeamName, Abbreviation, LightLogoURL, DarkLogoURL, VenueName, VenueCity, FirstYearOfPlay, Conference, Division)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  for (const team of data.teams) {
    const values = [
      team.id,
      team.name,
      team.locationName,
      team.teamName,
      team.abbreviation,
      "https://www-league.nhlstatic.com/images/logos/teams-" + currentSeason +"-light/" + team.id + ".svg",
      "https://www-league.nhlstatic.com/images/logos/teams-" + currentSeason +"-dark/" + team.id + ".svg",
      team.venue?.name,
      team.venue?.city,
      team.firstYearOfPlay,
      team.conference?.name,
      team.division?.name
    ];

    db.query(statement, values);
  }

  console.log("Finished inserting into \"teams\" table\n");
}

await insertTeamsData();
db.end();