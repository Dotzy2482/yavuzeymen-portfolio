/**
 * Yavuz's YE monogram, drawn inline so it scales crisply and takes its colours
 * from the brand tokens: a bold italic Y in purple and E in navy, each cut
 * through by sharp diagonal slashes whose blades poke out past the letters.
 *
 * The shape is a Gemini concept Yavuz picked in November 2026, traced rather
 * than redrawn: the 1071 × 727 artwork was upscaled 3×, each letter's colour
 * region contoured with marching squares at sub-pixel precision, and the
 * contours simplified (Ramer–Douglas–Peucker, 3.2 px at 3×) — so every cut and
 * blade sits where the artwork put it. The artwork's pink E is navy here, the
 * colour pairing Yavuz chose. public/favicon.svg carries the same two paths;
 * change both together.
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

/** The Y's three pieces (split by its slashes, with the blade). */
const Y_PATH =
  'M835 0L842 4L808 47L664 197L651 220L688 601L692 626L697 631L719 615L821 496L1124 131L1144 126L1479 125L1509 128L1507 141L906 831L318 1231L278 1254L276 1249L292 1204L375 1013L388 971L298 402L294 393L285 393L235 415L315 352L535 206L742 58ZM256 125L498 126L525 128L523 137L66 457L1 493L19 465L146 324L220 229L227 210L228 135L235 127ZM980 854L984 856L979 865L960 883L775 1048L741 1124L660 1345L597 1500L588 1504L299 1504L233 1500L236 1475L265 1399L293 1331L306 1312L531 1155L668 1068Z';
/** The E's three pieces. */
const E_PATH =
  'M2681 12L2684 13L2681 20L2591 127L2495 369L2484 386L2454 390L2178 393L1800 657L1802 665L1806 655L1804 662L1815 664L1806 666L1828 668L2277 669L2273 697L2186 920L1653 922L1639 925L1628 940L1524 1215L1523 1230L1529 1237L2048 1237L2061 1240L2051 1253L1528 1613L1464 1651L1485 1620L1578 1521L1584 1507L1580 1502L1080 1501L1061 1496L1206 1111L1213 1078L1208 1073L1191 1076L1064 1122L1037 1136L1006 1145L1003 1144L1006 1139L1595 738ZM1606 128L2352 128L2372 135L2274 207L2004 388L1850 393L1799 515L1786 533L1338 835L1320 843L1317 832L1325 807L1564 185L1587 134ZM2202 1231L2210 1234L2207 1245L2118 1488L2108 1501L1867 1504L1736 1552L1790 1509L2069 1322L2170 1248Z';

export function LogoMark({ className, title }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 2685 1652"
      className={cn('block h-auto shrink-0', className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path fill="var(--brand-purple)" d={Y_PATH} />
      <path fill="var(--brand-navy)" d={E_PATH} />
    </svg>
  );
}
