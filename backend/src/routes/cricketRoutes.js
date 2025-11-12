import express from "express";
import { getTeams, calculateScenario } from "../controllers/cricketController.js";

const router = express.Router();

router.get("/teams", getTeams);
router.post("/scenario", calculateScenario);

export default router;
