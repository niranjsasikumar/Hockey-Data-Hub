import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Stack, Box, Typography } from "@mui/material";

function StandingsTable({ standings, season }) {
  return(
    <TableContainer component={Paper} elevation={2} sx={{ border: "1px solid lightgrey", borderBottom: "none", mb: 4 }}>
      <Table size="small" aria-label="standings table">

        <TableHead>
          <TableRow>
            <TableCell sx={{ position: "sticky", left: "0", backgroundColor: "#F7F7F7" }}>Team</TableCell>
            <TableCell align="center">Pts</TableCell>
            <TableCell align="center">GP</TableCell>
            <TableCell align="center">W</TableCell>
            <TableCell align="center">L</TableCell>
            {Boolean(season.TiesInUse) && <TableCell align="center">T</TableCell>}
            {Boolean(season.OvertimeInUse) && <TableCell align="center">OTL</TableCell>}
            <TableCell align="center">GF</TableCell>
            <TableCell align="center">GA</TableCell>
            <TableCell align="center">Diff</TableCell>
            <TableCell align="center">Home</TableCell>
            <TableCell align="center">Away</TableCell>
            <TableCell align="center">L10</TableCell>
            <TableCell align="center">Strk</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {standings.map((team) => (
            <TableRow key={team.Name}>
              <TableCell component="th" scope="row" sx={{ whiteSpace: "nowrap", position: "sticky", left: "0", backgroundColor: "#F7F7F7" }}>
                <Stack
                  direction="row"
                  justifyContent="flex-start"
                  alignItems="center"
                  sx={{ my: 1 }}
                >
                  <Box
                    component="img"
                    sx={{ width: "30px", height: "auto", mr: 1 }}
                    src={team.LogoURL}
                    alt=""
                  />
                  <Typography variant="body2" sx={{ display: { xs: "none", sm: "block" } }}>{team.Name}</Typography>
                  <Typography variant="body2" sx={{ display: { xs: "block", sm: "none" } }}>{team.Abbreviation}</Typography>
                </Stack>
              </TableCell>
              <TableCell align="center">{team.Points}</TableCell>
              <TableCell align="center">{team.GamesPlayed}</TableCell>
              <TableCell align="center">{team.Wins}</TableCell>
              <TableCell align="center">{team.Losses}</TableCell>
              {Boolean(season.TiesInUse) && <TableCell align="center">{team.Ties}</TableCell>}
              {Boolean(season.OvertimeInUse) && <TableCell align="center">{team.OvertimeLosses}</TableCell>}
              <TableCell align="center">{team.GoalsFor}</TableCell>
              <TableCell align="center">{team.GoalsAgainst}</TableCell>
              <TableCell align="center">{team.Difference}</TableCell>
              <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>{team.HomeRecord}</TableCell>
              <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>{team.AwayRecord}</TableCell>
              <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>{team.Last10}</TableCell>
              <TableCell align="center">{team.Streak}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        
      </Table>
    </TableContainer>
  );
}

export default StandingsTable;