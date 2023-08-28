import React from "react";
import { seasonConference, standingsConference, playoffs } from "./sample-standings-data";
import { Container, Typography, Divider, FormControl, InputLabel, Select, MenuItem, Box, Grid } from "@mui/material";
import StandingsConference from "./StandingsConference";
import StandingsDivision from "./StandingsDivision";
import StandingsTable from "./StandingsTable";
import SeriesCard from "./SeriesCard";

const seasons = {
  20222023: {
    seasonInfo: seasonConference,
    standings: standingsConference
  }
}

function Standings() {
  const [season, setSeason] = React.useState(20222023);
  const [type, setType] = React.useState("regular");
  const [seasonInfo, setSeasonInfo] = React.useState(seasonConference);
  const [standings, setStandings] = React.useState(standingsConference);

  const handleSeasonChange = (event) => {
    setSeason(event.target.value);
  };

  const handleTypeChange = (event) => {
    setType(event.target.value);
  };

  React.useEffect(() => {
    setSeasonInfo(seasons[season].seasonInfo);
    setStandings(seasons[season].standings);
  }, [season]);

  return(
    <Container maxWidth={false} sx={{ maxWidth: "1300px", pt: 3, pb: 5 }}>
      <Typography variant="h3" component="h1">Standings</Typography>
      <Divider sx={{ mt: 2, mb: 3 }} />
      <FormControl sx={{ mr: 2, mb: 2, minWidth: 140 }}>
        <InputLabel id="season-label">Season</InputLabel>
        <Select labelId="season-label" id="season" value={season} label="Season" onChange={handleSeasonChange}>
          <MenuItem value={20222023}>2022-2023</MenuItem>
        </Select>
      </FormControl>
      <FormControl sx={{ mb: 2, minWidth: 140 }}>
        <InputLabel id="type-label">Type</InputLabel>
        <Select labelId="type-label" id="type" value={type} label="Type" onChange={handleTypeChange}>
          <MenuItem value="regular">Regular</MenuItem>
          {playoffs !== null && <MenuItem value="playoffs">Playoffs</MenuItem>}
        </Select>
      </FormControl>
      <Divider sx={{ mt: 1, mb: 3 }} />

      {type === "regular" ? (
        seasonInfo.ConferencesInUse ? (
          <StandingsConference standings={standings} season={seasonInfo} />
        ) : seasonInfo.DivisionsInUse ? (
          <StandingsDivision standings={standings} season={seasonInfo} />
        ) : (
          <Box sx={{ mt: 5 }}>
            <StandingsTable standings={standings} season={seasonInfo} />
          </Box>
        )
      ) : (
        playoffs.map((round) => (
          <div key={round.round}>
            <Typography variant="h5" component="h2" mt={4} mb={2}>{round.round}</Typography>
            <Grid container spacing={2}>
              {round.series.map((series) => (
                <Grid key={series.ID} item xs={12} sm={6} md={4} lg={3}>
                  <SeriesCard series={series} />
                </Grid>
              ))}
            </Grid>
          </div>
        ))
      )}
    </Container>
  );
}

export default Standings;