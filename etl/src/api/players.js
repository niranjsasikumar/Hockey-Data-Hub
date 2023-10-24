import { getLogoUrl, fetchDataFromApi } from "./api.js";

/* Convert player data from NHL API for the given seasons to rows of values to
insert into "skaters" and "goalies" tables */
export async function getPlayerValues(seasons) {
  const teamData = await getTeamData(seasons);
  const skaterValues = [];
  const goalieValues = [];

  for (let i = 0; i < seasons.length; i++) {
    for (const team of teamData[i].teams) {
      if (!("roster" in team)) continue;

      const roster = team.roster?.roster;
      const playerStatsData = await getPlayerStatsData(roster, seasons[i]);

      for (let j = 0; j < roster.length; j++) {
        const player = roster[j];
        let playerStats = playerStatsData[j].stats[0].splits;
        let hasStats = true;
        
        if (playerStats.length === 0) hasStats = false;
        else playerStats = playerStats[0].stat;

        if (player.position?.type === "Goalie") {
          goalieValues.push(await extractGoalieData(
            seasons[i], team, player, hasStats, playerStats
          ));
        } else {
          skaterValues.push(await extractSkaterData(
            seasons[i], team, player, hasStats, playerStats
          ));
        }
      }
    }
  }

  return [skaterValues, goalieValues];
}

// Get team data for the given seasons from NHL API
export async function getTeamData(seasons) {
  return await Promise.all(seasons.map(season => fetchDataFromApi(
    `/teams?expand=team.roster,roster.person&season=${season}`
  )));
}

// Get player stats for the given team and season from NHL API
export async function getPlayerStatsData(teamRoster, season) {
  return await Promise.all(teamRoster.map(player => fetchDataFromApi(
    `/people/${player.person?.id}/stats`
    + `?stats=statsSingleSeason&season=${season}`
  )));
}

// Returns a row of values to insert into "goalies" table
export async function extractGoalieData(
  season, team, player, hasStats, playerStats
) {
  const values = await extractPlayerData(season, team, player);

  if (hasStats) {
    values.push(playerStats.games);
    values.push(playerStats.gamesStarted);
    values.push(playerStats.wins);
    values.push(playerStats.shotsAgainst);
    values.push(playerStats.goalsAgainst);
    values.push(playerStats.saves);
    values.push(playerStats.savePercentage);
    values.push(playerStats.goalAgainstAverage);
    values.push(playerStats.shutouts);
    values.push(playerStats.timeOnIce);
  } else {
    for (let i = 0; i < 10; i++) values.push(null);
  }

  return values;
}

// Returns a row of values to insert into "skaters" table
export async function extractSkaterData(
  season, team, player, hasStats, playerStats
) {
  const values = await extractPlayerData(season, team, player);
  values.splice(11, 0, player.position?.abbreviation, player.position?.type);
          
  if (hasStats) {
    values.push(playerStats.games);
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

/* Returns player values that can be inserted into either "skaters" or "goalies"
tables */
export async function extractPlayerData(season, team, player) {
  const { person, jerseyNumber } = player;
  const {
    id: playerId,
    fullName,
    captain,
    alternateCaptain,
    shootsCatches,
    nationality,
    birthDate,
    height,
    weight
  } = person;
  const { id: teamId, name, teamName, abbreviation } = team;
  const recordId = parseInt(
    season.toString() + teamId.toString() + playerId.toString()
  );
  const teamLogoUrl = await getLogoUrl(season, teamId);

  return [
    recordId,
    playerId,
    fullName,
    teamId,
    name,
    teamName,
    abbreviation,
    season,
    getPlayerImageUrl(season, abbreviation, playerId),
    teamLogoUrl,
    jerseyNumber,
    captain,
    alternateCaptain,
    shootsCatches,
    nationality,
    birthDate,
    getPlaceOfBirth(person),
    height,
    weight
  ];
}

// Get the URL of a player's headshot image
export function getPlayerImageUrl(season, team, playerId) {
  return (
    `https://assets.nhle.com/mugs/nhl/${season}/${team}/${playerId}.png`
  );
}

// Get the place of birth of a player as a formatted string
export function getPlaceOfBirth(player) {
  let result = "";

  if (player.birthCity) {
    result += player.birthCity;
  } else {
    return result;
  }

  if (player.birthStateProvince) result += ", " + player.birthStateProvince;
  if (player.birthCountry) result += ", " + player.birthCountry;

  return result;
}