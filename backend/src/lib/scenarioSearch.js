import { BALLS_PER_OVER, ballsToOversDecimal } from "./cricketMath.js";
import { simulateMatch } from "./matchSimulator.js";
import { findTeamStanding, sortStandings } from "./standings.js";

export function findRestrictionRange(config) {
  const totalBalls = config.totalOvers * BALLS_PER_OVER;
  let minRuns = null;
  let maxRuns = null;
  let minNrr = null;
  let maxNrr = null;

  for (let opponentRuns = 0; opponentRuns <= config.yourRuns; opponentRuns += 1) {
    const result = simulateMatch({
      yourTeam: config.yourTeam,
      opponentTeam: config.opponentTeam,
      yourRuns: config.yourRuns,
      yourBalls: totalBalls,
      opponentRuns,
      opponentBalls: totalBalls,
      yourTeamChasing: false,
    });

    const sorted = sortStandings(result.standings);
    const rank = sorted.findIndex(
      (entry) => entry.team.toLowerCase() === config.yourTeam.toLowerCase(),
    );

    if (rank === -1) {
      continue;
    }

    const position = rank + 1;
    if (position !== config.desiredPosition) {
      continue;
    }

    const yourTeam = findTeamStanding(result.standings, config.yourTeam);
    if (!yourTeam) {
      continue;
    }

    minRuns = minRuns === null ? opponentRuns : Math.min(minRuns, opponentRuns);
    maxRuns = maxRuns === null ? opponentRuns : Math.max(maxRuns, opponentRuns);
    minNrr = minNrr === null ? yourTeam.nrr : Math.min(minNrr, yourTeam.nrr);
    maxNrr = maxNrr === null ? yourTeam.nrr : Math.max(maxNrr, yourTeam.nrr);
  }

  if (minRuns === null || maxRuns === null || minNrr === null || maxNrr === null) {
    throw new Error("Unable to find a valid restriction range for the inputs.");
  }

  return { minRuns, maxRuns, minNrr, maxNrr };
}

export function findChaseRange(config) {
  const totalBalls = config.totalOvers * BALLS_PER_OVER;
  let minBalls = null;
  let maxBalls = null;
  let minNrr = null;
  let maxNrr = null;

  for (let balls = 1; balls <= totalBalls; balls += 1) {
    const result = simulateMatch({
      yourTeam: config.yourTeam,
      opponentTeam: config.opponentTeam,
      yourRuns: config.targetRuns,
      yourBalls: balls,
      opponentRuns: config.targetRuns,
      opponentBalls: totalBalls,
      yourTeamChasing: true,
    });

    const sorted = sortStandings(result.standings);
    const rank = sorted.findIndex(
      (entry) => entry.team.toLowerCase() === config.yourTeam.toLowerCase(),
    );

    if (rank === -1) {
      continue;
    }

    const position = rank + 1;
    if (position !== config.desiredPosition) {
      continue;
    }

    const yourTeam = findTeamStanding(result.standings, config.yourTeam);
    if (!yourTeam) {
      continue;
    }

    minBalls = minBalls === null ? balls : Math.min(minBalls, balls);
    maxBalls = maxBalls === null ? balls : Math.max(maxBalls, balls);
    minNrr = minNrr === null ? yourTeam.nrr : Math.min(minNrr, yourTeam.nrr);
    maxNrr = maxNrr === null ? yourTeam.nrr : Math.max(maxNrr, yourTeam.nrr);
  }

  if (minBalls === null || maxBalls === null || minNrr === null || maxNrr === null) {
    throw new Error("Unable to compute chase range for the inputs.");
  }

  return {
    minOvers: ballsToOversDecimal(minBalls),
    maxOvers: ballsToOversDecimal(maxBalls),
    minNrr,
    maxNrr,
  };
}

