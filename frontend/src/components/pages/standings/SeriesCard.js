import { Card, CardContent, Grid, Stack, Box, Typography } from "@mui/material";

function SeriesCard({ series }) {
  return(
    <Card elevation={2} sx={{ border: "1px solid lightgrey" }}>
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        <Grid container>

          <Grid
            item
            xs={6}
            sx={{
              p: 2,
              borderRight: "1px solid lightgrey",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center"
            }}
          >
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
                <Box
                  component="img"
                  sx={{ width: "40px", height: "auto", mr: 1 }}
                  src={series.team1LogoURL}
                  alt=""
                />
                <Typography>{series.team1Abbreviation}</Typography>
              </Box>
            </Stack>
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
            >
              <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
                <Box
                  component="img"
                  sx={{ width: "40px", height: "auto", mr: 1 }}
                  src={series.team2LogoURL}
                  alt=""
                />
                <Typography>{series.team2Abbreviation}</Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid
            item
            xs={6}
            sx={{
              p: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              textAlign: "center"
            }}
          >
            <Typography variant="button">{series.statusShort}</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default SeriesCard;