import { Typography } from "@mui/material";
import StandingsTable from "./StandingsTable";

function StandingsDivision({ standings, season }) {
  return(
    <>
      {standings.map((division) => (
        <div key={division.division}>
          <Typography variant="h4" component="h2" mt={4} mb={2}>{division.division} Division</Typography>
          <StandingsTable standings={division.standings} season={season} />
        </div>
      ))}
    </>
  );
}

export default StandingsDivision;