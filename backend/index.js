import express from "express";
import scoresRoute from "./src/routes/scores-route.js";
import cors from "cors";

// Initialization and configuration
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());

// Routes
app.use("/scores", scoresRoute);

app.listen(port, () => {
  console.log(`Connected. Listening on port ${port}.`);
});