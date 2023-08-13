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
const playoffsDataSeasons = seasons.filter(
  season => (season >= 19421943 && season <= 19721973) || season >= 19811982
);

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

// Column names of each table
const teamsColumns = [];
const seasonsColumns = [];
const playoffSeriesColumns = [];
const standingsColumns = [];
const goaliesColumns = [];
const skatersColumns = [];
const gamesColumns = [];

const tableColumns = [
  ["teams", teamsColumns],
  ["seasons", seasonsColumns],
  ["playoff_series", playoffSeriesColumns],
  ["standings", standingsColumns],
  ["goalies", goaliesColumns],
  ["skaters", skatersColumns],
  ["games", gamesColumns]
];

// Get column names of each table from database
for (const table of tableColumns) {
  await new Promise((resolve, reject) => {
    connection.query("SHOW COLUMNS FROM " + table[0], (error, rows) => {
      if (error) return reject(error);
      rows.forEach(row => table[1].push(row.Field));
      resolve(rows);
    })
  });
}

// Fetch data from the given URL
async function fetchDataFromApi(endpoint) {
  const response = await fetch(API_BASE_URL + endpoint);
  const data = await response.json();
  return data;
}

// Insert the given rows into the specified table, the column names are given as an array of strings and the rows to insert is an array containing arrays of values
function insertIntoTable(table, columns, rows) {
  if (rows.length === 0) return;
  const statement = "REPLACE INTO " + table + " (`" + columns.join("`, `") + "`) VALUES ?";
  connection.query(statement, [rows], error => {
    if (error) throw error
  });
}

// Get the URL of the logo a team used during a given season
function getLogoUrl(season, teamId) {
  return "https://www-league.nhlstatic.com/images/logos/teams-" + season + "-light/" + teamId + ".svg";
}

// Returns a row of values to insert into "teams" table
function extractTeamData(team) {
  return [
    team.id,
    team.name,
    team.locationName,
    team.teamName,
    team.abbreviation,
    getLogoUrl(currentSeason, team.id),
    team.venue?.name,
    team.venue?.city,
    team.firstYearOfPlay,
    team.conference?.name,
    team.division?.name,
    null
  ];
}

// Convert data of current teams from NHL API to rows of values to insert into "teams" table
async function getTeamValues() {
  const teamsData = (await fetchDataFromApi("/teams")).teams;
  const teamValues = [];

  for (const team of teamsData) {
    teamValues.push(extractTeamData(team));
  }

  return teamValues;
}

// Overwrite the data in "teams" table
async function updateTeamsData() {
  console.log("Start overwriting \"teams\" table");
  connection.query("DELETE FROM teams");
  const teamValues = await getTeamValues();
  insertIntoTable("teams", teamsColumns, teamValues);
  console.log("Finished overwriting \"teams\" table");
}

// Get the names of the conferences, divisions, and playoff rounds for the given season
async function getSeasonStructure(season) {
  const standingsData = (await fetchDataFromApi("/standings?season=" + season)).records;

  const conferences = new Set();
  const divisions = [];
  const playoffRounds = [];

  if (standingsData.length > 1) {
    for (const division of standingsData) {
      divisions.push(division.division?.name);
      if ("conference" in division) {
        conferences.add(division.conference?.name);
      }
    }
  }

  if (playoffsDataSeasons.includes(season)) {
    const playoffsData = await fetchDataFromApi("/tournaments/playoffs?season=" + season);
    if ("rounds" in playoffsData) {
      playoffsData.rounds.forEach((round) => playoffRounds.push(round.names?.name));
    }
  }

  return [Array.from(conferences).toString(), divisions.toString(), playoffRounds.toString()];
}

// Returns a row of values to insert into "seasons" table
async function extractSeasonData(season) {
  const [conferences, divisions, playoffRounds] = await getSeasonStructure(parseInt(season.seasonId));

  return [
    season.seasonId,
    season.regularSeasonStartDate,
    season.regularSeasonEndDate,
    season.seasonEndDate,
    season.numberOfGames,
    season.tiesInUse,
    season.conferencesInUse,
    season.divisionsInUse,
    season.wildCardInUse,
    conferences,
    divisions,
    playoffRounds
  ];
}

// Convert data of given seasons from NHL API to rows of values to insert into "seasons" table
async function getSeasonValues(seasons) {
  const seasonsData = (await fetchDataFromApi("/seasons?season=" + seasons)).seasons;
  const seasonValues = [];

  for (const season of seasonsData) {
    seasonValues.push(await extractSeasonData(season));
  }

  return seasonValues;
}

// Insert or update data in "seasons" table
async function insertSeasonData(seasons) {
  console.log("Start inserting into / updating \"seasons\" table");
  const seasonValues = await getSeasonValues(seasons);
  insertIntoTable("seasons", seasonsColumns, seasonValues);
  console.log("Finished inserting into / updating \"seasons\" table");
}

