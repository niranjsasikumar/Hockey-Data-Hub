import { Container, Typography, Divider, Grid } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import ScoreCard from "./ScoreCard";
import { regularGame, playoffGame } from "./sample-scores-data";

function Scores() {
  return(
    <Container maxWidth={false} sx={{ maxWidth: "1300px", py: 3 }}>
      <Typography variant="h3" component="h1">Scores</Typography>
      <Divider sx={{ mt: 2, mb: 3 }} />
      <DatePicker label="Date" views={["year", "month", "day"]}/>
      <Divider sx={{ my: 3 }} />

      <Typography variant="h5" component="h2" mt={4} mb={3}>Tue, Jun 13, 2023</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ScoreCard game={playoffGame} />
        </Grid>
        <Grid item xs={12} md={6}>
          <ScoreCard game={playoffGame} />
        </Grid>
        <Grid item xs={12} md={6}>
          <ScoreCard game={regularGame} />
        </Grid>
      </Grid>

      <Typography variant="h5" component="h2" mt={4} mb={3}>Mon, Jun 12, 2023</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ScoreCard game={playoffGame} />
        </Grid>
      </Grid>

      <Typography variant="h5" component="h2" mt={4} mb={3}>Sun, Jun 11, 2023</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ScoreCard game={regularGame} />
        </Grid>
        <Grid item xs={12} md={6}>
          <ScoreCard game={playoffGame} />
        </Grid>
        <Grid item xs={12} md={6}>
          <ScoreCard game={regularGame} />
        </Grid>
        <Grid item xs={12} md={6}>
          <ScoreCard game={regularGame} />
        </Grid>
      </Grid>
    </Container>
  );
}

export default Scores;