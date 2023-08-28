import React from "react";
import { Container, Typography, Divider, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { teams } from "./sample-teams-data";

function Teams() {
  const [season, setSeason] = React.useState(20222023);
  const [team, setTeam] = React.useState("");

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
          <MenuItem value={20222023}>2022-2023</MenuItem>
        </Select>
      </FormControl>
      <FormControl sx={{ mr: 2, mb: 2, width: 230 }}>
        <InputLabel id="team-label">Team</InputLabel>
        <Select labelId="team-label" id="team" value={team} label="Team" onChange={handleTeamChange}>
          {teams.map((team) => (
            <MenuItem value={team} key={team}>{team}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Divider sx={{ mt: 1, mb: 3 }} />

      {team === "" ? (
        <Typography mt={4} mb={2}>Select a team above</Typography>
      ) : (
        <Typography mt={4} mb={2}>There is no information about this team at the moment</Typography>
      )}
    </Container>
  );
}

export default Teams;