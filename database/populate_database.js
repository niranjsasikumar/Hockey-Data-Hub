import mysql from "mysql";
import dotenv from "dotenv";
dotenv.config();

const API_BASE_URL = "https://statsapi.web.nhl.com/api/v1";
const currentSeason = 20232024;
const currentSeasonYear = 2023;

const seasons = [];
for (let year = 1917; year < currentSeasonYear; year++) {
  if (year === 2004) continue; // Season not played due to labour lockout
  const season = parseInt(year.toString() + (year+1).toString());
  seasons.push(season);
}

// Seasons to consider for playoffs data, the seasons that are not included are due to missing or inconsistent data
const playoffsDataSeasons = seasons.filter((season) => (season >= 19421943 && season <= 19721973) || season >= 19811982);

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

// Fetch data from the given URL
async function fetchDataFromAPI(endpoint) {
  const response = await fetch(API_BASE_URL + endpoint);
  const data = await response.json();
  return data;
}

// Insert a row into the specified table, the column names are given as an array of strings and the values to insert in each column are also given as an array
function insertIntoTable(table, columns, values) {
  try {
    if (columns.length !== values.length)
      throw new Error("Length of columns and values arguments not equal");
    if (columns.length === 0)
      throw new Error("Columns and values arguments must have length of at least 1");
  } catch(error) {
    console.error(error);
  }

  let insert = "INSERT INTO " + table + " (" + (columns.map(column => "\`" + column + "\`")).toString() + ")";
  let vals = " VALUES (" + (values.map(value => "?")).toString() + ")";
  let update = " ON DUPLICATE KEY UPDATE " + (columns.slice(1).map(column => "\`" + column + "\`=VALUES(\`" + column + "\`)")).toString();

  connection.query(insert + vals + update, values);
}

// Fetch data of current teams from NHL API and overwrite the data in "teams" table
async function updateTeamsData() {
  console.log("Start overwriting \"teams\" table");

  connection.query("DELETE FROM teams");
  const teamsData = (await fetchDataFromAPI("/teams")).teams;

  const columns = ["ID", "Name", "LocationName", "TeamName", "Abbreviation", "LightLogoURL", "DarkLogoURL", "VenueName", "VenueCity", "FirstYearOfPlay", "Conference", "Division"];

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

    insertIntoTable("teams", columns, values);
  }

  console.log("Finished overwriting \"teams\" table");
}

// Fetch data for the given seasons from NHL API and insert or update the data in "seasons" table
async function insertSeasonData(seasons) {
  console.log("Start inserting into / updating \"seasons\" table");

  const seasonsData = (await fetchDataFromAPI("/seasons?season=" + seasons)).seasons;

  const columns = ["ID", "RegularSeasonStartDate", "RegularSeasonEndDate", "SeasonEndDate", "NumberOfGames", "TiesInUse", "ConferencesInUse", "DivisionsInUse", "WildCardInUse", "Conferences", "Divisions", "PlayoffRounds"];

  for (const season of seasonsData) {
    const standingsData = (await fetchDataFromAPI("/standings?season=" + season.seasonId)).records;

    const conferences = new Set();
    const divisions = [];
    const playoffRounds = [];

    if (standingsData.length > 1) {
      for (const division of standingsData) {
        divisions.push(division.division?.name);
        if ("conference" in division) conferences.add(division.conference?.name);
      }
    }

    if (playoffsDataSeasons.includes(season)) {
      const playoffsData = await fetchDataFromAPI("/tournaments/playoffs?season=" + season.seasonId);
      if ("rounds" in playoffsData) playoffsData.rounds.forEach((round) => playoffRounds.push(round.names?.name));
    }

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

    insertIntoTable("seasons", columns, values);
  }

  console.log("Finished inserting into / updating \"seasons\" table");
}

