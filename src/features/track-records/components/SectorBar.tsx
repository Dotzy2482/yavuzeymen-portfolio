/**
 * The three-segment sector bar under the map, filling as the lap runs.
 *
 * Segment widths come from `track.sectors` (percentages of the lap), so the
 * bar is proportional to the real sector split rather than three equal thirds.
 *
 * TODO: fill each segment as the car passes through it.
 * TODO: colour completed sectors by delta against the reference lap
 *       (purple/green/yellow, the usual timing-screen convention).
 * TODO: show the sector time under each segment once it is complete.
 */

import { cn } from '@/lib/cn';

import type { SectorSplit } from '../data/types';

export interface SectorBarProps {
  /** [S1, S2, S3] as percentages of the lap. */
  sectors: SectorSplit;
  /** Position around the lap, 0–1. */
  progress: number;
  className?: string;
}

export function SectorBar({ sectors, progress, className }: SectorBarProps) {
  // TODO: `progress` drives the fill; unused until that is implemented.
  void progress;

  return (
    <div className={cn('sector-bar', className)} role="presentation">
      {sectors.map((percent, index) => (
        <div
          key={index}
          className="sector-bar__segment"
          style={{ flexBasis: `${percent}%` }}
          data-sector={index + 1}
        />
      ))}
    </div>
  );
}
