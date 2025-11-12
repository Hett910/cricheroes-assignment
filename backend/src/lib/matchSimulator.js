import {
  cloneStandings,
  findTeamStanding,
  loadBaseStandings,
  recomputeTableNrr,
  sortStandings,
} from "./standings.js";

function resolveOutcome(detail, your, opponent) {
  if (detail.yourRuns > detail.opponentRuns) {
    return "your-win";
  }
  if (detail.yourRuns < detail.opponentRuns) {
    return "opponent-win";
  }

  // When chasing and matching the opponent's total, treat as a win (target achieved).
  if (detail.yourTeamChasing) {
    return "your-win";
  }

  return "tie";
}

function updateResultStats(outcome, your, opponent) {
  switch (outcome) {
    case "your-win":
      your.won += 1;
      your.points += 2;
      opponent.lost += 1;
      break;
    case "opponent-win":
      opponent.won += 1;
      opponent.points += 2;
      your.lost += 1;
      break;
    case "tie":
      your.points += 1;
      opponent.points += 1;
      break;
    default:
      break;
  }
}

export function simulateMatch(detail) {
  const base = loadBaseStandings();
  const standings = cloneStandings(base);

  const your = findTeamStanding(standings, detail.yourTeam);
  const opponent = findTeamStanding(standings, detail.opponentTeam);

  if (!your || !opponent) {
    throw new Error("Team not found in the base standings");
  }

  your.matches += 1;
  opponent.matches += 1;

  your.forRuns += detail.yourRuns;
  your.forBalls += detail.yourBalls;
  your.againstRuns += detail.opponentRuns;
  your.againstBalls += detail.opponentBalls;

  opponent.forRuns += detail.opponentRuns;
  opponent.forBalls += detail.opponentBalls;
  opponent.againstRuns += detail.yourRuns;
  opponent.againstBalls += detail.yourBalls;

  const outcome = resolveOutcome(detail, your, opponent);
  updateResultStats(outcome, your, opponent);

  recomputeTableNrr(standings);
  const sortedStandings = sortStandings(standings);

  const refreshedYour = findTeamStanding(standings, detail.yourTeam);
  const refreshedOpponent = findTeamStanding(standings, detail.opponentTeam);

  if (!refreshedYour || !refreshedOpponent) {
    throw new Error("Unexpected error refreshing standings");
  }

  return {
    standings,
    sortedStandings,
    yourTeamStanding: refreshedYour,
    opponentStanding: refreshedOpponent,
  };
}

