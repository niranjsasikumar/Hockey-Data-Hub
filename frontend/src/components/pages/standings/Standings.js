import React from "react";
import { seasonConference, standingsConference } from "./sample-standings-data";
import { Container, Typography, Divider, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import StandingsConference from "./StandingsConference";
import StandingsDivision from "./StandingsDivision";
import StandingsLeague from "./StandingsLeague";

function Standings() {
  const [season, setSeason] = React.useState(20222023);
  const [type, setType] = React.useState("regular");

  const handleSeasonChange = (event) => {
    setSeason(event.target.value);
  };

  const handleTypeChange = (event) => {
    setType(event.target.value);
  };

  const seasonInfo = seasonConference;
  const standings = standingsConference;

  return(
    <Container maxWidth={false} sx={{ maxWidth: "1300px", py: 3 }}>
      <Typography variant="h3" component="h1">Standings</Typography>
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
          <MenuItem value="regular">Regular</MenuItem>
          {"playoffs" in standings && <MenuItem value="playoffs">Playoffs</MenuItem>}
        </Select>
      </FormControl>
      <Divider sx={{ mt: 1, mb: 3 }} />

      {type === "regular" ? (
        seasonInfo.ConferencesInUse ? (
          <StandingsConference standings={standings.regular} season={seasonInfo} />
        ) : seasonInfo.DivisionsInUse ? (
          <StandingsDivision standings={standings.regular} />
        ) : (
          <StandingsLeague standings={standings.regular} />
        )
      ) : (
        <></>
      )}
    </Container>
  );
}

export default Standings;