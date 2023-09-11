import { Box, Stack, Typography, Divider } from "@mui/material";
import TeamStats from "./TeamStats";
import RosterTable from "./RosterTable";

function TeamInfo({ team }) {
  return(
    <Box>
      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        sx={{ my: 3 }}
      >
        <Box
          component="img"
          sx={{ width: "70px", height: "auto" }}
          src={team.logoURL}
          alt=""
          mr={2}
        />
        <Typography variant="h4" component="h2" fontSize={40}>{team.name}</Typography>
      </Stack>

      <Divider sx={{ mt: 1, mb: 3 }} />

      <Typography variant="h4" component="h3" fontSize={32} mb={2}>Standings</Typography>

      {team.conference !== null && <Typography><strong>Conference</strong>: {team.conference}</Typography>}
      {team.division !== null && <Typography><strong>Division</strong>: {team.division}</Typography>}
      <TeamStats teamStats={team.stats} />
      {team.playoffs !== null && <Typography><strong>Playoffs</strong>: {team.playoffs}</Typography>}

      <Typography variant="h4" component="h3" fontSize={32} mt={4} mb={2}>Roster</Typography>

      <Typography variant="h5" component="h3" fontSize={22} mt={2} mb={2}>Forwards</Typography>
      <RosterTable players={team.roster.forwards} />

      <Typography variant="h5" component="h3" fontSize={22} mt={2} mb={2}>Defense</Typography>
      <RosterTable players={team.roster.defensemen} />

      <Typography variant="h5" component="h3" fontSize={22} mt={2} mb={2}>Goalies</Typography>
      <RosterTable players={team.roster.goalies} />
    </Box>
  );
}

export default TeamInfo;