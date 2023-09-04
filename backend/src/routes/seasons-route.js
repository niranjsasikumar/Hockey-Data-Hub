import { Router } from "express";
import seasonsController from "../controllers/seasons-controller.js";

const seasonsRoute = Router();
seasonsRoute.get("/", seasonsController);

export default seasonsRoute;