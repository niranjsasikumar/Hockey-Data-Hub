import React from "react";
import axios from "axios";
import { apiEndpoint } from "../../../utils/common-utils";
import { Container, Typography, Divider, FormControl, InputLabel, Select, MenuItem, Stack, CircularProgress, Box, Grid } from "@mui/material";
import StandingsConference from "./StandingsConference";
import StandingsDivision from "./StandingsDivision";
import StandingsTable from "./StandingsTable";
import SeriesCard from "./SeriesCard";

function Standings() {
  const [seasonsList, setSeasonsList] = React.useState(null);
  const [season, setSeason] = React.useState("");
  const [type, setType] = React.useState("regular");
  const [loadingFailed, setLoadingFailed] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [seasonInfo, setSeasonInfo] = React.useState(null);
  const [standings, setStandings] = React.useState(null);
  const [playoffs, setPlayoffs] = React.useState(null);
  
  let hasPlayoffsData = seasonsList?.find((seasonObj) => seasonObj.value === season)?.hasPlayoffsData;
  if (!hasPlayoffsData && type === "playoffs") setType("regular");

  React.useEffect(() => {
    fetchSeasons();
  }, []);

  async function fetchSeasons() {
    const response = await axios.get(apiEndpoint("/seasons/list"));
    setSeasonsList(response.data);
    setSeason(response.data[0].value);
  }

  React.useEffect(() => {
    if (season === "") return;

    if (type === "regular") {
      fetchDisplayData([fetchSeasonInfo(season), fetchStandings(season)])
    } else {
      fetchDisplayData([fetchSeasonInfo(season), fetchPlayoffs(season)])
    }
  }, [season, type]);

  async function fetchDisplayData(fetchCalls) {
    try {
      setLoadingFailed(false);
      setIsLoading(true);
      await Promise.all(fetchCalls);
    } catch (error) {
      setLoadingFailed(true);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchSeasonInfo(season) {
    const response = await axios.get(apiEndpoint(`/seasons/info/${season}`));
    setSeasonInfo(response.data);
  }

  async function fetchStandings(season) {
    const response = await axios.get(apiEndpoint(`/standings/${season}`));
    setStandings(response.data);
  }

  async function fetchPlayoffs(season) {
    const response = await axios.get(apiEndpoint(`/playoffs/${season}`));
    setPlayoffs(response.data);
  }

  const handleSeasonChange = (event) => {
    setSeason(event.target.value);
  };

  const handleTypeChange = (event) => {
    setType(event.target.value);
  };

  return(
    <Container maxWidth={false} sx={{ maxWidth: "1300px", pt: 3, pb:5 }}>
      <Typography variant="h3" component="h1">Standings</Typography>
      <Divider sx={{ mt: 2, mb: 3 }} />
      <FormControl sx={{ mr: 2, mb: 2, minWidth: 140 }}>
        <InputLabel id="season-label">Season</InputLabel>
        <Select labelId="season-label" id="season" value={season} label="Season" onChange={handleSeasonChange}>
          {seasonsList?.map((season) => (
            <MenuItem value={season.value} key={season.value}>{season.string}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl sx={{ mb: 2, minWidth: 140 }}>
        <InputLabel id="type-label">Type</InputLabel>
        <Select labelId="type-label" id="type" value={type} label="Type" onChange={handleTypeChange}>
          <MenuItem value="regular">Regular</MenuItem>
          {hasPlayoffsData && <MenuItem value="playoffs">Playoffs</MenuItem>}
        </Select>
      </FormControl>
      <Divider sx={{ mt: 1, mb: 3 }} />

      {loadingFailed ? (
        <Typography>Failed to load {type === "regular" ? "standings" : "playoffs information"}.</Typography>
      ) : isLoading ? (
        <Stack direction="row" alignItems="center" spacing={2}>
          <CircularProgress size={25} />
          <Typography>Loading {type === "regular" ? "standings" : "playoffs information"}...</Typography>
        </Stack>
      ) : type === "regular" ? (
        seasonInfo?.conferencesInUse ? (
          <StandingsConference standings={standings} season={seasonInfo} />
        ) : seasonInfo?.divisionsInUse ? (
          <StandingsDivision standings={standings} season={seasonInfo} />
        ) : (
          <Box sx={{ mt: 5 }}>
            <StandingsTable standings={standings} season={seasonInfo} />
          </Box>
        )
      ) : (
        playoffs?.map((round) => (
          <div key={round.round}>
            <Typography variant="h5" component="h2" mt={4} mb={2}>{round.round}</Typography>
            <Grid container spacing={2}>
              {round.series.map((series) => (
                <Grid key={series.id} item xs={12} sm={6} md={4} lg={3}>
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