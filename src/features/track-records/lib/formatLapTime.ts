/**
 * Lap and sector time formatting.
 *
 * Domain logic, not a general utility — hence living inside the feature rather
 * than in `src/lib/format.ts`.
 *
 * TODO: implement all of these.
 * TODO: decide how to render laps over an hour (endurance stints) — probably
 *       `H:MM:SS.mmm`.
 */

/** `102318` → `"1:42.318"`. Drops the minute field below 60s. */
export function formatLapTime(_ms: number): string {
  return '--:--.---';
}

/** `23451` → `"23.451"` — sector times never carry a minute field. */
export function formatSectorTime(_ms: number): string {
  return '--.---';
}

/** Signed gap against a reference: `-312` → `"-0.312"`, `312` → `"+0.312"`. */
export function formatDelta(_ms: number): string {
  return '+0.000';
}

/** Parses `"1:42.318"` back to milliseconds. Returns null on malformed input. */
export function parseLapTime(_value: string): number | null {
  return null;
}
