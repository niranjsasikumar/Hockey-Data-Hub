import scoresImg from "../../../images/scores.jpg"
import standingsImg from "../../../images/standings.jpg"
import scheduleImg from "../../../images/schedule.jpg"
import statsImg from "../../../images/stats.jpg"
import teamsImg from "../../../images/teams.jpg"
import { Container, Grid } from "@mui/material";
import LinkCard from "./LinkCard";

const cardItems = [
  {
    text: "Scores",
    image: scoresImg,
    link: "scores"
  },
  {
    text: "Standings",
    image: standingsImg,
    link: "standings"
  },
  {
    text: "Schedule",
    image: scheduleImg,
    link: "schedule"
  },
  {
    text: "Stats",
    image: statsImg,
    link: "stats"
  },
  {
    text: "Teams",
    image: teamsImg,
    link: "teams"
  }
];

function Home() {
  return(
    <Container maxWidth={false} sx={{ maxWidth: "1300px", py: 3 }}>
      <Grid container spacing={2} sx={{ px: 1.5 }}>
        {cardItems.map((item) => (
          <Grid item key={item.text} xs={12} sm={6} md={4}>
            <LinkCard text={item.text} image={item.image} link={item.link} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Home;