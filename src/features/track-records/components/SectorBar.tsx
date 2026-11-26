/**
 * S1 / S2 / S3 progress bars.
 *
 * Each bar spans one of the circuit's real timing sectors (`track.sectors`;
 * even thirds only where no split is published), and fills as the marker
 * drives through it. Each fill's width is written by the animation loop.
 */

import { cn } from '@/lib/cn';

export interface SectorBarProps {
  className?: string;
}

const LABELS = ['S1', 'S2', 'S3'] as const;

export function SectorBar({ className }: SectorBarProps) {
  return (
    <div className={cn('flex flex-1 items-center gap-2 md:gap-2.5', className)}>
      {LABELS.map((label, i) => (
        <div key={label} className="flex flex-1 items-center gap-2 md:gap-2.5">
          <span className="tracking-mono text-text-quiet font-mono text-[11px] md:w-6">
            {label}
          </span>
          <div className="bg-track-sector-track h-[3px] flex-1">
            <div data-lap-sector={i} className="bg-accent-primary h-full w-0" />
          </div>
        </div>
      ))}
    </div>
  );
}
