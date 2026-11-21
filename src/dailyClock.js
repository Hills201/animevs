// The Daily puzzle's clock and guess limit, kept apart from animeFacts.js on
// purpose. The home screen needs today's puzzle number and the guess count, and
// importing them from animeFacts.js dragged the whole facts database into the
// first-load bundle. This file is tiny; the facts load only with the Daily.
export const GUESSES = 7;

const DAY_MS = 86400000;
export function dayNumber(date = new Date()) {
  const utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.floor(utc / DAY_MS) - 20000;   // day 0 = 2024-10-04 UTC
}
export function msUntilTomorrow(now = new Date()) {
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return next - now.getTime();
}
