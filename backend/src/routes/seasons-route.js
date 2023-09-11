import { Router } from "express";
import seasonsListController from "../controllers/seasons-list-controller.js";
import seasonInfoController from "../controllers/season-info-controller.js";

const seasonsRoute = Router();
seasonsRoute.get("/list", seasonsListController);
seasonsRoute.get("/info/:season", seasonInfoController);

export default seasonsRoute;