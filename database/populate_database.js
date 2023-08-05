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
            round.names?.name,
            series.seriesNumber,
            series.matchupTeams[0].team?.id,
            series.matchupTeams[0].team?.name,
            "https://www-league.nhlstatic.com/images/logos/teams-" + season +"-light/" + series.matchupTeams[0].team?.id + ".svg",
            series.matchupTeams[1].team?.id,
            series.matchupTeams[1].team?.name,
            "https://www-league.nhlstatic.com/images/logos/teams-" + season +"-light/" + series.matchupTeams[1].team?.id + ".svg",
            series.currentGame?.seriesSummary?.seriesStatus
          ];

          connection.query(statement, values);
        }
      }
    }
  }

  console.log("Finished inserting into / updating \"playoff_series\" table");
}

// Returns a formatted string given a record object
function getRecordString(record) {
  return record.wins + "-" + record.losses + ("ties" in record ? "-" + record.ties : "") + ("ot" in record ? "-" + record.ot : "");
}

// Fetch standings data for the given seasons from NHL API and insert or update the data in "standings" table
async function insertStandingsData(seasons) {
  console.log("Start inserting into / updating \"standings\" table");

  for (const season of seasons) {
    const standingsData = (await fetchData("https://statsapi.web.nhl.com/api/v1/standings?expand=standings.record&season=" + season)).records;

    for (const division of standingsData) {
      for (const team of division.teamRecords) {
        const statement = `INSERT INTO standings (ID, TeamID, Team, Season, LogoURL, Conference, Division, ClinchIndicator, \`Rank\`, Points, GamesPlayed, Wins, Losses, Ties, OvertimeLosses, GoalsFor, GoalsAgainst, Difference, HomeRecord, AwayRecord, Last10, Streak)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE TeamID=VALUES(TeamID), Team=VALUES(Team), Season=VALUES(Season), LogoURL=VALUES(LogoURL), Conference=VALUES(Conference), Division=VALUES(Division), ClinchIndicator=VALUES(ClinchIndicator), \`Rank\`=VALUES(\`Rank\`), Points=VALUES(Points), GamesPlayed=VALUES(GamesPlayed), Wins=VALUES(Wins), Losses=VALUES(Losses), Ties=VALUES(Ties), OvertimeLosses=VALUES(OvertimeLosses), GoalsFor=VALUES(GoalsFor), GoalsAgainst=VALUES(GoalsAgainst), Difference=VALUES(Difference), HomeRecord=VALUES(HomeRecord), AwayRecord=VALUES(AwayRecord), Last10=VALUES(Last10), Streak=VALUES(Streak)`;

        const values = [
          parseInt(season.toString() + team.team?.id.toString()),
          team.team?.id,
          team.team?.name,
          season,
          "https://www-league.nhlstatic.com/images/logos/teams-" + season +"-light/" + team.team?.id + ".svg",
          division.conference?.name,
          division.division?.name,
          team.clinchIndicator,
          parseInt(team.divisionRank) ? parseInt(team.divisionRank) : team.leagueRank,
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

        connection.query(statement, values);
      }
    }
  }

  console.log("Finished inserting into / updating \"standings\" table");
}

// Fetch player data for the given seasons from NHL API and insert or update the data in "skaters" and "goalies" tables
async function insertPlayerData(seasons) {
  console.log("Start inserting into / updating \"skaters\" and \"goalies\" tables");

  for (const season of seasons) {
    const teamsData = (await fetchData("https://statsapi.web.nhl.com/api/v1/teams?expand=team.roster,roster.person&season=" + season)).teams;

    for (const team of teamsData) {
      if (!("roster" in team)) continue;

      for (const player of team.roster?.roster) {
        let playerStats = (await fetchData("https://statsapi.web.nhl.com/api/v1/people/" + player.person?.id + "/stats?stats=statsSingleSeason&season=" + season)).stats[0].splits;
        let hasStats = true;

        playerStats.length === 0 ? hasStats = false : playerStats = playerStats[0].stat;

        let statement = "";
        let values = [
          parseInt(season.toString() + team.id.toString() + player.person?.id.toString()),
          player.person?.id,
          player.person?.fullName,
          team.id,
          team.name,
          season,
          "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/" + player.person?.id + ".jpg",
          "https://www-league.nhlstatic.com/images/logos/teams-" + season +"-light/" + team.id + ".svg",
          player.jerseyNumber,
          player.person?.captain,
          player.person?.alternateCaptain,
          player.person?.shootsCatches,
          player.person?.nationality,
          player.person?.birthDate,
          player.person?.height,
          player.person?.weight,
          hasStats ? playerStats.games : null
        ];

        if (player.position?.type === "Goalie") {
          statement = `INSERT INTO goalies (ID, PlayerID, Player, TeamID, Team, Season, ImageURL, TeamLogoURL, Number, Captain, AlternateCaptain, Catches, Nationality, DateOfBirth, Height, Weight, GamesPlayed, ShotsAgainst, GoalsAgainst, Saves, SavePercentage, GoalsAgainstAverage, Shutouts)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE PlayerID=VALUES(PlayerID), Player=VALUES(Player), TeamID=VALUES(TeamID), Team=VALUES(Team), Season=VALUES(Season), ImageURL=VALUES(ImageURL), TeamLogoURL=VALUES(TeamLogoURL), Number=VALUES(Number), Captain=VALUES(Captain), AlternateCaptain=VALUES(AlternateCaptain), Catches=VALUES(Catches), Nationality=VALUES(Nationality), DateOfBirth=VALUES(DateOfBirth), Height=VALUES(Height), Weight=VALUES(Weight), GamesPlayed=VALUES(GamesPlayed), ShotsAgainst=VALUES(ShotsAgainst), GoalsAgainst=VALUES(GoalsAgainst), Saves=VALUES(Saves), SavePercentage=VALUES(SavePercentage), GoalsAgainstAverage=VALUES(GoalsAgainstAverage), Shutouts=VALUES(Shutouts)`;

          if (hasStats) {
            values.push(playerStats.shotsAgainst);
            values.push(playerStats.goalsAgainst);
            values.push(playerStats.saves);
            values.push(playerStats.savePercentage);
            values.push(playerStats.goalAgainstAverage);
            values.push(playerStats.shutouts);
          } else {
            for (let i = 0; i < 6; i++) values.push(null);
          }
        } else {
          statement = `INSERT INTO skaters (ID, PlayerID, Player, TeamID, Team, Season, ImageURL, TeamLogoURL, Number, Position, PositionType, Captain, AlternateCaptain, Shoots, Nationality, DateOfBirth, Height, Weight, GamesPlayed, Goals, Assists, Points, PointsPerGamesPlayed, PowerPlayGoals, PowerPlayPoints, Shots, ShootingPercentage, FaceoffPercentage)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE PlayerID=VALUES(PlayerID), Player=VALUES(Player), TeamID=VALUES(TeamID), Team=VALUES(Team), Season=VALUES(Season), ImageURL=VALUES(ImageURL), TeamLogoURL=VALUES(TeamLogoURL), Number=VALUES(Number), Position=VALUES(Position), PositionType=VALUES(PositionType), Captain=VALUES(Captain), AlternateCaptain=VALUES(AlternateCaptain), Shoots=VALUES(Shoots), Nationality=VALUES(Nationality), DateOfBirth=VALUES(DateOfBirth), Height=VALUES(Height), Weight=VALUES(Weight), GamesPlayed=VALUES(GamesPlayed), Goals=VALUES(Goals), Assists=VALUES(Assists), Points=VALUES(Points), PointsPerGamesPlayed=VALUES(PointsPerGamesPlayed), PowerPlayGoals=VALUES(PowerPlayGoals), PowerPlayPoints=VALUES(PowerPlayPoints), Shots=VALUES(Shots), ShootingPercentage=VALUES(ShootingPercentage), FaceoffPercentage=VALUES(FaceoffPercentage)`;

          values.splice(9, 0, player.position?.abbreviation, player.position?.type);
          
          if (hasStats) {
            values.push(playerStats.goals);
            values.push(playerStats.assists);
            values.push(playerStats.points);
            values.push((playerStats.points / playerStats.games).toFixed(3));
            values.push(playerStats.powerPlayGoals);
            values.push(playerStats.powerPlayPoints);
            values.push(playerStats.shots);
            values.push(playerStats.shotPct);
            values.push(playerStats.faceOffPct);
          } else {
            for (let i = 0; i < 9; i++) values.push(null);
          }
        }

        connection.query(statement, values);
      }
    }
  }

  console.log("Finished inserting into / updating \"skaters\" and \"goalies\" tables");
}

await insertPlayerData(seasons);
connection.end();