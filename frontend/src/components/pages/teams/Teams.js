import React from "react";
import { cbj2022, vgk2022, } from "./sample-teams-data";
import { Container, Typography, Divider, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import TeamInfo from "./TeamInfo";

const teams = {
  CBJ: cbj2022,
  VGK: vgk2022
};

function Teams() {
  const [season, setSeason] = React.useState(20222023);
  const [team, setTeam] = React.useState("");
  const [teamInfo, setTeamInfo] = React.useState(vgk2022);

  const handleSeasonChange = (event) => {
    setSeason(event.target.value);
  };

  const handleTeamChange = (event) => {
    const value = event.target.value;
    setTeam(value);
    setTeamInfo(teams[value]);
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
          <MenuItem value="CBJ">Columbus Blue Jackets</MenuItem>
          <MenuItem value="VGK">Vegas Golden Knights</MenuItem>
        </Select>
      </FormControl>
      <Divider sx={{ mt: 1, mb: 3 }} />

      {team === "" ? (
        <Typography mt={4} mb={2}>Select a team above</Typography>
      ) : (
        <TeamInfo team={teamInfo} />
      )}
    </Container>
  );
}

export default Teams;