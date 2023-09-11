import { Router } from "express";
import playoffsController from "../controllers/playoffs-controller.js";

const playoffsRoute = Router();
playoffsRoute.get("/:season", playoffsController);

export default playoffsRoute;