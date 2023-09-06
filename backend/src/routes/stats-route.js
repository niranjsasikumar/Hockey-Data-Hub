import { Router } from "express";
import skaterStatsController from "../controllers/skater-stats-controller.js";

const statsRoute = Router();
statsRoute.get("/skaters", skaterStatsController);

export default statsRoute;