import { Typography } from "@mui/material";
import StandingsTable from "./StandingsTable";

function StandingsConference({ standings, season }) {
  return(
    <>
      {standings.map((conference) => (
        <div key={conference.conference}>
          <Typography variant="h4" component="h2" mt={4}>{conference.conference} Conference</Typography>
          {conference.divisions.map((division) => (
            <div key={division.name}>
              <Typography variant="h5" component="h3" my={2}>{division.name} Division</Typography>
              <StandingsTable standings={division.standings} season={season} />
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

export default StandingsConference;