// Fetch playoff series data for the given seasons from NHL API and insert or update the data in "playoff_series" table
async function insertPlayoffSeriesData(seasons) {
  console.log("Start inserting into / updating \"playoff_series\" table");

  const columns = ["ID", "Season", "RoundID", "Round", "SeriesID", "Team1ID", "Team1Name", "Team1LogoURL", "Team2ID", "Team2Name", "Team2LogoURL", "SeriesStatus"];

  for (const season of seasons) {
    if (playoffsDataSeasons.includes(season)) {
      const playoffsData = await fetchDataFromAPI("/tournaments/playoffs?expand=round.series,schedule.game.seriesSummary&season=" + season);
      if (!("rounds" in playoffsData)) continue;

      for (const round of playoffsData.rounds) {
        for (const series of round.series) {
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

          insertIntoTable("playoff_series", columns, values);
        }
      }
    }
  }

  console.log("Finished inserting into / updating \"playoff_series\" table");
}

// Returns a formatted string given a record object from standings data
function getRecordString(record) {
  return record.wins + "-" + record.losses + ("ties" in record ? "-" + record.ties : "") + ("ot" in record ? "-" + record.ot : "");
}

// Fetch standings data for the given seasons from NHL API and insert or update the data in "standings" table
async function insertStandingsData(seasons) {
  console.log("Start inserting into / updating \"standings\" table");

  const columns = ["ID", "TeamID", "Team", "Season", "LogoURL", "Conference", "Division", "ClinchIndicator", "Rank", "Points", "GamesPlayed", "Wins", "Losses", "Ties", "OvertimeLosses", "GoalsFor", "GoalsAgainst", "Difference", "HomeRecord", "AwayRecord", "Last10", "Streak"];

  for (const season of seasons) {
    const standingsData = (await fetchDataFromAPI("/standings?expand=standings.record&season=" + season)).records;

    for (const division of standingsData) {
      for (const team of division.teamRecords) {
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

        insertIntoTable("standings", columns, values);
      }
    }
  }

  console.log("Finished inserting into / updating \"standings\" table");
}

// Fetch player data for the given seasons from NHL API and insert or update the data in "skaters" and "goalies" tables
async function insertPlayerData(seasons) {
  console.log("Start inserting into / updating \"skaters\" and \"goalies\" tables");

  for (const season of seasons) {
    const teamsData = (await fetchDataFromAPI("/teams?expand=team.roster,roster.person&season=" + season)).teams;

    for (const team of teamsData) {
      if (!("roster" in team)) continue;

      for (const player of team.roster?.roster) {
        let playerStats = (await fetchDataFromAPI("/people/" + player.person?.id + "/stats?stats=statsSingleSeason&season=" + season)).stats[0].splits;
        let hasStats = true;

        playerStats.length === 0 ? hasStats = false : playerStats = playerStats[0].stat;

        let table;
        let columns;
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
          table = "goalies";
          columns = ["ID", "PlayerID", "Player", "TeamID", "Team", "Season", "ImageURL", "TeamLogoURL", "Number", "Captain", "AlternateCaptain", "Catches", "Nationality", "DateOfBirth", "Height", "Weight", "GamesPlayed", "ShotsAgainst", "GoalsAgainst", "Saves", "SavePercentage", "GoalsAgainstAverage", "Shutouts"];

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
          table = "skaters";
          columns = ["ID", "PlayerID", "Player", "TeamID", "Team", "Season", "ImageURL", "TeamLogoURL", "Number", "Position", "PositionType", "Captain", "AlternateCaptain", "Shoots", "Nationality", "DateOfBirth", "Height", "Weight", "GamesPlayed", "Goals", "Assists", "Points", "PointsPerGamesPlayed", "PowerPlayGoals", "PowerPlayPoints", "Shots", "ShootingPercentage", "FaceoffPercentage"];

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

        insertIntoTable(table, columns, values);
      }
    }
  }

  console.log("Finished inserting into / updating \"skaters\" and \"goalies\" tables");
}

