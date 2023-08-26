import React from "react";
import { skaterStats, goalieStats } from "./sample-stats-data";
import { Container, Typography, Divider, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import SkaterStats from "./SkaterStats";
import GoalieStats from "./GoalieStats";

function Stats() {
  const [season, setSeason] = React.useState(20222023);
  const [type, setType] = React.useState("skaters");
  const [skaterSort, setSkaterSort] = React.useState("Points");
  const [goalieSort, setGoalieSort] = React.useState("SavePercentage");
  const [skaters, setSkaters] = React.useState([...skaterStats.players]);
  const [goalies, setGoalies] = React.useState([...goalieStats.players]);

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

  const sortPlayers = (stats, property) => {
    let sortedPlayers;

    if (stats.columns.find(column => column.property === property).sortDescending) {
      sortedPlayers = [...stats.players].sort((a, b) => b[property] - a[property]);
    } else {
      sortedPlayers = [...stats.players].sort((a, b) => a[property] - b[property]);
    }

    return sortedPlayers;
  };

  React.useEffect(() => {
    const sortedPlayers = sortPlayers(skaterStats, skaterSort);
    setSkaters(sortedPlayers);
  }, [skaterSort]);

  React.useEffect(() => {
    const sortedPlayers = sortPlayers(goalieStats, goalieSort);
    setGoalies(sortedPlayers);
  }, [goalieSort]);

  return(
    <Container maxWidth={false} sx={{ maxWidth: "1300px", py: 3 }}>
      <Typography variant="h3" component="h1">Statistics</Typography>
      <Divider sx={{ mt: 2, mb: 3 }} />

      <FormControl sx={{ mr: 2, mb: 2, minWidth: 140 }}>
        <InputLabel id="season-label">Season</InputLabel>
        <Select labelId="season-label" id="season" value={season} label="Season" onChange={handleSeasonChange}>
          <MenuItem value={20222023}>2022-2023</MenuItem>
          <MenuItem value={20212022}>2021-2022</MenuItem>
          <MenuItem value={20202021}>2020-2021</MenuItem>
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
          <Select labelId="skater-sort-label" id="skater-sort" value={skaterSort} label="Sort" onChange={handleSortChange}>
            {skaterStats.columns.map((column) => (
              <MenuItem key={column.name} value={column.property}>{column.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : (
        <FormControl sx={{ mb: 2, minWidth: 240 }}>
          <InputLabel id="goalie-sort-label">Sort</InputLabel>
          <Select labelId="goalie-sort-label" id="goalie-sort" value={goalieSort} label="Sort" onChange={handleSortChange}>
            {goalieStats.columns.map((column) => (
              <MenuItem key={column.name} value={column.property}>{column.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      
      <Divider sx={{ mt: 1, mb: 3 }} />

      {type === "skaters" ? (
        <>
          <Typography variant="h4" component="h2" mt={4} mb={2}>Skaters</Typography>
          <SkaterStats stats={{ columns: skaterStats.columns, players: skaters }} />
        </>
      ) : (
        <>
          <Typography variant="h4" component="h2" mt={4} mb={2}>Goalies</Typography>
          <GoalieStats stats={{ columns: goalieStats.columns, players: goalies }} />
        </>
      )}
    </Container>
  );
}

export default Stats;