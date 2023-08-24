import React from "react";
import { Container, Typography, Divider, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { teams } from "./sample-schedule-data";

function Schedule() {
  const [team, setTeam] = React.useState("");

  const handleTeamChange = (event) => {
    setTeam(event.target.value);
  };

  return(
    <Container maxWidth={false} sx={{ maxWidth: "1300px", py: 3 }}>
      <Typography variant="h3" component="h1">Schedule</Typography>
      <Divider sx={{ mt: 2, mb: 3 }} />
      <DatePicker label="Start Date" views={["year", "month", "day"]} sx={{ mr: 2, mb: 2, width: 230 }} />
      <DatePicker label="End Date" views={["year", "month", "day"]} sx={{ mr: 2, mb: 2, width: 230 }} />
      <FormControl sx={{ mb: 2, width: 230 }}>
        <InputLabel id="team-label">Team</InputLabel>
        <Select labelId="team-label" id="team" value={team} label="Team" onChange={handleTeamChange}>
          {teams.map((team) => (
            <MenuItem value={team} key={team}>{team}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Divider sx={{ mt: 1, mb: 3 }} />
    </Container>
  );
}

export default Schedule;