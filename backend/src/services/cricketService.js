import { loadBaseStandings } from "../lib/standings.js";
import { findRestrictionRange, findChaseRange } from "../lib/scenarioSearch.js";

// Retrieves the list of teams along with their current standings from the base points table.
export const getTeamsService = () => {
  const standings = loadBaseStandings();
  return standings.map((team) => ({
    team: team.team,
    matches: team.matches,
    won: team.won,
    lost: team.lost,
    nrr: team.nrr,
    points: team.points,
  }));
};

// Calculates the scenario based on the given parameters. e.g whether batting first or bowling first, and finds the required runs/overs and NRR ranges to achieve the desired league position.
export const calculateScenarioService = (data) => {
  const { yourTeam, opponentTeam, totalOvers, desiredPosition, toss, runs } = data;
  if (toss === "batting-first") {
    const result = findRestrictionRange({
      yourTeam,
      opponentTeam,
      totalOvers,
      desiredPosition,
      yourRuns: runs,
    });
    return {
      scenarioType: "batting-first",
      restrictionRange: {
        minRuns: result.minRuns,
        maxRuns: result.maxRuns,
        overs: totalOvers,
        nrrRange: {
          min: Number(result.minNrr.toFixed(3)),
          max: Number(result.maxNrr.toFixed(3)),
        },
      },
    };
  }
  const chaseResult = findChaseRange({
    yourTeam,
    opponentTeam,
    totalOvers,
    desiredPosition,
    targetRuns: runs,
  });
  return {
    scenarioType: "bowling-first",
    chaseRange: {
      runs,
      minOvers: chaseResult.minOvers,
      maxOvers: chaseResult.maxOvers,
      nrrRange: {
        min: Number(chaseResult.minNrr.toFixed(3)),
        max: Number(chaseResult.maxNrr.toFixed(3)),
      },
    },
  };
};
