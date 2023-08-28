import React from "react";
import { Container, Typography, Divider, FormControl, InputLabel, Select, MenuItem, Alert, Grid } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { teams } from "./sample-schedule-data";
import { schedule } from "./sample-schedule-data";
import ScheduleCard from "./ScheduleCard";

function Schedule() {
  const [team, setTeam] = React.useState("");

  const handleTeamChange = (event) => {
    setTeam(event.target.value);
  };

  return(
    <Container maxWidth={false} sx={{ maxWidth: "1300px", pt: 3, pb: 5 }}>
      <Typography variant="h3" component="h1">Schedule</Typography>
      <Divider sx={{ mt: 2, mb: 3 }} />
      <DatePicker label="Date" views={["year", "month", "day"]} sx={{ mr: 2, mb: 2, width: 230 }} />
      <FormControl sx={{ mr: 2, mb: 2, width: 230 }}>
        <InputLabel id="team-label">Team</InputLabel>
        <Select labelId="team-label" id="team" value={team} label="Team" onChange={handleTeamChange}>
          {teams.map((team) => (
            <MenuItem value={team} key={team}>{team}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Divider sx={{ mt: 1, mb: 3 }} />

      <Alert severity="warning">This web app is currently under development, therefore, the information displayed below is static and independent of the Date and Team fields above.</Alert>

      {schedule.map((date) => (
        <div key={date.date}>
          <Typography variant="h5" component="h2" mt={4} mb={3}>{date.date}</Typography>
          <Grid container spacing={3}>
            {date.games.map((game) => (
              <Grid item xs={12} sm={6} key={game.id}>
                <ScheduleCard game={game} />
              </Grid>
            ))}
          </Grid>
        </div>
      ))}
    </Container>
  );
}

export default Schedule;