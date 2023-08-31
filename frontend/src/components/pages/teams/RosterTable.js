import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Stack, Box, Typography } from "@mui/material";

function RosterTable({ players }) {
  return(
    <TableContainer component={Paper} elevation={2} sx={{ border: "1px solid lightgrey", borderBottom: "none", mb: 4 }}>
      <Table size="small" aria-label="roster forwards table">

        <TableHead>
          <TableRow>
            <TableCell sx={{ position: "sticky", left: "0", backgroundColor: "#F7F7F7" }}>Player</TableCell>
            <TableCell align="center">No</TableCell>
            {"Position" in players[0] && <TableCell align="center">Pos</TableCell>}
            {"Shoots" in players[0] && <TableCell align="center">Sh</TableCell>}
            {"Catches" in players[0] && <TableCell align="center">Ca</TableCell>}
            <TableCell align="center">Ht</TableCell>
            <TableCell align="center">Wt</TableCell>
            <TableCell align="center">DOB</TableCell>
            <TableCell align="center">POB</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {players.map((player) => (
            <TableRow key={player.PlayerID}>
              <TableCell
                component="th"
                scope="row"
                sx={{ maxWidth: "max-content", position: "sticky", left: "0", backgroundColor: "#F7F7F7" }}
              >
                <Stack
                  direction="row"
                  justifyContent="flex-start"
                  alignItems="center"
                  sx={{ my: 1, maxWidth: "max-content" }}
                >
                  <Box
                    component="img"
                    src={player.ImageURL}
                    alt=""
                    sx={{ display: { xs: "none", sm: "block" }, width: "50px", borderRadius: "50%", border: "1px solid grey", mr: 1.5 }}
                  />
                  <Typography variant="body2">{player.Player}{Boolean(player.Captain) && " (C)"}{Boolean(player.AlternateCaptain) && " (A)"}</Typography>
                </Stack>
              </TableCell>
              <TableCell align="center">{player.Number}</TableCell>
              {"Position" in player && <TableCell align="center">{player.Position}</TableCell>}
              {"Shoots" in player && <TableCell align="center">{player.Shoots}</TableCell>}
              {"Catches" in player && <TableCell align="center">{player.Catches}</TableCell>}
              <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>{player.Height}</TableCell>
              <TableCell align="center">{player.Weight}</TableCell>
              <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>{player.DateOfBirth}</TableCell>
              <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>{player.PlaceOfBirth}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        
      </Table>
    </TableContainer>
  );
}

export default RosterTable;