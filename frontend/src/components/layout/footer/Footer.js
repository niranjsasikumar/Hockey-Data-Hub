import { Box, Container, Typography } from "@mui/material";

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: "auto",
        backgroundColor: "#2e2e2e",
        color: "white",
      }}
    >
      <Container maxWidth={false} sx={{ maxWidth: "1300px" }}>
        <Typography variant="body1" sx={{ textAlign: "center" }}>
          This app is not affiliated with or endorsed by the National Hockey League. Any trademarks used in this app are done so under "fair use" with the sole purpose of identifying the respective entities, and remain the property of their respective owners.
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;