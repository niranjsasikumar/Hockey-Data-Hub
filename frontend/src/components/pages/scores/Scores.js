import { Container, Typography, Divider, Grid } from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers';
import ScoreCard from "./ScoreCard";

const regularGame = {
  ID: 2022021301,
  Season: 20222023,
  Type: 'Regular Season',
  DateTime: new Date("2023-04-14T06:30:00.000Z"),
  LastPeriod: 'OT',
  GameStatus: 'Final/OT',
  VenueName: 'Capital One Arena',
  PlayoffRound: null,
  PlayoffSeriesID: null,
  PlayoffGameNumber: null,
  AwayID: 1,
  AwayName: 'New Jersey Devils',
  AwayShortName: 'Devils',
  AwayAbbreviation: 'NJD',
  AwayLogoURL: 'https://www-league.nhlstatic.com/images/logos/teams-20222023-light/1.svg',
  AwayGoals: 5,
  AwayGoalScorers: 'Erik Haula (1st, 17:06) | Miles Wood (2nd, 18:36) | Erik Haula (3rd, 03:17) | Dougie Hamilton (3rd, 12:23) | Luke Hughes (OT, 04:33)',
  HomeID: 15,
  HomeName: 'Washington Capitals',
  HomeShortName: 'Capitals',
  HomeAbbreviation: 'WSH',
  HomeLogoURL: 'https://www-league.nhlstatic.com/images/logos/teams-20222023-light/15.svg',
  HomeGoals: 4,
  HomeGoalScorers: 'Joe Snively (1st, 04:36) | Rasmus Sandin (1st, 05:59) | Craig Smith (1st, 10:18) | Tom Wilson (2nd, 01:05)'
};

const playoffGame = {
  ID: 2022030415,
  Season: 20222023,
  Type: 'Playoffs',
  DateTime: new Date("2023-06-14T04:00:00.000Z"),
  LastPeriod: '3rd',
  GameStatus: 'Final',
  VenueName: 'T-Mobile Arena',
  PlayoffRound: 'Stanley Cup Final',
  PlayoffSeriesID: 2022202341,
  PlayoffGameNumber: 'Game 5',
  AwayID: 13,
  AwayName: 'Florida Panthers',
  AwayShortName: 'Panthers',
  AwayAbbreviation: 'FLA',
  AwayLogoURL: 'https://www-league.nhlstatic.com/images/logos/teams-20222023-light/13.svg',
  AwayGoals: 3,
  AwayGoalScorers: 'Aaron Ekblad (2nd, 02:15) | Sam Reinhart (3rd, 08:47) | Sam Bennett (3rd, 11:39)',
  HomeID: 54,
  HomeName: 'Vegas Golden Knights',
  HomeAbbreviation: 'VGK',
  HomeShortName: 'Golden Knights',
  HomeLogoURL: 'https://www-league.nhlstatic.com/images/logos/teams-20222023-light/54.svg',
  HomeGoals: 9,
  HomeGoalScorers: 'Mark Stone (1st, 11:52) | Nicolas Hague (1st, 13:41) | Alec Martinez (2nd, 10:28) | Reilly Smith (2nd, 12:13) | Mark Stone (2nd, 17:15) | Michael Amadio (2nd, 19:58) | Ivan Barbashev (3rd, 08:22) | Mark Stone (3rd, 14:06) | Nicolas Roy (3rd, 18:58)'
};

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