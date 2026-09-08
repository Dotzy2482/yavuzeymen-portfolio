/**
 * Reports which of a given set of sections the reader is currently in — the
 * nav's scroll-spy.
 *
 * Sections are found by `id` in the document rather than by ref, because the
 * nav does not render them and the React Compiler rules rule out passing refs
 * through props. `SectionId` is a closed union and every section renders
 * `<section id={id}>`, so the lookup cannot drift silently.
 *
 * Three decisions worth keeping:
 *
 * **The reader is in whichever section the middle of the viewport is on.** The
 * nav lists a curated four of the ten sections, so much of the page is spent
 * inside a section with no nav entry. Anything looser — "is any part of it
 * showing?" — would light "Career" while the reader is in Achievements, on the
 * strength of a sliver of Career still visible at the top. That is confidently
 * wrong, and worse than the honest gap of lighting nothing.
 *
 * **The band is a filter, not the answer.** `rootMargin` shrinks the observer's
 * root to a thin band across the middle, which is what stops the browser
 * reporting sections nowhere near it. A section can only hold the centre line
 * if it crosses that band, so the band never hides the right answer — it only
 * narrows the candidates to at most two, cheaply and without a scroll handler.
 * Which of the two it is, is then decided by measuring, not by observer
 * callback order: the nearest to the centre line wins, ties going to the one
 * nearer the top of the viewport.
 *
 * *Nearest*, not *containing*. Requiring a candidate to hold the centre line
 * outright looks tidier and is wrong, because of the paragraph below: entering
 * the band and reaching the centre are two different moments, and only the
 * first one produces a callback. A section scrolled back up into — its bottom
 * edge dipping into the band while an unlisted section still holds the centre —
 * would never light at all, because nothing observed changes state in between.
 *
 * The measurement has to be taken **when the decision is made**, not when the
 * entry arrived. A rect captured as one section entered the band is already
 * stale by the time a second one joins it — they entered at different scroll
 * positions. This costs one `getBoundingClientRect` per candidate, on
 * intersection changes only: a handful of times per page, never per frame.
 *
 * The flip side is that the answer is only re-taken when a section enters or
 * leaves the band, so it holds while nothing crosses an edge. The indicator
 * changes hands as a boundary reaches the band rather than on the exact pixel
 * it crosses the middle — a tolerance of about 77px at a 768px viewport, and
 * the reason the nav does not flicker when a reader rests on a section
 * boundary.
 *
 * **This is not `useInView`.** That hook reports "in view" immediately under
 * `prefers-reduced-motion`, which is right for a reveal that must not hide
 * content and wrong here — it would light all four nav items at once. Where the
 * page is in itself is navigation state, not decoration, and it is the same
 * with or without motion.
 *
 * The active section changes a handful of times per page, not per frame, so
 * unlike the scroll-linked work in `components/motion/` this is allowed to be
 * React state.
 */

import { useEffect, useState } from 'react';

import type { SectionId } from '@/types';

/**
 * Shrinks the observer's root to a 10%-tall band across the middle of the
 * viewport. Percentages, so it holds at 720 and at 844 alike.
 *
 * Its height is not load-bearing — any band containing the centre line gives
 * the same answer. It is 10% rather than a sliver because a band thin enough
 * to approximate the line itself starts losing to fractional-pixel layout, and
 * a zero-height root never intersects anything at all: the intersection would
 * have zero area, so the ratio stays 0 and never passes the threshold.
 */
const READING_BAND = '-45% 0px -45% 0px';

export function useActiveSection(ids: readonly SectionId[]): SectionId | null {
  const [activeId, setActiveId] = useState<SectionId | null>(null);

  // Callers build this list from NAV_ITEMS, which means a fresh array on every
  // render. Keying the effect on the contents rather than the array keeps that
  // from tearing the observer down and back up sixty times a second, without
  // making every call site remember to memoise.
  const key = ids.join(',');

  useEffect(() => {
    // `''.split(',')` is `['']`, not `[]` — an empty list would otherwise ask
    // for an element with an empty id.
    const observed = key ? key.split(',') : [];
    // Which sections are in the band right now. Carried between callbacks
    // because the observer reports only the ones whose state *changed*.
    const inBand = new Set<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inBand.add(entry.target);
          else inBand.delete(entry.target);
        }

        const centre = window.innerHeight / 2;
        let active: SectionId | null = null;
        let bestDistance = Infinity;
        let bestTop = Infinity;

        for (const section of inBand) {
          const { top, bottom } = section.getBoundingClientRect();
          // Zero when the section is under the centre line, otherwise how far
          // short of it the nearest edge falls.
          const distance = top > centre ? top - centre : bottom < centre ? centre - bottom : 0;
          // Ties break towards the top of the viewport, so that two candidates
          // an equal distance out are still resolved by geometry rather than by
          // whichever the observer happened to report first.
          if (distance < bestDistance || (distance === bestDistance && top < bestTop)) {
            // The one place a DOM id becomes a domain value. Safe because
            // nothing is observed that did not come from `ids`.
            active = section.id as SectionId;
            bestDistance = distance;
            bestTop = top;
          }
        }
        setActiveId(active);
      },
      { rootMargin: READING_BAND },
    );

    for (const id of observed) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }

    return () => observer.disconnect();
  }, [key]);

  return activeId;
}
