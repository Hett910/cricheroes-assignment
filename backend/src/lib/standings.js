import { basePointsTable } from "../data/pointsTable.js";
import {
  calculateNetRunRate,
  cloneStanding,
  createTeamStanding,
} from "./cricketMath.js";

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

export function cloneStandings(standings) {
  return standings.map((standing) => cloneStanding(standing));
}

export function recomputeTeamNrr(standing) {
  standing.nrr = calculateNetRunRate(
    standing.forRuns,
    standing.forBalls,
    standing.againstRuns,
    standing.againstBalls,
  );
}

export function recomputeTableNrr(standings) {
  standings.forEach(recomputeTeamNrr);
}

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

export function findTeamStanding(standings, team) {
  return standings.find(
    (entry) => entry.team.toLowerCase() === team.toLowerCase(),
  );
}

