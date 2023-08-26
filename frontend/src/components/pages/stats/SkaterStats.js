import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Stack, Box, Typography } from "@mui/material";

function SkaterStats({ stats }) {
  return(
    <TableContainer component={Paper} elevation={2} sx={{ border: "1px solid lightgrey", borderBottom: "none", mt: 5, mb: 4 }}>
      <Table size="small" aria-label="skater statistics table">

        <TableHead>
          <TableRow>
            <TableCell sx={{ position: "sticky", left: "0", backgroundColor: "#F7F7F7" }}>Player</TableCell>
            <TableCell align="center">Team</TableCell>
            <TableCell align="center">Pos</TableCell>
            <TableCell align="center">S/C</TableCell>
            {stats.columns.map((column) => (
              <TableCell align="center" key={column.abbreviation}>{column.abbreviation}</TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {stats.players.map((player) => (
            <TableRow key={player.PlayerID}>
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
                    src={player.ImageURL}
                    alt=""
                    sx={{ display: { xs: "none", sm: "block" }, width: "50px", borderRadius: "50%", border: "1px solid grey", mr: 1.5 }}
                  />
                  <Typography variant="body2">{player.Player}</Typography>
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
                    src={player.TeamLogoURL}
                    alt=""
                  />
                  <Typography variant="body2">{player.TeamAbbreviation}</Typography>
                </Stack>
              </TableCell>
              <TableCell align="center">{player.Position}</TableCell>
              <TableCell align="center">{player.Shoots}</TableCell>
              {player.GamesPlayed !== null && <TableCell align="center">{player.GamesPlayed}</TableCell>}
              {player.Goals !== null && <TableCell align="center">{player.Goals}</TableCell>}
              {player.Assists !== null && <TableCell align="center">{player.Assists}</TableCell>}
              {player.Points !== null && <TableCell align="center">{player.Points}</TableCell>}
              {player.PointsPerGamesPlayed !== null && <TableCell align="center">{player.PointsPerGamesPlayed}</TableCell>}
              {player.PowerPlayGoals !== null && <TableCell align="center">{player.PowerPlayGoals}</TableCell>}
              {player.PowerPlayPoints !== null && <TableCell align="center">{player.PowerPlayPoints}</TableCell>}
              {player.Shots !== null && <TableCell align="center">{player.Shots}</TableCell>}
              {player.ShootingPercentage !== null && <TableCell align="center">{player.ShootingPercentage}</TableCell>}
              {player.FaceoffPercentage !== null && <TableCell align="center">{player.FaceoffPercentage}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
        
      </Table>
    </TableContainer>
  );
}

export default SkaterStats;