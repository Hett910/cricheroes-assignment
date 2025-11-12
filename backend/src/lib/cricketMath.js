export const BALLS_PER_OVER = 6;

export function oversToBalls(overs) {
  const oversInt = Math.trunc(overs);
  const fraction = Number((overs - oversInt).toFixed(1));
  const balls = Math.round((fraction || 0) * 10);
  if (balls >= BALLS_PER_OVER) {
    throw new Error(`Invalid overs value: ${overs}`);
  }
  return oversInt * BALLS_PER_OVER + balls;
}

export function oversStringToBalls(value) {
  if (!value.includes("/")) {
    throw new Error(`Invalid runs/overs string: ${value}`);
  }
  const [, oversPart] = value.split("/");
  if (!oversPart) {
    throw new Error(`Invalid overs section in ${value}`);
  }
  const [oversWhole, ballsPart = "0"] = oversPart.split(".");
  const oversInt = Number(oversWhole);
  const balls = Number(ballsPart);
  if (
    Number.isNaN(oversInt) ||
    Number.isNaN(balls) ||
    balls < 0 ||
    balls >= BALLS_PER_OVER
  ) {
    throw new Error(`Invalid overs value: ${value}`);
  }
  return oversInt * BALLS_PER_OVER + balls;
}

export function runsStringToNumber(value) {
  const [runsPart] = value.split("/");
  const runs = Number(runsPart);
  if (Number.isNaN(runs)) {
    throw new Error(`Invalid runs value: ${value}`);
  }
  return runs;
}

export function parseRunsOvers(value) {
  return {
    runs: runsStringToNumber(value),
    balls: oversStringToBalls(value),
  };
}

export function ballsToOversDecimal(balls) {
  const overs = Math.trunc(balls / BALLS_PER_OVER);
  const remainingBalls = balls % BALLS_PER_OVER;
  return Number(`${overs}.${remainingBalls}`);
}

export function calculateRunRate(runs, balls) {
  if (balls === 0) {
    return 0;
  }
  return runs / (balls / BALLS_PER_OVER);
}

export function calculateNetRunRate(
  forRuns,
  forBalls,
  againstRuns,
  againstBalls,
) {
  const battingRate = calculateRunRate(forRuns, forBalls);
  const bowlingRate = calculateRunRate(againstRuns, againstBalls);
  return Number((battingRate - bowlingRate).toFixed(3));
}

export function createTeamStanding(record) {
  const forStats = parseRunsOvers(record.for);
  const againstStats = parseRunsOvers(record.against);

  return {
    team: record.team,
    matches: record.matches,
    won: record.won,
    lost: record.lost,
    nrr: record.nrr,
    forRuns: forStats.runs,
    forBalls: forStats.balls,
    againstRuns: againstStats.runs,
    againstBalls: againstStats.balls,
    points: record.points,
  };
}

export function cloneStanding(record) {
  return {
    team: record.team,
    matches: record.matches,
    won: record.won,
    lost: record.lost,
    nrr: record.nrr,
    forRuns: record.forRuns,
    forBalls: record.forBalls,
    againstRuns: record.againstRuns,
    againstBalls: record.againstBalls,
    points: record.points,
  };
}

