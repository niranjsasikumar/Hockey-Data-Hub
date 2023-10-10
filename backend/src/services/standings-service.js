import getSeasonInfo from "./season-info-service.js";
import { fetchDataFromNHLApi } from "../utils/utils.js";
import pool from "../database/database.js";

export default async function getStandings(season) {
  const seasonInfo = await getSeasonInfo(season);
  const { id, conferencesInUse, divisionsInUse, conferences, divisions } = seasonInfo;

  if (id === "current") return await getCurrentSeasonStandings(conferencesInUse, divisionsInUse);

  if (conferencesInUse) {
    return await getStandingsConference(id, conferences, divisions);
  } else if (divisionsInUse) {
    return await getStandingsDivision(id, divisions);
  }

  return await getStandingsLeague(id);
}

async function getCurrentSeasonStandings(conferencesInUse, divisionsInUse) {
  const standingsData = (await fetchDataFromNHLApi("/standings?expand=standings.record,standings.team")).records;
  let standings = [];

  for (const division of standingsData) {
    if ("conference" in division) {
      let confIndex = standings.findIndex(
        (conference) => conference.conference === division.conference.name
      );
      if (confIndex === -1) {
        standings.push({
          conference: division.conference.name,
          divisions: []
        })
        confIndex = standings.length - 1;
      }
      standings[confIndex].divisions.push({
        name: division.division.name,
        standings: getDivisionRecords(division.teamRecords)
      });
    } else if ("division" in division) {
      standings.push({
        division: division.division.name,
        standings: getDivisionRecords(division.teamRecords)
      });
    } else {
      standings = getDivisionRecords(division.teamRecords);
    }
  }

  return standings;
}

function getDivisionRecords(records) {
  const divisionRecords = [];

  for (const team of records) {
    const { id, teamName, abbreviation, conference, division } = team.team;
    const { clinchIndicator, divisionRank, leagueRank, points, gamesPlayed, goalsScored, goalsAgainst, streak } = team;
    const { wins, losses, ties, ot } = team.leagueRecord;
    const [homeRecord, awayRecord, , last10] = team.records.overallRecords

    divisionRecords.push({
      teamId: id,
      teamShortName: teamName,
      teamAbbreviation: abbreviation,
      logoURL: `https://assets.nhle.com/logos/nhl/svg/${abbreviation}_light.svg`,
      conference: conference ? conference.name : null,
      division: division ? division.name : null,
      clinchIndicator: clinchIndicator ? clinchIndicator : null,
      divisionRank: divisionRank ? Number(divisionRank) : null,
      leagueRank: Number(leagueRank),
      points: points,
      gamesPlayed: gamesPlayed,
      wins: wins,
      losses: losses,
      ties: ties !== undefined ? ties : null,
      overtimeLosses: ot !== undefined ? ot : null,
      goalsFor: goalsScored,
      goalsAgainst: goalsAgainst,
      difference: goalsScored - goalsAgainst,
      homeRecord: getRecordString(homeRecord),
      awayRecord: getRecordString(awayRecord),
      last10: getRecordString(last10),
      streak: streak ? streak.streakCode : "-"
    });
  }

  return divisionRecords;
}

function getRecordString(record) {
  return record.wins + "-" + record.losses + ("ties" in record ? "-" + record.ties : "") + ("ot" in record ? "-" + record.ot : "");
}

async function getStandingsConference(season, conferences, divisions) {
  conferences = conferences.split(",");
  divisions = divisions.split(",");
  const divsPerConf = divisions.length / conferences.length;
  const standings = [];

  for (let i = 0; i < conferences.length; i++) {
    standings.push({
      conference: conferences[i],
      divisions: []
    });

    for (let j = i * divsPerConf; j < (i + 1) * divsPerConf; j++) {
      const [results] = await pool.query(
        `SELECT ${queryColumns} FROM standings
        WHERE season = ${season} AND division = "${divisions[j]}"
        ORDER BY divisionRank ASC`
      );

      standings[i].divisions.push({
        name: divisions[j],
        standings: results
      });
    }
  }

  return standings;
}

const queryColumns = [
  "teamId",
  "teamShortName",
  "teamAbbreviation",
  "logoURL",
  "conference",
  "division",
  "clinchIndicator",
  "divisionRank",
  "leagueRank",
  "points",
  "gamesPlayed",
  "wins",
  "losses",
  "ties",
  "overtimeLosses",
  "goalsFor",
  "goalsAgainst",
  "difference",
  "homeRecord",
  "awayRecord",
  "last10",
  "streak"
];

async function getStandingsDivision(season, divisions) {
  divisions = divisions.split(",");
  const standings = [];

  for (const division of divisions) {
    const [results] = await pool.query(
      `SELECT ${queryColumns} FROM standings
      WHERE season = ${season} AND division = "${division}"
      ORDER BY divisionRank ASC`
    );

    standings.push({
      division: division,
      standings: results
    });
  }

  return standings;
}

async function getStandingsLeague(season) {
  return (await pool.query(
    `SELECT ${queryColumns} FROM standings
    WHERE season = ${season}
    ORDER BY leagueRank ASC`
  ))[0];
}