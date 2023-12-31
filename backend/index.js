import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import scoresRoute from "./src/routes/scores-route.js";
import scheduleRoute from "./src/routes/schedule-route.js";
import teamsRoute from "./src/routes/teams-route.js";
import seasonsRoute from "./src/routes/seasons-route.js";
import standingsRoute from "./src/routes/standings-route.js";
import playoffsRoute from "./src/routes/playoffs-route.js";
import statsRoute from "./src/routes/stats-route.js";

// Initialization and configuration
const app = express();
dotenv.config();
const port = process.env.API_PORT;
app.use(cors());

// Routes
app.use("/scores", scoresRoute);
app.use("/schedule", scheduleRoute);
app.use("/teams", teamsRoute);
app.use("/seasons", seasonsRoute);
app.use("/standings", standingsRoute);
app.use("/playoffs", playoffsRoute);
app.use("/stats", statsRoute);

app.listen(port, () => {
  console.log(`Connected. Listening on port ${port}.`);
});