import { Router } from "express";
import scheduleController from "../controllers/schedule-controller.js";

const scheduleRoute = Router();
scheduleRoute.get("/", scheduleController);

export default scheduleRoute;