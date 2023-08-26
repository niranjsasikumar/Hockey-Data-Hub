import React from "react";
import { skaterStats } from "./sample-stats-data";
import { Container, Typography, Divider, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import SkaterStats from "./SkaterStats";

function Stats() {
  const [season, setSeason] = React.useState(20222023);
  const [type, setType] = React.useState("skaters");
  const [sort, setSort] = React.useState("Points");
  const [players, setPlayers] = React.useState([...skaterStats.players]);

  const handleSeasonChange = (event) => {
    setSeason(event.target.value);
  };

  const handleTypeChange = (event) => {
    setType(event.target.value);
  };

  const handleSortChange = (event) => {
    setSort(event.target.value);
  };

  React.useEffect(() => {
    const sortedPlayers = [...skaterStats.players].sort((a, b) => b[sort] - a[sort]);
    setPlayers(sortedPlayers);
  }, [sort]);

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

      <FormControl sx={{ mb: 2, minWidth: 240 }}>
        <InputLabel id="sort-label">Sort</InputLabel>
        <Select labelId="sort-label" id="sort" value={sort} label="Sort" onChange={handleSortChange}>
          {skaterStats.columns.map((column) => (
            <MenuItem key={column.name} value={column.property}>{column.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <Divider sx={{ mt: 1, mb: 3 }} />

      <SkaterStats stats={{ columns: skaterStats.columns, players: players }} />
    </Container>
  );
}

export default Stats;