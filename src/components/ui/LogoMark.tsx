/**
 * Yavuz's YE monogram, drawn inline so it scales crisply and takes its colours
 * from the brand tokens.
 *
 * Traced from the supplied 2000 × 2000 artwork (November 2026) into three
 * polygons in that artwork's own coordinates: the navy body (the Y's left arm
 * and stem, the E's spine and bottom bar, the shadow under its top bar), the
 * purple stroke the two letters share (the Y's right arm running into the E's
 * top bar), and the E's purple middle bar. Rendered back at the artwork's
 * size, the trace differs from it in 0.27% of pixels — anti-aliasing at the
 * edges. public/favicon.svg carries the same three polygons; change both
 * together.
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
      viewBox="319 578 1361 843"
      className={cn('block h-auto shrink-0', className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <polygon
        fill="var(--brand-navy)"
        points="1158,578 1647,721 1635,767 1233,767 1117,1232 1557,1232 1510,1421 441,1421 520,1104 319,578 561,578 677,887 911,578"
      />
      <polygon
        fill="var(--brand-purple)"
        points="1158,578 1680,578 1646,721 1181,721 905,1080 819,1421 673,1421 751,1101"
      />
      <polygon fill="var(--brand-purple)" points="1091,908 1564,908 1523,1080 957,1080" />
    </svg>
  );
}
