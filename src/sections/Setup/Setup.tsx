/**
 * 07 — SETUP: the technical-document equipment list next to the rig photo.
 *
 * Rows are mono component labels with bold values; every value is still the
 * handoff's `MODEL — YER TUTUCU` placeholder, rendered as the dashed reserved
 * slot the site already uses in Partners and Sim to Real. See SpecRow.
 *
 * One `useScroll` on the rows container drives all five rows: each carves its
 * own 0–1 window out of that progress and fills a cyan overlay on its hairline,
 * so the list draws itself top to bottom. Offsets match Career's timeline fill
 * (`['start 0.8', 'end 0.8']`, the 80%-viewport line) — this is that fill
 * rotated 90°, and reusing the vocabulary is the point.
 *
 * The list is split in two so that `useScroll` is never *called* under reduced
 * motion rather than merely ignored — hooks cannot be skipped, only unmounted,
 * which is the same shape `StretchScrub` uses. The static branch hands the rows
 * a null progress and registers no scroll or resize listener at all.
 *
 * The rig photo is deliberately left alone: any scrubbed crop or parallax on it
 * would re-introduce the deleted ParallaxLayer in spirit.
 */

import { useRef } from 'react';
import { useScroll, type MotionValue } from 'motion/react';

import { cn } from '@/lib/cn';
import { SectionHeading } from '@/components/ui';
import { StretchScrub } from '@/components/motion';
import { setupItems } from '@/data';
import { usePrefersReducedMotion } from '@/hooks';
import type { SectionProps } from '@/types';

import { SpecRow } from './SpecRow';

const ROWS_CLASSES = 'flex flex-col';

function SpecRows({ progress }: { progress: MotionValue<number> | null }) {
  return (
    <>
      {setupItems.map((item, i) => (
        <SpecRow
          key={item.id}
          item={item}
          progress={progress}
          index={i}
          count={setupItems.length}
        />
      ))}
    </>
  );
}

function ScrubbedSpecList() {
  const rowsRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: rowsRef,
    offset: ['start 0.8', 'end 0.8'],
  });

  return (
    <div ref={rowsRef} className={ROWS_CLASSES}>
      <SpecRows progress={scrollYProgress} />
    </div>
  );
}

function SpecList() {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className={ROWS_CLASSES}>
        <SpecRows progress={null} />
      </div>
    );
  }
  return <ScrubbedSpecList />;
}

export function Setup({ id = 'setup', className }: SectionProps) {
  return (
    <section id={id} className={cn('container-section', className)}>
      <StretchScrub>
        <SectionHeading index="07" title="Setup" meta="EQUIPMENT SPEC" stretch="scrub" />
      </StretchScrub>
      <div className="mt-7 grid items-start gap-7 md:mt-[72px] md:grid-cols-[1.2fr_1fr] md:gap-20">
        <SpecList />
        <img
          src="/images/simtoreal/rig.png"
          alt="Sim rig"
          loading="lazy"
          width={433}
          height={545}
          className="border-hairline block h-auto w-full border"
        />
      </div>
    </section>
  );
}
