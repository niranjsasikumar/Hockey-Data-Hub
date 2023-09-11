import { Router } from "express";
import scoresController from "../controllers/scores-controller.js";

const scoresRoute = Router();
scoresRoute.get("/", scoresController);

export default scoresRoute;