// Returns whether the season has valid playoffs data
function hasPlayoffsData(season) {
  return playoffsDataSeasons.includes(season);
}

// Returns a row of values to insert into "playoff_series" table
function extractPlayoffSeriesData(season, round, series) {
  return [
    parseInt(season.toString() + round.number.toString() + series.seriesNumber.toString()),
    season,
    round.number,
    round.names?.name,
    series.seriesNumber,
    series.matchupTeams[0].team?.id,
    series.matchupTeams[0].team?.name,
    getLogoUrl(season, series.matchupTeams[0].team?.id),
    series.matchupTeams[1].team?.id,
    series.matchupTeams[1].team?.name,
    getLogoUrl(season, series.matchupTeams[1].team?.id),
    series.currentGame?.seriesSummary?.seriesStatus
  ];
}

// Convert playoff series data for the given seasons from NHL API to rows of values to insert into "playoff_series" table
async function getPlayoffSeriesValues(seasons) {
  const playoffSeriesValues = [];

  for (const season of seasons.filter(hasPlayoffsData)) {
    const playoffsData = (await fetchDataFromApi("/tournaments/playoffs?expand=round.series,schedule.game.seriesSummary&season=" + season)).rounds;

    for (const round of playoffsData) {
      for (const series of round.series) {
        playoffSeriesValues.push(extractPlayoffSeriesData(season, round, series));
      }
    }
  }

  return playoffSeriesValues;
}

// Insert or update data in "playoff_series" table
async function insertPlayoffSeriesData(seasons) {
  console.log("Start inserting into / updating \"playoff_series\" table");
  const playoffSeriesValues = await getPlayoffSeriesValues(seasons);
  insertIntoTable("playoff_series", playoffSeriesColumns, playoffSeriesValues);
  console.log("Finished inserting into / updating \"playoff_series\" table");
}

// Returns a formatted string given a record object from standings data
function getRecordString(record) {
  return record.wins + "-" + record.losses + ("ties" in record ? "-" + record.ties : "") + ("ot" in record ? "-" + record.ot : "");
}