// Fetch game data for the given seasons from NHL API and insert or update the data in "games" table
async function insertGameData(seasons) {
  console.log("Start inserting into / updating \"games\" table");

  const columns = ["ID", "Season", "Type", "DateTime", "LastPeriod", "GameStatus", "VenueName", "PlayoffRound", "PlayoffSeriesID", "PlayoffGameNumber", "AwayID", "AwayName", "AwayAbbreviation", "AwayLogoURL", "AwayGoals", "AwayGoalScorers", "HomeID", "HomeName", "HomeAbbreviation", "HomeLogoURL", "HomeGoals", "HomeGoalScorers"];

  for (const season of seasons) {
    const monthlyData = [];
    const additionalExpand = playoffsDataSeasons.includes(season) ? ",series.round" : "";
    let startYear = parseInt(season.toString().slice(0, 4));
    let startMonth = 8;
    let startDay = "-01";
    let endYear = startYear;
    let endMonth = startMonth + 1;
    let endDay = "-01";

    // Fetch data in chunks instead of for whole season to prevent 504 timeout error
    while (startMonth !== 8 || endDay !== "-31") {
      monthlyData.push(
        (await fetchDataFromAPI(
          "/schedule?expand=schedule.teams,schedule.scoringplays,schedule.linescore,schedule.game.seriesSummary,seriesSummary.series" +
          additionalExpand +
          "&startDate=" + startYear + "-" + (startMonth < 10 ? 0 : "") + startMonth + startDay +
          "&endDate=" + endYear + "-" + (endMonth < 10 ? 0 : "") + endMonth + endDay
        )).dates
      );

      if (startMonth === 8) startDay = "-02";

      if (startMonth === 12) {
        startMonth = 1;
        startYear++;
      } else {
        startMonth++;
      }

      if (endMonth === 12) {
        endMonth = 1;
        endYear++;
      } else if (endMonth === 7) {
        endDay = "-31";
      } else {
        endMonth++;
      }
    }

    for (const month of monthlyData) {
      for (const date of month) {
        for (const game of date.games) {
          if (!playoffsDataSeasons.includes(season) && game.gameType === "P") continue;
          if (game.linescore?.currentPeriodOrdinal === undefined) continue;

          let awayId = game.teams?.away?.team?.id;
          let awayGoalScorers = "";
          let homeGoalScorers = "";

          for (const goal of game.scoringPlays) {
            for (const player of goal.players) {
              if (player.playerType === "Scorer") {
                const playerName = player.player?.fullName;
                if (goal.team?.id === awayId) {
                  awayGoalScorers += awayGoalScorers === "" ? playerName : " | " + playerName;
                } else {
                  homeGoalScorers += homeGoalScorers === "" ? playerName : " | " + playerName;
                }
                break;
              }
            }

            const goalInfo = " (" + goal.about?.ordinalNum + ", " + goal.about?.periodTime + ")";
            goal.team?.id === awayId ? awayGoalScorers += goalInfo : homeGoalScorers += goalInfo;
          }

          if (awayGoalScorers === "") awayGoalScorers = game.teams?.away?.score > 0 ? "Goal scorer information not available" : "No goals";
          if (homeGoalScorers === "") homeGoalScorers = game.teams?.home?.score > 0 ? "Goal scorer information not available" : "No goals";

          const values = [
            game.gamePk,
            season,
            game.gameType,
            game.gameDate.slice(0, 19).replace("T", " "),
            game.linescore?.currentPeriodOrdinal,
            game.linescore?.currentPeriodOrdinal === "3rd" ? "Final" : "Final/" + game.linescore?.currentPeriodOrdinal,
            game.venue?.name,
            game.seriesSummary?.series?.round?.names?.name,
            "seriesSummary" in game ? parseInt(season.toString() + game.seriesSummary?.series?.round?.number.toString() + game.seriesSummary?.series?.seriesNumber.toString()) : null,
            game.seriesSummary?.gameLabel,
            awayId,
            game.teams?.away?.team?.name,
            game.teams?.away?.team?.abbreviation,
            "https://www-league.nhlstatic.com/images/logos/teams-" + season +"-light/" + awayId + ".svg",
            game.teams?.away?.score,
            awayGoalScorers,
            game.teams?.home?.team?.id,
            game.teams?.home?.team?.name,
            game.teams?.home?.team?.abbreviation,
            "https://www-league.nhlstatic.com/images/logos/teams-" + season +"-light/" + game.teams?.home?.team?.id + ".svg",
            game.teams?.home?.score,
            homeGoalScorers,
          ];

          insertIntoTable("games", columns, values);
        }
      }
    }
  }

  console.log("Finished inserting into / updating \"games\" table");
}

await updateTeamsData();
await insertSeasonData(seasons);
await insertPlayoffSeriesData(seasons);
await insertStandingsData(seasons);
await insertPlayerData(seasons);
await insertGameData(seasons);
connection.end();