/**
 * Lap and sector time formatting.
 *
 * Domain logic, not a general utility — hence living inside the feature rather
 * than in `src/lib/format.ts`. Times are always rendered with tabular figures
 * so the chronometer does not jitter as digits change.
 */

/** `102318` → `"1:42.318"`. Hours are folded into the minute field. */
export function formatLapTime(ms: number): string {
  const safe = Number.isFinite(ms) && ms > 0 ? ms : 0;
  const minutes = Math.floor(safe / 60_000);
  const seconds = Math.floor((safe % 60_000) / 1000);
  const millis = Math.floor(safe % 1000);
  return `${minutes}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
}

/** `23451` → `"23.451"` — sector times never carry a minute field. */
export function formatSectorTime(ms: number): string {
  const safe = Number.isFinite(ms) && ms > 0 ? ms : 0;
  return `${Math.floor(safe / 1000)}.${String(Math.floor(safe % 1000)).padStart(3, '0')}`;
}

/** Signed gap against a reference: `-312` → `"-0.312"`, `312` → `"+0.312"`. */
export function formatDelta(ms: number): string {
  const sign = ms < 0 ? '-' : '+';
  return `${sign}${formatSectorTime(Math.abs(ms))}`;
}

/** Parses `"1:42.318"` back to milliseconds. Returns null on malformed input. */
export function parseLapTime(value: string): number | null {
  const match = /^(\d+):(\d{1,2})\.(\d{1,3})$/.exec(value.trim());
  if (!match) return null;
  const [, minutes, seconds, millis] = match;
  return Number(minutes) * 60_000 + Number(seconds) * 1000 + Number(millis.padEnd(3, '0'));
}
