import { Card, CardContent, Grid, Stack, Box, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function ScoreCard({ game }) {
  return(
    <Card elevation={3} sx={{ border: "1px solid lightgrey" }}>
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        <Grid container>

          <Grid
            item
            xs={7}
            md={8}
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
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
                <Box
                  component="img"
                  sx={{ width: "50px", height: "auto", mr: 1 }}
                  src={game.AwayLogoURL}
                  alt=""
                />
                <Typography variant="h6" component="p" sx={{ display: { xs: "none", md: "block" } }}>{game.AwayShortName}</Typography>
                <Typography variant="h6" component="p" sx={{ display: { xs: "block", md: "none" } }}>{game.AwayAbbreviation}</Typography>
              </Box>
              <Typography variant="h6" component="p" fontSize={28}>{game.AwayGoals}</Typography>
            </Stack>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
                <Box
                  component="img"
                  sx={{ width: "50px", height: "auto", mr: 1 }}
                  src={game.HomeLogoURL}
                  alt=""
                />
                <Typography variant="h6" component="p" sx={{ display: { xs: "none", md: "block" } }}>{game.HomeShortName}</Typography>
                <Typography variant="h6" component="p" sx={{ display: { xs: "block", md: "none" } }}>{game.HomeAbbreviation}</Typography>
              </Box>
              <Typography variant="h6" component="p" fontSize={28}>{game.HomeGoals}</Typography>
            </Stack>
          </Grid>

          <Grid
            item
            xs={5}
            md={4}
            sx={{
              p: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              textAlign: "center"
            }}
          >
            <Typography variant="body2" sx={{ mb: 1 }}>{game.PlayoffRound ? game.PlayoffRound : game.Type}</Typography>
            {game.PlayoffGameNumber && <Typography variant="body2" sx={{ mb: 1 }}>{game.PlayoffGameNumber}</Typography>}
            <Typography variant="button">{game.GameStatus}</Typography>
          </Grid>
        </Grid>

        <Accordion disableGutters sx={{ borderTop: "1px solid lightgrey" }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ flexDirection: "row-reverse" }}
          >
            <Typography variant="h6" component="p" sx={{ ml: 1 }}>Goals</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container>
              <Grid item xs={2}>
                <Typography>{game.AwayAbbreviation}</Typography>
              </Grid>
              <Grid item xs={10} sx={{ mb: 2 }}>
                <Typography>{game.AwayGoalScorers}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography>{game.HomeAbbreviation}</Typography>
              </Grid>
              <Grid item xs={10}>
                <Typography>{game.HomeGoalScorers}</Typography>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
}

export default ScoreCard;