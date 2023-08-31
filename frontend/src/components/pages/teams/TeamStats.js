import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

function TeamStats({ teamStats }) {
  return(
    <TableContainer component={Paper} elevation={2} sx={{ border: "1px solid lightgrey", borderBottom: "none", mt: 2, mb: 3 }}>
      <Table size="small" aria-label="team statistics table">

        <TableHead>
          <TableRow>
            {teamStats.divisionRank !== null && <TableCell align="center">Division Rank</TableCell>}
            {teamStats.leagueRank !== null && <TableCell align="center">League Rank</TableCell>}
            <TableCell align="center">Pts</TableCell>
            <TableCell align="center">GP</TableCell>
            <TableCell align="center">W</TableCell>
            <TableCell align="center">L</TableCell>
            {teamStats.ties !== null && <TableCell align="center">T</TableCell>}
            {teamStats.overtimeLosses !== null && <TableCell align="center">OTL</TableCell>}
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
          <TableRow>
            {teamStats.divisionRank !== null && <TableCell align="center">{teamStats.divisionRank}</TableCell>}
            {teamStats.leagueRank !== null && <TableCell align="center">{teamStats.leagueRank}</TableCell>}
            <TableCell align="center">{teamStats.points}</TableCell>
            <TableCell align="center">{teamStats.gamesPlayed}</TableCell>
            <TableCell align="center">{teamStats.wins}</TableCell>
            <TableCell align="center">{teamStats.losses}</TableCell>
            {teamStats.ties !== null && <TableCell align="center">{teamStats.ties}</TableCell>}
            {teamStats.overtimeLosses !== null && <TableCell align="center">{teamStats.overtimeLosses}</TableCell>}
            <TableCell align="center">{teamStats.goalsFor}</TableCell>
            <TableCell align="center">{teamStats.goalsAgainst}</TableCell>
            <TableCell align="center">{teamStats.difference}</TableCell>
            <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>{teamStats.homeRecord}</TableCell>
            <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>{teamStats.awayRecord}</TableCell>
            <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>{teamStats.last10}</TableCell>
            <TableCell align="center">{teamStats.streak}</TableCell>
          </TableRow>
        </TableBody>
        
      </Table>
    </TableContainer>
  );
}

export default TeamStats;