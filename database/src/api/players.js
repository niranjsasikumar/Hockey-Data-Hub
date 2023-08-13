import { getLogoUrl, fetchDataFromApi } from "./api.js";

function getPlayerImageUrl(playerId) {
  return "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/" + playerId + ".jpg";
}

// Returns player values that can be inserted into either "skaters" or "goalies" tables
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

// Convert player data from NHL API for the given seasons to rows of values to insert into "skaters" and "goalies" tables
export async function getPlayerValues(seasons) {
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