import { Router } from "express";
import teamsListController from "../controllers/teams-list-controller.js";

const teamsRoute = Router();
teamsRoute.get("/list/:season", teamsListController);

export default teamsRoute;