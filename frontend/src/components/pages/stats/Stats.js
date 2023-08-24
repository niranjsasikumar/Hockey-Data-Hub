import React from "react";
import { Container, Typography, Divider, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

function Stats() {
  const [season, setSeason] = React.useState(20222023);
  const [type, setType] = React.useState("skaters");

  const handleSeasonChange = (event) => {
    setSeason(event.target.value);
  };

  const handleTypeChange = (event) => {
    setType(event.target.value);
  };

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
      <FormControl sx={{ mb: 2, minWidth: 140 }}>
        <InputLabel id="type-label">Type</InputLabel>
        <Select labelId="type-label" id="type" value={type} label="Type" onChange={handleTypeChange}>
          <MenuItem value="skaters">Skaters</MenuItem>
          <MenuItem value="goalies">Goalies</MenuItem>
        </Select>
      </FormControl>
      <Divider sx={{ mt: 1, mb: 3 }} />
    </Container>
  );
}

export default Stats;