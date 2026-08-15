/**
 * Race results and titles worth calling out.
 *
 * Rendered by the Achievements section, likely as a grid with counters.
 *
 * TODO: replace with the real record.
 */

export type AchievementKind = 'title' | 'win' | 'podium' | 'pole' | 'record';

export interface Achievement {
  id: string;
  kind: AchievementKind;
  /** Headline, e.g. "Champion". */
  title: string;
  /** Championship, event or platform. */
  event: string;
  year: number;
  /** Finishing position where relevant; null for non-positional entries. */
  position: number | null;
  note: string;
}

export const achievements: Achievement[] = [
  // TODO: real entries.
];

/**
 * Aggregate counters for the headline stat row.
 * TODO: derive these from `achievements` instead of hand-maintaining them.
 */
export const achievementTotals = {
  titles: 0,
  wins: 0,
  podiums: 0,
  poles: 0,
} as const;