// Returns a row of values to insert into "standings" table
function extractStandingsData(season, division, team) {
  return [
    parseInt(season.toString() + team.team?.id.toString()),
    team.team?.id,
    team.team?.name,
    season,
    getLogoUrl(season, team.team?.id),
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
}

// Convert standings data for the given seasons from NHL API to rows of values to insert into "standings" table
async function getStandingsValues(seasons) {
  const standingsValues = [];

  for (const season of seasons) {
    const standingsData = (await fetchDataFromApi("/standings?expand=standings.record&season=" + season)).records;

    for (const division of standingsData) {
      for (const team of division.teamRecords) {
        standingsValues.push(extractStandingsData(season, division, team));
      }
    }
  }

  return standingsValues;
}

// Insert or update data in "standings" table
async function insertStandingsData(seasons) {
  console.log("Start inserting into / updating \"standings\" table");
  const standingsValues = await getStandingsValues(seasons);
  insertIntoTable("standings", standingsColumns, standingsValues);
  console.log("Finished inserting into / updating \"standings\" table");
}

function getPlayerImageUrl(playerId) {
  return "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/" + playerId + ".jpg";
}

// Returns common values that can be inserted into either "skaters" or "goalies" tables
function extractPlayerData(season, team, player) {
  return [
    parseInt(season.toString() + team.id.toString() + player.person?.id.toString()),
    player.person?.id,
    player.person?.fullName,
    team.id,
    team.name,
    season,
    getPlayerImageUrl(player.person?.id),
    getLogoUrl(season, team.id),
    player.jerseyNumber,
    player.person?.captain,
    player.person?.alternateCaptain,
    player.person?.shootsCatches,
    player.person?.nationality,
    player.person?.birthDate,
    player.person?.height,
    player.person?.weight
  ];
}

// Returns a row of values to insert into "goalies" table
function extractGoalieData(season, team, player, hasStats, playerStats) {
  const values = extractPlayerData(season, team, player);

  if (hasStats) {
    values.push(hasStats ? playerStats.games : null);
    values.push(playerStats.shotsAgainst);
    values.push(playerStats.goalsAgainst);
    values.push(playerStats.saves);
    values.push(playerStats.savePercentage);
    values.push(playerStats.goalAgainstAverage);
    values.push(playerStats.shutouts);
  } else {
    for (let i = 0; i < 7; i++) values.push(null);
  }

  return values;
}

// Returns a row of values to insert into "skaters" table
function extractSkaterData(season, team, player, hasStats, playerStats) {
  const values = extractPlayerData(season, team, player);
  values.splice(9, 0, player.position?.abbreviation, player.position?.type);
          
  if (hasStats) {
    values.push(hasStats ? playerStats.games : null);
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
    for (let i = 0; i < 10; i++) values.push(null);
  }

  return values;
}

// Convert player data for the given seasons from NHL API to rows of values to insert into "skaters" and "goalies" tables
async function getPlayerValues(seasons) {
  const skaterValues = [];
  const goalieValues = [];

  for (const season of seasons) {
    const teamsData = (await fetchDataFromApi("/teams?expand=team.roster,roster.person&season=" + season)).teams;

    for (const team of teamsData) {
      if (!("roster" in team)) continue;

      for (const player of team.roster?.roster) {
        let playerStats = (await fetchDataFromApi("/people/" + player.person?.id + "/stats?stats=statsSingleSeason&season=" + season)).stats[0].splits;
        let hasStats = true;
        playerStats.length === 0 ? hasStats = false : playerStats = playerStats[0].stat;

        if (player.position?.type === "Goalie") {
          goalieValues.push(extractGoalieData(season, team, player, hasStats, playerStats));
        } else {
          skaterValues.push(extractSkaterData(season, team, player, hasStats, playerStats));
        }
      }
    }
  }

  return [skaterValues, goalieValues];
}

// Insert or update data in "skaters" and "goalies" tables
async function insertPlayerData(seasons) {
  console.log("Start inserting into / updating \"skaters\" and \"goalies\" tables");
  const [skaterValues, goalieValues] = await getPlayerValues(seasons);
  insertIntoTable("skaters", skatersColumns, skaterValues);
  insertIntoTable("goalies", goaliesColumns, goalieValues);
  console.log("Finished inserting into / updating \"skaters\" and \"goalies\" tables");
}

// Get the games schedule for a season
async function getSeasonSchedule(season) {
  let scheduleData = [];
  const playoffsExpand = playoffsDataSeasons.includes(season) ? ",series.round" : "";
  let startYear = parseInt(season.toString().slice(0, 4));
  let startMonth = 8;
  let startDay = "-01";
  let endYear = startYear;
  let endMonth = startMonth + 1;
  let endDay = "-01";

  // Fetch data in chunks instead of for whole season to prevent timeout error
  while (startMonth !== 8 || endDay !== "-31") {
    scheduleData = scheduleData.concat(
      (await fetchDataFromApi(
        "/schedule?expand=schedule.teams,schedule.scoringplays,schedule.linescore,schedule.game.seriesSummary,seriesSummary.series" +
        playoffsExpand +
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

  return scheduleData;
}

// Get goal scorer information for the away and home sides in a game
function getGoalScorers(game) {
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

  if (awayGoalScorers === "") {
    awayGoalScorers = game.teams?.away?.score > 0 ? "Goal scorer information not available" : "No goals";
  }

  if (homeGoalScorers === "") {
    homeGoalScorers = game.teams?.home?.score > 0 ? "Goal scorer information not available" : "No goals";
  }

  return [awayGoalScorers, homeGoalScorers];
}

// Returns a row of values to insert into "games" table
function extractGameData(season, game) {
  const [awayGoalScorers, homeGoalScorers] = getGoalScorers(game);
  const currentPeriod = game.linescore?.currentPeriodOrdinal;
  const series = game.seriesSummary?.series;
  const { away, home } = game.teams;

  return [
    game.gamePk,
    season,
    game.gameType,
    game.gameDate.slice(0, 19).replace("T", " "),
    currentPeriod,
    currentPeriod === "3rd" ? "Final" : "Final/" + currentPeriod,
    game.venue?.name,
    "seriesSummary" in game ? series.round?.names?.name : null,
    "seriesSummary" in game ? parseInt(season.toString() + series.round?.number.toString() + series.seriesNumber.toString()) : null,
    game.seriesSummary?.gameLabel,
    away.team?.id,
    away.team?.name,
    away.team?.abbreviation,
    getLogoUrl(season, away.team?.id),
    away.score,
    awayGoalScorers,
    home.team?.id,
    home.team?.name,
    home.team?.abbreviation,
    getLogoUrl(season, home.team?.id),
    home.score,
    homeGoalScorers
  ];
}

// Convert game data for the given seasons from NHL API to rows of values to insert into "games" table
async function getGameValues(seasons) {
  const gameValues = [];

  for (const season of seasons) {
    console.log(season)
    const scheduleData = await getSeasonSchedule(season);

    for (const date of scheduleData) {
      for (const game of date.games) {
        if (!playoffsDataSeasons.includes(season) && game.gameType === "P") continue;
        if (game.linescore?.currentPeriodOrdinal === undefined) continue;
        gameValues.push(extractGameData(season, game));
      }
    }
  }

  return gameValues;
}

// Insert or update data in "games" table
async function insertGameData(seasons) {
  console.log("Start inserting into / updating \"games\" table");
  const gameValues = await getGameValues(seasons);
  insertIntoTable("games", gamesColumns, gameValues);
  console.log("Finished inserting into / updating \"games\" table");
}

await updateTeamsData();
await insertSeasonData(seasons);
await insertPlayoffSeriesData(seasons);
await insertStandingsData(seasons);
await insertPlayerData(seasons);
await insertGameData(seasons);
connection.end();