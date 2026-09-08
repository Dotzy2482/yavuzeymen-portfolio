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
 * The rig photo is deliberately left alone: any scrubbed crop or parallax on it
 * would re-introduce the deleted ParallaxLayer in spirit.
 */

import { useRef } from 'react';
import { useScroll } from 'motion/react';

import { cn } from '@/lib/cn';
import { SectionHeading } from '@/components/ui';
import { StretchScrub } from '@/components/motion';
import { setupItems } from '@/data';
import type { SectionProps } from '@/types';

import { SpecRow } from './SpecRow';

export function Setup({ id = 'setup', className }: SectionProps) {
  const rowsRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: rowsRef,
    offset: ['start 0.8', 'end 0.8'],
  });

  return (
    <section id={id} className={cn('container-section', className)}>
      <StretchScrub>
        <SectionHeading index="07" title="Setup" meta="EQUIPMENT SPEC" stretch="scrub" />
      </StretchScrub>
      <div className="mt-7 grid items-start gap-7 md:mt-[72px] md:grid-cols-[1.2fr_1fr] md:gap-20">
        <div ref={rowsRef} className="flex flex-col">
          {setupItems.map((item, i) => (
            <SpecRow
              key={item.id}
              item={item}
              progress={scrollYProgress}
              index={i}
              count={setupItems.length}
            />
          ))}
        </div>
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
