import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Stack, Box, Typography } from "@mui/material";

function SkaterStats({ stats, season }) {
  return(
    <TableContainer component={Paper} elevation={2} sx={{ border: "1px solid lightgrey", borderBottom: "none", mb: 4 }}>
      <Table size="small" aria-label="skater statistics table" sx={{ borderCollapse: "separate" }}>

        <TableHead>
          <TableRow>
            <TableCell sx={{ position: "sticky", left: "0", backgroundColor: "#fff", borderRight: "1px solid lightgrey" }}>Player</TableCell>
            <TableCell align="center">Team</TableCell>
            <TableCell align="center">Pos</TableCell>
            <TableCell align="center">S/C</TableCell>
            <TableCell align="center">GP</TableCell>
            <TableCell align="center">G</TableCell>
            <TableCell align="center">A</TableCell>
            <TableCell align="center">P</TableCell>
            <TableCell align="center">P/GP</TableCell>
            {Boolean(season.powerPlayStatsTracked) && <TableCell align="center">PPG</TableCell>}
            {Boolean(season.powerPlayStatsTracked) && <TableCell align="center">PPP</TableCell>}
            {Boolean(season.shootingStatsTracked) && <TableCell align="center">S</TableCell>}
            {Boolean(season.shootingStatsTracked) && <TableCell align="center">S%</TableCell>}
            {Boolean(season.faceoffStatsTracked) && <TableCell align="center">FOW%</TableCell>}
          </TableRow>
        </TableHead>

        <TableBody>
          {stats?.map((player) => (
            <TableRow key={player.playerId}>
              <TableCell
                component="th"
                scope="row"
                sx={{ maxWidth: { xs: "100px", sm: "max-content" }, position: "sticky", left: "0", backgroundColor: "#fff", borderRight: "1px solid lightgrey" }}
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
              <TableCell align="center">{player.position}</TableCell>
              <TableCell align="center">{player.shoots}</TableCell>
              <TableCell align="center">{player.gamesPlayed}</TableCell>
              <TableCell align="center">{player.goals}</TableCell>
              <TableCell align="center">{player.assists}</TableCell>
              <TableCell align="center">{player.points}</TableCell>
              <TableCell align="center">{player.pointsPerGamesPlayed}</TableCell>
              {Boolean(season.powerPlayStatsTracked) && <TableCell align="center">{player.powerPlayGoals}</TableCell>}
              {Boolean(season.powerPlayStatsTracked) && <TableCell align="center">{player.powerPlayPoints}</TableCell>}
              {Boolean(season.shootingStatsTracked) && <TableCell align="center">{player.shots}</TableCell>}
              {Boolean(season.shootingStatsTracked) && <TableCell align="center">{player.shootingPercentage}</TableCell>}
              {Boolean(season.faceoffStatsTracked) && <TableCell align="center">{player.faceoffPercentage}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
        
      </Table>
    </TableContainer>
  );
}

export default SkaterStats;