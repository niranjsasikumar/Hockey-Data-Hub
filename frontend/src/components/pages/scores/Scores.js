import { Container, Typography, Divider, Alert, Grid } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { scores } from "./sample-scores-data";
import ScoreCard from "./ScoreCard";

function Scores() {
  return(
    <Container maxWidth={false} sx={{ maxWidth: "1300px", pt: 3, pb: 5 }}>
      <Typography variant="h3" component="h1">Scores</Typography>
      <Divider sx={{ mt: 2, mb: 3 }} />
      <DatePicker label="Date" views={["year", "month", "day"]}/>
      <Divider sx={{ my: 3 }} />

      <Alert severity="warning">This web app is currently under development, therefore, the information displayed below is static and independent of the Date field above.</Alert>

      {scores.map((date) => (
        <div key={date.date}>
          <Typography variant="h5" component="h2" mt={4} mb={3}>{date.date}</Typography>
          <Grid container spacing={3}>
            {date.games.map((game) => (
              <Grid item xs={12} sm={6} key={game.ID}>
                <ScoreCard game={game} />
              </Grid>
            ))}
          </Grid>
        </div>
      ))}
    </Container>
  );
}

export default Scores;