import mysql from "mysql";

const currentSeason = 20232024;
const currentSeasonYear = 2023;

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: process.argv[2],
  password: process.argv[3],
  database: "nhl_data_hub"
});

// Fetch data from the given NHL API endpoint URL
async function fetchData(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

// Fetch data of current teams from NHL API and update the data in "teams" table in database
async function updateTeamsData() {
  console.log("Start inserting into \"teams\" table");

  connection.query("DELETE FROM teams");
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

    connection.query(statement, values);
  }

  console.log("Finished inserting into \"teams\" table\n");
}

await updateTeamsData();
connection.end();