/**
 * The geometry behind `ScrollRail`, kept free of the DOM and the frame loop so
 * it can be tested on its own.
 *
 * Everything is expressed in **scroll progress**: 0 with the page at the top,
 * 1 at the bottom, `scrollTop / maxScroll` in between. The rail is a linear map
 * of that range onto its own height, which is what lets a pointer position, a
 * section tick and the fill head all be compared as plain numbers.
 */

import { SECTION_IDS } from '@/lib/constants';
import type { SectionId } from '@/types';

/**
 * The rail's name for each section, shown on the plate that previews where a
 * click will land. English, like every heading on the page, and quoted from
 * the headings themselves so the plate says what the reader will find there.
 * The hero has no section heading; it takes the nav's name for it.
 *
 * A `Record` over `SectionId`, so a section added to the union without a label
 * here fails the build.
 */
export const RAIL_LABELS: Record<SectionId, string> = {
  hero: 'Home',
  about: 'Who is Yavuz Eymen?',
  career: 'Career',
  achievements: 'Achievements',
  'track-records': 'Track Records',
  'sim-to-real': 'Sim to Real',
  content: 'Content',
  setup: 'Setup',
  partners: 'Partners',
  contact: 'Contact',
};

/**
 * The design's two-digit section number: `01` for About through `09` for
 * Contact. The hero is unnumbered on the page, so it reads `00` — the grid,
 * before the first sector.
 */
export function sectionNumber(index: number): string {
  return String(index).padStart(2, '0');
}

/** The highest section number, for the `04 / 09` readout. */
export const LAST_SECTION_NUMBER = sectionNumber(SECTION_IDS.length - 1);

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * Where each section starts, in scroll progress: the point at which its top
 * edge reaches the top of the viewport. A section whose top can never get
 * there — the last one, when it is shorter than the viewport — is pinned to 1,
 * the bottom of the page, which is as close as scrolling can bring it.
 *
 * `null` in, `null` out: a section missing from the document gets no tick.
 */
export function tickPositions(
  sectionTops: readonly (number | null)[],
  maxScroll: number,
): (number | null)[] {
  return sectionTops.map((top) => {
    if (top === null) return null;
    // A page that does not scroll puts everything at the start.
    if (maxScroll <= 0) return 0;
    return clamp01(top / maxScroll);
  });
}

/**
 * The index of the section the reader is in at `progress`: the last one whose
 * tick has been reached. This is the same moment the rail's head passes that
 * tick, so the readout, the lit ticks and the head can never disagree.
 *
 * `tolerance` absorbs rounding — a jump to a section lands on a whole pixel,
 * and its top is measured in fractions of one. Pass about one pixel's worth of
 * progress (`1 / maxScroll`).
 *
 * Falls back to 0 when nothing has been reached, which only happens if the
 * first section is missing.
 */
export function sectionIndexAt(
  progress: number,
  ticks: readonly (number | null)[],
  tolerance = 0,
): number {
  let index = 0;
  ticks.forEach((tick, i) => {
    if (tick !== null && tick <= progress + tolerance) index = i;
  });
  return index;
}

/** The rail's extent on screen, in client pixels. */
export interface RailBox {
  top: number;
  height: number;
}

/**
 * Scroll progress for a pointer at `clientY` over the rail, clamped to the
 * rail's ends.
 *
 * `grabOffset` is how far below the head the pointer took hold of it, so that
 * dragging the head from its edge does not first snap its centre to the
 * pointer and jolt the page.
 */
export function progressAtPointer(clientY: number, rail: RailBox, grabOffset = 0): number {
  if (rail.height <= 0) return 0;
  return clamp01((clientY - grabOffset - rail.top) / rail.height);
}

/**
 * The tick within `snapPx` rail pixels of `progress`, or -1 if there is none.
 *
 * Ticks are a few pixels tall; this is what makes one easy to click. Of two
 * ticks inside the radius, the nearer one wins.
 */
export function nearestTick(
  progress: number,
  ticks: readonly (number | null)[],
  railHeight: number,
  snapPx: number,
): number {
  if (railHeight <= 0) return -1;
  const radius = snapPx / railHeight;
  let best = -1;
  let bestDistance = Infinity;
  ticks.forEach((tick, i) => {
    if (tick === null) return;
    const distance = Math.abs(tick - progress);
    if (distance <= radius && distance < bestDistance) {
      best = i;
      bestDistance = distance;
    }
  });
  return best;
}

/** The document scroll offset for a progress value, on whole pixels. */
export function scrollTopFor(progress: number, maxScroll: number): number {
  return Math.round(clamp01(progress) * Math.max(0, maxScroll));
}
