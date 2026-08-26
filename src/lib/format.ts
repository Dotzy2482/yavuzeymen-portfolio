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
 *
 * Kept deliberately small: formatPercent, formatCompact and formatYearRange
 * were removed because nothing called them. The counters that looked like they
 * would need them carry their own pre-formatted prefixes in data/contentStats.
 */

const LOCALE = 'tr-TR';

/** `1234` → `"1.234"` (Turkish thousands separator). */
export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString(LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Pads a number to a fixed digit count: `(7, 2)` → `"07"`. */
export function padNumber(value: number, digits: number): string {
  return String(value).padStart(digits, '0');
}
