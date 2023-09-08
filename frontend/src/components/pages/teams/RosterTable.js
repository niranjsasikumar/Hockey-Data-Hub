import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Stack, Box, Typography } from "@mui/material";

function RosterTable({ players }) {
  return(
    <TableContainer component={Paper} elevation={2} sx={{ border: "1px solid lightgrey", borderBottom: "none", mb: 4 }}>
      <Table size="small" aria-label="roster forwards table" sx={{ borderCollapse: "separate" }}>

        <TableHead>
          <TableRow>
            <TableCell sx={{ position: "sticky", left: "0", backgroundColor: "#fff", borderRight: "1px solid lightgrey" }}>Player</TableCell>
            <TableCell align="center">No</TableCell>
            {"position" in players[0] && <TableCell align="center">Pos</TableCell>}
            {"shoots" in players[0] && <TableCell align="center">Sh</TableCell>}
            {"catches" in players[0] && <TableCell align="center">Ca</TableCell>}
            <TableCell align="center">Ht</TableCell>
            <TableCell align="center">Wt</TableCell>
            <TableCell align="center">DOB</TableCell>
            <TableCell align="center">POB</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {players.map((player) => (
            <TableRow key={player.id}>
              <TableCell
                component="th"
                scope="row"
                sx={{ maxWidth: "max-content", position: "sticky", left: "0", backgroundColor: "#fff", borderRight: "1px solid lightgrey" }}
              >
                <Stack
                  direction="row"
                  justifyContent="flex-start"
                  alignItems="center"
                  sx={{ my: 1, maxWidth: "max-content" }}
                >
                  <Box
                    component="img"
                    src={player.imageURL}
                    alt=""
                    sx={{ display: { xs: "none", sm: "block" }, width: "50px", borderRadius: "50%", border: "1px solid grey", mr: 1.5 }}
                  />
                  <Typography variant="body2">{player.name}{Boolean(player.captain) && " (C)"}{Boolean(player.alternateCaptain) && " (A)"}</Typography>
                </Stack>
              </TableCell>
              <TableCell align="center">{player.number}</TableCell>
              {"position" in player && <TableCell align="center">{player.position}</TableCell>}
              {"shoots" in player && <TableCell align="center">{player.shoots}</TableCell>}
              {"catches" in player && <TableCell align="center">{player.catches}</TableCell>}
              <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>{player.height}</TableCell>
              <TableCell align="center">{player.weight}</TableCell>
              <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>{player.dateOfBirth}</TableCell>
              <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>{player.placeOfBirth}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        
      </Table>
    </TableContainer>
  );
}

export default RosterTable;