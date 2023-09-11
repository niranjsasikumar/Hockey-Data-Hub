import React from "react";
import axios from "axios";
import { apiEndpoint } from "../../../utils/common-utils";
import { Container, Typography, Divider, FormControl, InputLabel, Select, MenuItem, Stack, CircularProgress } from "@mui/material";
import SkaterStats from "./SkaterStats";
import GoalieStats from "./GoalieStats";

function Stats() {
  const [seasonsList, setSeasonsList] = React.useState(null);
  const [season, setSeason] = React.useState("");
  const [type, setType] = React.useState("skaters");
  const [skaterSort, setSkaterSort] = React.useState("points");
  const [goalieSort, setGoalieSort] = React.useState("goalsAgainstAverage");
  const [loadingFailed, setLoadingFailed] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [seasonInfo, setSeasonInfo] = React.useState(null);
  const [skaterStats, setSkaterStats] = React.useState(null);
  const [goalieStats, setGoalieStats] = React.useState(null);

  const skaterSortOptions = [
    { value: "gamesPlayed", name: "Games Played" },
    { value: "goals", name: "Goals" },
    { value: "assists", name: "Assists" },
    { value: "points", name: "Points" },
    { value: "pointsPerGamesPlayed", name: "Points per Games Played" },
    ...seasonInfo?.powerPlayStatsTracked ? [{ value: "powerPlayGoals", name: "Power Play Goals" }] : [],
    ...seasonInfo?.powerPlayStatsTracked ? [{ value: "powerPlayPoints", name: "Power Play Points" }] : [],
    ...seasonInfo?.shootingStatsTracked ? [{ value: "shots", name: "Shots" }] : [],
    ...seasonInfo?.shootingStatsTracked ? [{ value: "shootingPercentage", name: "Shooting Percentage" }] : [],
    ...seasonInfo?.faceoffStatsTracked ? [{ value: "faceoffPercentage", name: "Faceoff Win Percentage" }] : []
  ];

  if (!skaterSortOptions.some((option) => option.value === skaterSort)) setSkaterSort("points");

  const goalieSortOptions = [
    { value: "gamesPlayed", name: "Games Played" },
    { value: "gamesStarted", name: "Games Started" },
    { value: "wins", name: "Wins" },
    ...seasonInfo?.saveStatsTracked ? [{ value: "shotsAgainst", name: "Shots Against" }] : [],
    ...seasonInfo?.saveStatsTracked ? [{ value: "saves", name: "Saves" }] : [],
    { value: "goalsAgainst", name: "Goals Against" },
    ...seasonInfo?.saveStatsTracked ? [{ value: "savePercentage", name: "Save Percentage" }] : [],
    { value: "goalsAgainstAverage", name: "Goals Against Average" },
    { value: "shutouts", name: "Shutouts" },
    { value: "timeOnIce", name: "Time On Ice" }
  ];

  if (!goalieSortOptions.some((option) => option.value === goalieSort)) setGoalieSort("goalsAgainstAverage");

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

    if (type === "skaters") {
      fetchDisplayData([fetchSeasonInfo(season), fetchSkaterStats(season, skaterSort)]);
    } else {
      fetchDisplayData([fetchSeasonInfo(season), fetchGoalieStats(season, goalieSort)]);
    }
  }, [season, type, skaterSort, goalieSort]);

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

  async function fetchSkaterStats(season, sort) {
    const response = await axios.get(
      apiEndpoint("/stats/skaters"),
      { params: { season: season, sort: sort } }
    );
    setSkaterStats(response.data);
  }

  async function fetchGoalieStats(season, sort) {
    const response = await axios.get(
      apiEndpoint("/stats/goalies"),
      { params: { season: season, sort: sort } }
    );
    setGoalieStats(response.data);
  }

  const handleSeasonChange = (event) => {
    setSeason(event.target.value);
  };

  const handleTypeChange = (event) => {
    setType(event.target.value);
  };

  const handleSortChange = (event) => {
    const value = event.target.value;
    type === "skaters" ? setSkaterSort(value) : setGoalieSort(value);
  };

  return(
    <Container maxWidth={false} sx={{ maxWidth: "1300px", py: 3 }}>
      <Typography variant="h3" component="h1">Statistics</Typography>
      <Divider sx={{ mt: 2, mb: 3 }} />

      <FormControl sx={{ mr: 2, mb: 2, minWidth: 140 }}>
        <InputLabel id="season-label">Season</InputLabel>
        <Select labelId="season-label" id="season" value={season} label="Season" onChange={handleSeasonChange}>
          {seasonsList?.map((season) => (
            <MenuItem value={season.value} key={season.value}>{season.string}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ mr: 2, mb: 2, minWidth: 140 }}>
        <InputLabel id="type-label">Type</InputLabel>
        <Select labelId="type-label" id="type" value={type} label="Type" onChange={handleTypeChange}>
          <MenuItem value="skaters">Skaters</MenuItem>
          <MenuItem value="goalies">Goalies</MenuItem>
        </Select>
      </FormControl>

      {type === "skaters" ? (
        <FormControl sx={{ mb: 2, minWidth: 240 }}>
          <InputLabel id="skater-sort-label">Sort</InputLabel>
          <Select defaultValue="points" labelId="skater-sort-label" id="skater-sort" value={skaterSort} label="Sort" onChange={handleSortChange}>
            {skaterSortOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : (
        <FormControl sx={{ mb: 2, minWidth: 240 }}>
          <InputLabel id="goalie-sort-label">Sort</InputLabel>
          <Select labelId="goalie-sort-label" id="goalie-sort" value={goalieSort} label="Sort" onChange={handleSortChange}>
            {goalieSortOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      
      <Divider sx={{ mt: 1, mb: 3 }} />

      {loadingFailed ? (
        <Typography>Failed to load {type === "skaters" ? "skater" : "goalie"} stats.</Typography>
      ) : isLoading ? (
        <Stack direction="row" alignItems="center" spacing={2}>
          <CircularProgress size={25} />
          <Typography>Loading {type === "skaters" ? "skater" : "goalie"} stats...</Typography>
        </Stack>
      ) : type === "skaters" && skaterStats.length === 0 ? (
        <Typography>Skater stats not available at the moment.</Typography>
      ) : type === "skaters" ? (
        <>
          <Typography variant="h4" component="h2" mt={4} mb={2}>Skaters</Typography>
          <SkaterStats stats={skaterStats} season={seasonInfo} />
        </>
      ) : (goalieStats) && goalieStats.stats.length === 0 ? (
        <Typography>Goalie stats not available at the moment.</Typography>
      ) : (
        <>
          <Typography variant="h4" component="h2" mt={4} mb={2}>Goalies <Typography variant="subtitle2" component="p" mt={4} mb={2} display="inline">(Played {goalieStats?.minGamesPlayed} or more games)</Typography></Typography>
          <GoalieStats stats={goalieStats?.stats} season={seasonInfo} />
        </>
      )}
    </Container>
  );
}

export default Stats;