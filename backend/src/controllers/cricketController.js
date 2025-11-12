// src/controllers/cricketController.js
import { z } from "zod";
import { getTeamsService, calculateScenarioService } from "../services/cricketService.js"; // ✅ Correct path

// Input validation schema
const scenarioSchema = z.object({
  yourTeam: z.string().min(1),
  opponentTeam: z.string().min(1),
  totalOvers: z.number().int().positive().max(20),
  desiredPosition: z.number().int().positive(),
  toss: z.enum(["batting-first", "bowling-first"]),
  runs: z.number().int().nonnegative(),
});

// Controller: Get all teams
export const getTeams = (_req, res) => {
  try {
    const teams = getTeamsService(); 
    res.json({ teams });
  } catch (error) {
    res.status(500).json({ error: "Failed to load teams." });
  }
};

// Controller: Calculate scenario
export const calculateScenario = (req, res) => {
  const parsed = scenarioSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.issues });
  }

  try {
    const result = calculateScenarioService(parsed.data); // ✅ All logic handled in service
    res.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to compute scenario.";
    res.status(422).json({ error: message });
  }
};
