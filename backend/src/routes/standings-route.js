import { Router } from "express";
import standingsController from "../controllers/standings-controller.js";

const standingsRoute = Router();
standingsRoute.get("/:season", standingsController);

export default standingsRoute;