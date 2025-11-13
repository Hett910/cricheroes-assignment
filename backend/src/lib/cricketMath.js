export const BALLS_PER_OVER = 6;

// Converts cricket overs into total balls, validating fractional overs and handling invalid inputs.
export function oversToBalls(overs) {
  const oversInt = Math.trunc(overs);
  const fraction = Number((overs - oversInt).toFixed(1));
  const balls = Math.round((fraction || 0) * 10);
  if (balls >= BALLS_PER_OVER) {
    throw new Error(`Invalid overs value: ${overs}`);
  }
  return oversInt * BALLS_PER_OVER + balls;
}


// Parses a cricket overs string (e.g., "12.3/50") to calculate total balls, validating format and overs values.
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

// Extracts and validates the runs value from a "runs/overs" string, returning it as a number.
export function runsStringToNumber(value) {
  const [runsPart] = value.split("/");
  const runs = Number(runsPart);
  if (Number.isNaN(runs)) {
    throw new Error(`Invalid runs value: ${value}`);
  }
  return runs;
}

// Combines run and over parsing by returning an object with validated runs and balls from a "runs/overs" string.
export function parseRunsOvers(value) {
  return {
    runs: runsStringToNumber(value),
    balls: oversStringToBalls(value),
  };
}

// Converts total balls into overs format (e.g., 56 → "9.2") using division and remainder based on balls per
export function ballsToOversDecimal(balls) {
  const overs = Math.trunc(balls / BALLS_PER_OVER);
  const remainingBalls = balls % BALLS_PER_OVER;
  return Number(`${overs}.${remainingBalls}`);
}

// Calculates the run rate for a given number of runs and balls bowled.
export function calculateRunRate(runs, balls) {
  if (balls === 0) {
    return 0;
  }
  return runs / (balls / BALLS_PER_OVER);
}

// Calculates net run rate by subtracting bowling rate from batting rate, rounding the result to three decimal places.
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

// Builds a team standing object by parsing batting and bowling stats from record and returning a structured summary.
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

// Creates and exports a shallow copy of a team record object, preserving key stats like runs, balls, and points.
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

