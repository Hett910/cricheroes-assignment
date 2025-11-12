export function formatOvers(value) {
  const overs = Math.trunc(value);
  const fractional = Number((value - overs).toFixed(1));
  const balls = Math.round((fractional || 0) * 10);
  if (balls === 0) {
    return `${overs}.0`;
  }
  return `${overs}.${balls}`;
}

export function formatRunsRange(min, max) {
  if (min === max) {
    return `${min}`;
  }
  return `${min} to ${max}`;
}

export function formatNrrRange(min, max) {
  const minStr = min.toFixed(3);
  const maxStr = max.toFixed(3);
  if (minStr === maxStr) {
    return minStr;
  }
  return `${minStr} to ${maxStr}`;
}

