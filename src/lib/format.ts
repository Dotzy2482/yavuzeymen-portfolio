/**
 * Generic display formatters.
 *
 * Lap-time formatting deliberately lives in the track-records feature
 * (`features/track-records/lib/formatLapTime.ts`) — it is domain logic, not a
 * general utility.
 *
 * TODO: implement all of these.
 * TODO: decide on a locale strategy (site language is not settled).
 */

/** `1234` → `"1.234"` (thousands separator, locale aware). */
export function formatNumber(_value: number): string {
  return '';
}

/** `0.42` → `"42%"`. */
export function formatPercent(_ratio: number): string {
  return '';
}

/** `123456` → `"123K"` — for follower / view counts. */
export function formatCompact(_value: number): string {
  return '';
}

/** `{ start: 2019, end: null }` → `"2019 — present"`. */
export function formatYearRange(_start: number, _end: number | null): string {
  return '';
}

/** Pads a number to a fixed digit count: `(7, 2)` → `"07"`. */
export function padNumber(_value: number, _digits: number): string {
  return '';
}
