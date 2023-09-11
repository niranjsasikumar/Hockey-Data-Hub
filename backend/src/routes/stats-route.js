import { Router } from "express";
import skaterStatsController from "../controllers/skater-stats-controller.js";
import goalieStatsController from "../controllers/goalie-stats-controller.js";

const statsRoute = Router();
statsRoute.get("/skaters", skaterStatsController);
statsRoute.get("/goalies", goalieStatsController);

export default statsRoute;