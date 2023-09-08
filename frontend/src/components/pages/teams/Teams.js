import React from "react";
import axios from "axios";
import { Container, Typography, Divider, FormControl, InputLabel, Select, MenuItem, Stack, CircularProgress } from "@mui/material";
import TeamInfo from "./TeamInfo";

function Teams() {
  const [seasonsList, setSeasonsList] = React.useState(null);
  const [season, setSeason] = React.useState("");
  const [team, setTeam] = React.useState("");
  const [loadingFailed, setLoadingFailed] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [teamsList, setTeamsList] = React.useState(null);
  const [teamInfo, setTeamInfo] = React.useState(null);

  React.useEffect(() => {
    fetchSeasons();
  }, []);

  async function fetchSeasons() {
    const response = await axios.get("http://localhost:5000/seasons/list");
    setSeasonsList(response.data);
    setSeason(response.data[0].value);
  }

  React.useEffect(() => {
    if (season === "") return;

    if (team === "") {
      fetchDisplayData([fetchTeamsList(season, team)]);
    } else {
      fetchDisplayData([fetchTeamsList(season, team), fetchTeamInfo(season, team)]);
    }
  }, [season, team]);

  async function fetchDisplayData(fetchCalls) {
    try {
      setLoadingFailed(false);
      setIsLoading(true);
      await Promise.all(fetchCalls);
    } catch (error) {
      setLoadingFailed(true);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchTeamsList(season, team) {
    const { data } = await axios.get(`http://localhost:5000/teams/list/${season}`);
    if (!data.some((teamData) => teamData.id === team)) setTeam("");
    setTeamsList(data);
  }

  async function fetchTeamInfo(season, team) {
    const teamData = (await axios.get(
      "http://localhost:5000/teams/info",
      { params: { season: season, team: team } }
    )).data;

    if (!("name" in teamData)) return;
    else setTeamInfo(teamData);
  }

  const handleSeasonChange = (event) => {
    setSeason(event.target.value);
  };

  const handleTeamChange = (event) => {
    setTeam(event.target.value);
  };

  return(
    <Container maxWidth={false} sx={{ maxWidth: "1300px", py: 3 }}>
      <Typography variant="h3" component="h1">Teams</Typography>
      <Divider sx={{ mt: 2, mb: 3 }} />

      <FormControl sx={{ mr: 2, mb: 2, minWidth: 140 }}>
        <InputLabel id="season-label">Season</InputLabel>
        <Select labelId="season-label" id="season" value={season} label="Season" onChange={handleSeasonChange}>
          {seasonsList?.map((season) => (
            <MenuItem value={season.value} key={season.value}>{season.string}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ mr: 2, mb: 2, width: 230 }}>
        <InputLabel id="team-label">Team</InputLabel>
        <Select labelId="team-label" id="team" value={team} label="Team" onChange={handleTeamChange}>
          {teamsList?.map((team) => (
            <MenuItem value={team.id} key={team.id}>{team.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Divider sx={{ mt: 1, mb: 3 }} />

      {loadingFailed ? (
        <Typography mt={4} mb={2}>Failed to load team information.</Typography>
      ) : isLoading ? (
        <Stack direction="row" alignItems="center" spacing={2}>
          <CircularProgress size={25} />
          <Typography mt={4} mb={2}>Loading team information...</Typography>
        </Stack>
      ) : team === "" ? (
        <Typography mt={4} mb={2}>Select a team above.</Typography>
      ) : teamInfo !== null ? (
        <TeamInfo team={teamInfo} />
      ) : (
        <></>
      )}
    </Container>
  );
}

export default Teams;