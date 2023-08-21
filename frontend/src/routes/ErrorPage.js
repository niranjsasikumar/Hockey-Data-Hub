import { useRouteError } from "react-router-dom";
import { Box, Container, Typography, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return(
    <Box sx={{ display: "flex", flexDirection: "column", height: "90vh" }}>
      <Container sx={{ m: "auto", textAlign: "center" }}>
        <Typography variant="h1">404</Typography>
        <Typography variant="h2" gutterBottom>Page not found</Typography>
        <Typography gutterBottom>The requested page could not be found or an error has occurred.</Typography>
        <Link component={RouterLink} to="/" sx={{ typography: "body1" }}>Return to home page</Link>
      </Container>
    </Box>
  );
}

export default ErrorPage;