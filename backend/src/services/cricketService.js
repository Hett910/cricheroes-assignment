import { loadBaseStandings } from "../lib/standings.js";
import { findRestrictionRange, findChaseRange } from "../lib/scenarioSearch.js";

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
