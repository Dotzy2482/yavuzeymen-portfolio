/**
 * Yavuz's YE monogram, drawn inline so it scales crisply and takes its colours
 * from the brand tokens.
 *
 * Three polygons in a 2000 × 2000 artboard: the navy body (the Y's left arm
 * and stem, the E's spine and bottom bar, the shadow under its top bar), the
 * purple stroke the two letters share (the Y's right arm running up into the
 * E's top bar), and the E's purple middle bar.
 *
 * It started as a trace of the italic artwork Yavuz supplied in November 2026.
 * He then asked for it upright and in a more vivid purple, so the trace was
 * de-slanted (x + 0.245 · (y − 1000), undoing its ~13.8° lean), every vertical
 * edge snapped to one x, the E's top and bottom bars evened out, and the two
 * edges of the purple diagonal made exactly parallel. public/favicon.svg
 * carries the same polygons; change both together.
 *
 * Decorative by default (`aria-hidden`), because it always sits beside the
 * written name; pass `title` where it stands alone.
 */

import { cn } from '@/lib/cn';

export interface LogoMarkProps {
  className?: string;
  /** Accessible name; omit when the mark sits next to the name in text. */
  title?: string;
}

export function LogoMark({ className, title }: LogoMarkProps) {
  return (
    <svg
      viewBox="216 578 1384 843"
      className={cn('block h-auto shrink-0', className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <polygon
        fill="var(--brand-navy)"
        points="1055,578 1600,721 1600,767 1176,767 1176,1232 1600,1232 1600,1421 545,1421 545,1104 216,578 458,578 649,887 808,578"
      />
      <polygon
        fill="var(--brand-purple)"
        points="1055,578 1600,578 1600,721 1113,721 924,1080 924,1421 776,1421 776,1101"
      />
      <polygon fill="var(--brand-purple)" points="1068,908 1545,908 1545,1080 977,1080" />
    </svg>
  );
}
