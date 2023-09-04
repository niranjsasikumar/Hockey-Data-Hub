import React from "react";
import axios from "axios";
import { Container, Typography, Divider, Stack, CircularProgress, Grid } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import GameCard from "../common-components/GameCard";

function getFormattedDateString(date) {
  return new Date(date).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function Scores() {
  const [date, setDate] = React.useState(null);
  const [loadingFailed, setLoadingFailed] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [scores, setScores] = React.useState(null);

  React.useEffect(() => {
    fetchScores(date);
  }, [date]);

  async function fetchScores(date) {
    try {
      setLoadingFailed(false);
      setIsLoading(true);
      let response = null;
      if (date === null) {
        const offset = new Date().getTimezoneOffset();
        response = await axios.get(
          "http://localhost:5000/scores",
          { params: { date: "null", offset: offset } }
        );
      } else {
        const offset = new Date(date.toISOString()).getTimezoneOffset();
        response = await axios.get(
          "http://localhost:5000/scores",
          { params: { date: date.toISOString(), offset: offset } }
        );
      }
      setScores(response.data);
    } catch (error) {
      setLoadingFailed(true);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDateChange = (value) => {
    setDate(value);
  };

  return(
    <Container maxWidth={false} sx={{ maxWidth: "1300px", pt: 3, pb: 5 }}>
      <Typography variant="h3" component="h1">Scores</Typography>
      <Divider sx={{ mt: 2, mb: 3 }} />
      <DatePicker label="Date" views={["year", "month", "day"]} value={date} onChange={handleDateChange} />
      <Divider sx={{ mt: 3, mb: 4 }} />

      {loadingFailed ? (
        <Typography>Failed to load scores.</Typography>
      ) : isLoading ? (
        <Stack direction="row" alignItems="center" spacing={2}>
          <CircularProgress size={25} />
          <Typography>Loading scores...</Typography>
        </Stack>
      ) : scores.length === 0 ? (
        <Typography>No games scheduled for the selected date.</Typography>
      ) : (
        scores.map((date) => (
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

export default Scores;