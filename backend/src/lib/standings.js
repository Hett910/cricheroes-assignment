import { basePointsTable } from "../data/pointsTable.js";
import {
  calculateNetRunRate,
  cloneStanding,
  createTeamStanding,
} from "./cricketMath.js";

// Generates the base standings array by creating team standings and calculating each team’s net run rate (NRR).
export function loadBaseStandings() {
  return basePointsTable.map((record) => {
    const standing = createTeamStanding(record);
    return {
      ...standing,
      nrr: calculateNetRunRate(
        standing.forRuns,
        standing.forBalls,
        standing.againstRuns,
        standing.againstBalls,
      ),
    };
  });
}

// Creates a new array of team standings by cloning each record from the original standings
export function cloneStandings(standings) {
  return standings.map((standing) => cloneStanding(standing));
}

// Recalculates and updates a team’s net run rate (NRR) in the given standing object.
export function recomputeTeamNrr(standing) {
  standing.nrr = calculateNetRunRate(
    standing.forRuns,
    standing.forBalls,
    standing.againstRuns,
    standing.againstBalls,
  );
}

// Recalculates the net run rate (NRR) for each team in the given standings array.
export function recomputeTableNrr(standings) {
  standings.forEach(recomputeTeamNrr);
}

// Sorts the given standings array based on points, NRR, and team name. e.g by points desc, NRR desc, name asc.
export function sortStandings(standings) {
  return [...standings].sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    if (b.nrr !== a.nrr) {
      return b.nrr - a.nrr;
    }
    return a.team.localeCompare(b.team);
  });
}

// Finds and returns the standing object for the specified team (case-insensitive) from the standings array.
export function findTeamStanding(standings, team) {
  return standings.find(
    (entry) => entry.team.toLowerCase() === team.toLowerCase(),
  );
}

