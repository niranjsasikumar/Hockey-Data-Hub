import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Box, CssBaseline } from "@mui/material";
import NavBar from "../components/layout/navigation/NavBar";
import { Outlet } from "react-router-dom";
import Footer from "../components/layout/footer/Footer";

function Root() {
  return(
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <CssBaseline />
        <NavBar />
        <Outlet />
        <Footer />
      </Box>
    </LocalizationProvider>
  );
}

export default Root;