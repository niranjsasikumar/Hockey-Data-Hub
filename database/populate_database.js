import mysql from "mysql";

const currentSeason = 20232024;
const currentSeasonYear = 2023;

const seasons = [];

for (let year = 1917; year < currentSeasonYear; year++) {
  const season = parseInt(year.toString() + (year+1).toString());
  seasons.push(season);
}

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

// Fetch data of current teams from NHL API and overwrite the data in "teams" table
async function updateTeamsData() {
  console.log("Start overwriting \"teams\" table");

  connection.query("DELETE FROM teams");
  const teamsData = (await fetchData("https://statsapi.web.nhl.com/api/v1/teams")).teams;

  const statement = `INSERT INTO teams (ID, Name, LocationName, TeamName, Abbreviation, LightLogoURL, DarkLogoURL, VenueName, VenueCity, FirstYearOfPlay, Conference, Division)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  for (const team of teamsData) {
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

  console.log("Finished overwriting \"teams\" table\n");
}

// Fetch data for the given seasons from NHL API and insert or update the data in "seasons" table
async function insertSeasonData(seasons) {
  console.log("Start inserting into / updating \"seasons\" table");

  const seasonsData = (await fetchData("https://statsapi.web.nhl.com/api/v1/seasons?season=" + seasons)).seasons;

  for (const season of seasonsData) {
    const standingsData = (await fetchData("https://statsapi.web.nhl.com/api/v1/standings?season=" + season.seasonId)).records;

    const conferences = new Set();
    const divisions = [];
    const playoffRounds = [];

    if (standingsData.length > 1) {
      for (const division of standingsData) {
        divisions.push(division.division?.name);
        if ("conference" in division) conferences.add(division.conference?.name);
      }
    }

    // Only add playoff rounds from the 1942-43 season onwards due to missing or inconsistent data for prior seasons
    if (season.seasonId >= 19421943) {
      const playoffsData = await fetchData("https://statsapi.web.nhl.com/api/v1/tournaments/playoffs?season=" + season.seasonId);
      if ("rounds" in playoffsData) playoffsData.rounds.forEach((round) => playoffRounds.push(round.names?.name));
    }

    const statement = `INSERT INTO seasons (ID, RegularSeasonStartDate, RegularSeasonEndDate, SeasonEndDate, NumberOfGames, TiesInUse, ConferencesInUse, DivisionsInUse, WildCardInUse, Conferences, Divisions, PlayoffRounds)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE RegularSeasonStartDate=VALUES(RegularSeasonStartDate), RegularSeasonEndDate=VALUES(RegularSeasonEndDate), SeasonEndDate=VALUES(SeasonEndDate), NumberOfGames=VALUES(NumberOfGames), TiesInUse=VALUES(TiesInUse), ConferencesInUse=VALUES(ConferencesInUse), DivisionsInUse=VALUES(DivisionsInUse), WildCardInUse=VALUES(WildCardInUse), Conferences=VALUES(Conferences), Divisions=VALUES(Divisions), PlayoffRounds=VALUES(PlayoffRounds)`;

    const values = [
      season.seasonId,
      season.regularSeasonStartDate,
      season.regularSeasonEndDate,
      season.seasonEndDate,
      season.numberOfGames,
      season.tiesInUse,
      season.conferencesInUse,
      season.divisionsInUse,
      season.wildCardInUse,
      Array.from(conferences).toString(),
      divisions.toString(),
      playoffRounds.toString()
    ];

    connection.query(statement, values);
  }

  console.log("Finished inserting into / updating \"seasons\" table");
}

// Fetch playoff series data for the given seasons from NHL API and insert or update the data in "playoff_series" table
async function insertPlayoffSeriesData(seasons) {
  console.log("Start inserting into / updating \"playoff_series\" table");

  for (const season of seasons) {
    // Only consider playoff series from the 1942-43 season onwards due to missing or inconsistent data for prior seasons
    if (season >= 19421943) {
      const playoffsData = await fetchData("https://statsapi.web.nhl.com/api/v1/tournaments/playoffs?expand=round.series,schedule.game.seriesSummary&season=" + season);
      if (!("rounds" in playoffsData)) continue;

      for (const round of playoffsData.rounds) {
        for (const series of round.series) {
          const statement = `INSERT INTO playoff_series (ID, Season, RoundID, Round, SeriesID, Team1ID, Team1Name, Team1LogoURL, Team2ID, Team2Name, Team2LogoURL, SeriesStatus)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE Season=VALUES(Season), RoundID=VALUES(RoundID), Round=VALUES(Round), SeriesID=VALUES(SeriesID), Team1ID=VALUES(Team1ID), Team1Name=VALUES(Team1Name), Team1LogoURL=VALUES(Team1LogoURL), Team2ID=VALUES(Team2ID), Team2Name=VALUES(Team2Name), Team2LogoURL=VALUES(Team2LogoURL), SeriesStatus=VALUES(SeriesStatus)`;

          const values = [
            parseInt(season.toString() + round.number.toString() + series.seriesNumber.toString()),
            season,
            round.number,
            round.names.name,
            series.seriesNumber,
            series.matchupTeams[0].team.id,
            series.matchupTeams[0].team.name,
            "https://www-league.nhlstatic.com/images/logos/teams-" + season +"-light/" + series.matchupTeams[0].team.id + ".svg",
            series.matchupTeams[1].team.id,
            series.matchupTeams[1].team.name,
            "https://www-league.nhlstatic.com/images/logos/teams-" + season +"-light/" + series.matchupTeams[1].team.id + ".svg",
            series.currentGame.seriesSummary.seriesStatus
          ];

          connection.query(statement, values);
        }
      }
    }
  }

  console.log("Finished inserting into / updating \"playoff_series\" table");
}

await insertPlayoffSeriesData(seasons);
connection.end();