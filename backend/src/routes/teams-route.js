import { Router } from "express";
import teamsListController from "../controllers/teams-list-controller.js";
import teamInfoController from "../controllers/team-info-controller.js";

const teamsRoute = Router();
teamsRoute.get("/list/:season", teamsListController);
teamsRoute.get("/info", teamInfoController);

export default teamsRoute;