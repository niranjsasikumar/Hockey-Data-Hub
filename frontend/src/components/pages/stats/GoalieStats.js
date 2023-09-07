import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Stack, Box, Typography } from "@mui/material";

function GoalieStats({ stats, season }) {
  return(
    <TableContainer component={Paper} elevation={2} sx={{ border: "1px solid lightgrey", borderBottom: "none", mb: 4 }}>
      <Table size="small" aria-label="goalie statistics table">

        <TableHead>
          <TableRow>
            <TableCell sx={{ position: "sticky", left: "0", backgroundColor: "#F7F7F7" }}>Player</TableCell>
            <TableCell align="center">Team</TableCell>
            <TableCell align="center">S/C</TableCell>
            <TableCell align="center">GP</TableCell>
            <TableCell align="center">GS</TableCell>
            <TableCell align="center">W</TableCell>
            {Boolean(season.saveStatsTracked) && <TableCell align="center">SA</TableCell>}
            {Boolean(season.saveStatsTracked) && <TableCell align="center">Svs</TableCell>}
            <TableCell align="center">GA</TableCell>
            {Boolean(season.saveStatsTracked) && <TableCell align="center">Sv%</TableCell>}
            <TableCell align="center">GAA</TableCell>
            <TableCell align="center">SO</TableCell>
            <TableCell align="center">TOI</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {stats?.map((player) => (
            <TableRow key={player.playerId}>
              <TableCell
                component="th"
                scope="row"
                sx={{ maxWidth: { xs: "100px", sm: "max-content" }, position: "sticky", left: "0", backgroundColor: "#F7F7F7" }}
              >
                <Stack
                  direction="row"
                  justifyContent="flex-start"
                  alignItems="center"
                  sx={{ my: 1 }}
                >
                  <Box
                    component="img"
                    src={player.imageURL}
                    alt=""
                    sx={{ display: { xs: "none", sm: "block" }, width: "50px", borderRadius: "50%", border: "1px solid grey", mr: 1.5 }}
                  />
                  <Typography variant="body2">{player.player}</Typography>
                </Stack>
              </TableCell>
              <TableCell align="center">
                <Stack
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                  sx={{ my: 1 }}
                >
                  <Box
                    component="img"
                    sx={{ width: { xs: "30px", sm: "40px" }, height: "auto", mr: 1 }}
                    src={player.teamLogoURL}
                    alt=""
                  />
                  <Typography variant="body2">{player.teamAbbreviation}</Typography>
                </Stack>
              </TableCell>
              <TableCell align="center">{player.catches}</TableCell>
              <TableCell align="center">{player.gamesPlayed}</TableCell>
              <TableCell align="center">{player.gamesStarted}</TableCell>
              <TableCell align="center">{player.wins}</TableCell>
              {Boolean(season.saveStatsTracked) && <TableCell align="center">{player.shotsAgainst}</TableCell>}
              {Boolean(season.saveStatsTracked) && <TableCell align="center">{player.saves}</TableCell>}
              <TableCell align="center">{player.goalsAgainst}</TableCell>
              {Boolean(season.saveStatsTracked) && <TableCell align="center">{player.savePercentage}</TableCell>}
              <TableCell align="center">{player.goalsAgainstAverage}</TableCell>
              <TableCell align="center">{player.shutouts}</TableCell>
              <TableCell align="center">{player.timeOnIce}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        
      </Table>
    </TableContainer>
  );
}

export default GoalieStats;