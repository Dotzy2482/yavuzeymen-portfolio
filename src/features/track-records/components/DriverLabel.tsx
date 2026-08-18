/**
 * The driver plate that trails the car dot — an HTML overlay rather than SVG
 * text, so the type renders at the same weight as the rest of the UI.
 *
 * A leader line joins it to the dot. The animation loop positions it and
 * flips `flex-direction` when the dot nears the right edge, so the plate
 * never leaves the panel. It never rotates.
 */

import { LAP_NODE } from '../hooks/useLapAnimation';

export interface DriverLabelProps {
  name: string;
}

export function DriverLabel({ name }: DriverLabelProps) {
  return (
    <div
      data-lap={LAP_NODE.label}
      aria-hidden="true"
      className="pointer-events-none absolute top-0 left-0 flex items-center will-change-transform"
    >
      <span className="bg-accent-primary/70 block h-px w-3 md:w-[18px]" />
      <span className="border-accent-primary/50 bg-surface-2 tracking-label text-text block border px-2 py-[5px] font-mono text-[9px] whitespace-nowrap md:px-2.5 md:py-1.5 md:text-[10px]">
        {name}
      </span>
    </div>
  );
}
