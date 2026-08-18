/**
 * Generic display formatters.
 *
 * Locale is fixed to Turkish (`tr-TR`) — the body copy is Turkish and the
 * design's numerals follow Turkish conventions: dot thousands separator,
 * comma decimals, percent sign in front (`%82,3`).
 *
 * Lap-time formatting deliberately lives in the track-records feature
 * (`features/track-records/lib/formatLapTime.ts`) — it is domain logic, not a
 * general utility.
 */

const LOCALE = 'tr-TR';

/** `1234` → `"1.234"` (Turkish thousands separator). */
export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString(LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** `0.823` → `"%82,3"` — Turkish convention puts the sign in front. */
export function formatPercent(ratio: number, decimals = 1): string {
  return `%${formatNumber(ratio * 100, decimals)}`;
}

/** `123456` → `"123K"` — for follower / view counts (design uses K/M). */
export function formatCompact(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${formatNumber(value / 1_000_000, value % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${Math.round(value / 1_000)}K`;
  }
  return formatNumber(value);
}

/** `(2019, null)` → `"2019 — BUGÜN"`, `(2019, 2026)` → `"2019 — 2026"`. */
export function formatYearRange(start: number, end: number | null): string {
  return `${start} — ${end ?? 'BUGÜN'}`;
}

/** Pads a number to a fixed digit count: `(7, 2)` → `"07"`. */
export function padNumber(value: number, digits: number): string {
  return String(value).padStart(digits, '0');
}
