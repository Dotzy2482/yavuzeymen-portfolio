/**
 * Career timeline entries, newest first.
 *
 * Rendered by the Career section as a vertical, scroll-revealed timeline.
 *
 * TODO: replace with the real history.
 */

import type { DateRange } from '@/types';

export interface CareerEntry {
  id: string;
  /** Team, academy or organisation. */
  organisation: string;
  /** Role or seat, e.g. "Factory Driver". */
  role: string;
  /** Championship or platform, e.g. "GT World Challenge Esports". */
  series: string;
  period: DateRange;
  /** Short description; 1–2 sentences. */
  summary: string;
}

export const career: CareerEntry[] = [
  // TODO: real entries.
];
