import { Box, Drawer, Stack, Typography, IconButton, Divider, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { Link } from "react-router-dom";

function NavDrawer({ navItems, drawerOpen, handleDrawerToggle }) {
  return(
    <Box component="nav">
      <Drawer
        variant="temporary"
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: "100%", backgroundColor: "#2e2e2e" }
        }}
      >
        <Box onClick={handleDrawerToggle} sx={{ backgroundColor: "#2e2e2e", color: "#fff" }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ m: 2 }}
          >
            <Typography variant="h6">
              Hockey Data Hub
            </Typography>
            <IconButton aria-label="close" sx={{ backgroundColor: "#fff" }}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Divider variant="middle" sx={{ backgroundColor: "#fff" }} />
          <List>
            {navItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton component={Link} to={item.link}>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
}

export default NavDrawer;