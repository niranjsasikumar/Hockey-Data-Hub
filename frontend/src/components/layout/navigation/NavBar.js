import * as React from "react";
import { AppBar, Container, Toolbar, Box, Button, IconButton } from "@mui/material";
import { Link } from "react-router-dom";
import logo from "../../../images/hdh_logo.png"
import MenuIcon from "@mui/icons-material/Menu";
import NavDrawer from "./NavDrawer";
import "./NavBar.css"

const navItems = [
  {
    text: "Home",
    link: "/"
  },
  {
    text: "Scores",
    link: "scores"
  },
  {
    text: "Standings",
    link: "standings"
  },
  {
    text: "Schedule",
    link: "schedule"
  },
  {
    text: "Stats",
    link: "stats"
  },
  {
    text: "Teams",
    link: "teams"
  }
];

function NavBar() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen((prevState) => !prevState);
  };

  return (
    <>
      <AppBar component="nav" position="sticky" sx={{ backgroundColor: "#2e2e2e"}}>
        <Container disableGutters maxWidth={false} sx={{ maxWidth: "1300px", px: 1 }}>
          <Toolbar>
            <Box sx={{ flexGrow: 1 }}>
              <Link to="/" className="logo-button">
                <img src={logo} alt="home" />
              </Link>
            </Box>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              {navItems.slice(1).map((item) => (
                <Button component={Link} to={item.link} key={item.text} sx={{ color: "#fff", ml: 1 }}>
                  {item.text}
                </Button>
              ))}
            </Box>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ m: 0, display: { sm: "none" } }}
            >
              <MenuIcon fontSize="large" />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>
      <NavDrawer {...{...{navItems, drawerOpen, handleDrawerToggle}}} />
    </>
  );
}

export default NavBar;