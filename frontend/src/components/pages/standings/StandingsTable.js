import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Stack, Box, Typography } from "@mui/material";

function StandingsTable({ standings, season }) {
  return(
    <TableContainer component={Paper} elevation={2} sx={{ border: "1px solid lightgrey", borderBottom: "none", mb: 4 }}>
      <Table size="small" aria-label="standings table" sx={{ borderCollapse: "separate" }}>

        <TableHead>
          <TableRow>
            <TableCell sx={{ position: "sticky", left: "0", backgroundColor: "#fff", borderRight: "1px solid lightgrey" }}>Team</TableCell>
            <TableCell align="center">Pts</TableCell>
            <TableCell align="center">GP</TableCell>
            <TableCell align="center">W</TableCell>
            <TableCell align="center">L</TableCell>
            {Boolean(season.tiesInUse) && <TableCell align="center">T</TableCell>}
            {Boolean(season.overtimeLossPointInUse) && <TableCell align="center">OTL</TableCell>}
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
          {standings?.map((team) => (
            <TableRow key={team.teamId}>
              <TableCell
              component="th"
              scope="row"
              sx={{
                whiteSpace: "nowrap",
                position: "sticky",
                left: "0",
                backgroundColor: "#fff",
                borderLeft: team.clinchIndicator !== null ? "3px solid #160085" : "none",
                borderRight: "1px solid lightgrey",
                boxSizing: "border-box"
              }}
              >
                <Stack
                  direction="row"
                  justifyContent="flex-start"
                  alignItems="center"
                  sx={{ my: 1 }}
                >
                  <Box
                    component="img"
                    sx={{ width: "30px", height: "auto", mr: 1 }}
                    src={team.logoURL}
                    alt=""
                  />
                  <Typography variant="body2" sx={{ display: { xs: "none", sm: "block" } }}>{team.teamShortName}</Typography>
                  <Typography variant="body2" sx={{ display: { xs: "block", sm: "none" } }}>{team.teamAbbreviation}</Typography>
                </Stack>
              </TableCell>
              <TableCell align="center">{team.points}</TableCell>
              <TableCell align="center">{team.gamesPlayed}</TableCell>
              <TableCell align="center">{team.wins}</TableCell>
              <TableCell align="center">{team.losses}</TableCell>
              {Boolean(season.tiesInUse) && <TableCell align="center">{team.ties}</TableCell>}
              {Boolean(season.overtimeLossPointInUse) && <TableCell align="center">{team.overtimeLosses}</TableCell>}
              <TableCell align="center">{team.goalsFor}</TableCell>
              <TableCell align="center">{team.goalsAgainst}</TableCell>
              <TableCell align="center">{team.difference}</TableCell>
              <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>{team.homeRecord}</TableCell>
              <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>{team.awayRecord}</TableCell>
              <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>{team.last10}</TableCell>
              <TableCell align="center">{team.streak}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        
      </Table>
    </TableContainer>
  );
}

export default StandingsTable;