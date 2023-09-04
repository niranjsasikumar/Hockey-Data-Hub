import React from "react";
import axios from "axios";
import { Container, Typography, Divider, FormControl, InputLabel, Select, MenuItem, Stack, CircularProgress, Grid } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import GameCard from "../common-components/GameCard";
import { teams } from "./sample-schedule-data";

function getFormattedDateString(date) {
  return new Date(date).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function Schedule() {
  const [date, setDate] = React.useState(null);
  const [team, setTeam] = React.useState("all");
  const [loadingFailed, setLoadingFailed] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [schedule, setSchedule] = React.useState(null);
  const [teamsList, setTeamsList] = React.useState(null);

  async function fetchSchedule(date) {
    try {
      setLoadingFailed(false);
      setIsLoading(true);
      let response = null;
      if (date === null) {
        const offset = new Date().getTimezoneOffset();
        response = await axios.get("http://localhost:5000/schedule", { params: { date: "null", offset: offset } });
      } else {
        const offset = new Date(date.toISOString()).getTimezoneOffset();
        response = await axios.get("http://localhost:5000/schedule", { params: { date: date.toISOString(), offset: offset } });
      }
      setSchedule(response.data);
    } catch (error) {
      setLoadingFailed(true);
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    fetchSchedule(date);
  }, [date]);

  async function fetchTeams() {
    const response = await axios.get("http://localhost:5000/teams/list/current");
    setTeamsList(response.data);
  }

  React.useEffect(() => {
    fetchTeams();
  }, []);

  const handleDateChange = (value) => {
    setDate(value);
  };

  const handleTeamChange = (event) => {
    setTeam(event.target.value);
  };

  return(
    <Container maxWidth={false} sx={{ maxWidth: "1300px", pt: 3, pb: 5 }}>
      <Typography variant="h3" component="h1">Schedule</Typography>
      <Divider sx={{ mt: 2, mb: 3 }} />
      <DatePicker label="Date" views={["year", "month", "day"]} sx={{ mr: 2, mb: 2, width: 230 }} value={date} onChange={handleDateChange} />
      <FormControl sx={{ mr: 2, mb: 2, width: 230 }}>
        <InputLabel id="team-label">Team</InputLabel>
        <Select labelId="team-label" id="team" value={team} label="Team" onChange={handleTeamChange}>
          <MenuItem value="all">All Teams</MenuItem>
          {teamsList?.map((team) => (
            <MenuItem value={team.id} key={team.id}>{team.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Divider sx={{ mt: 1, mb: 4 }} />

      {loadingFailed ? (
        <Typography>Failed to load schedule.</Typography>
      ) : isLoading ? (
        <Stack direction="row" alignItems="center" spacing={2}>
          <CircularProgress size={25} />
          <Typography>Loading schedule...</Typography>
        </Stack>
      ) : schedule.length === 0 ? (
        <Typography>No games scheduled for the selected date.</Typography>
      ) : (
        schedule.map((date) => (
          <div key={date.date}>
            <Typography variant="h5" component="h2" mt={4} mb={3}>{getFormattedDateString(date.date)}</Typography>
            <Grid container spacing={3}>
              {date.games.map((game) => (
                <Grid item xs={12} sm={6} key={game.id}>
                  <GameCard game={game} />
                </Grid>
              ))}
            </Grid>
          </div>
        ))
      )}
    </Container>
  );
}

export default Schedule;