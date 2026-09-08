/**
 * 08 — PARTNERS: hairline-bordered logo wall.
 *
 * Every logo is forced pure white (`brightness-0 invert`); the two dashed
 * "YOUR BRAND HERE" cells double as a sponsorship pitch, crawl their dashes
 * with scroll and hover to cyan (see OpenSlot). 3 columns on desktop, 2 on
 * mobile.
 */

import { useRef } from 'react';
import { useScroll } from 'motion/react';

import { cn } from '@/lib/cn';
import { SectionHeading } from '@/components/ui';
import { StretchScrub } from '@/components/motion';
import { partners, emptySlots } from '@/data';
import type { SectionProps } from '@/types';

import { OpenSlot } from './OpenSlot';

const CELL_CLASSES = 'flex h-[110px] items-center justify-center md:h-[160px]';

export function Partners({ id = 'partners', className }: SectionProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: gridRef,
    offset: ['start end', 'end start'],
  });

  return (
    <section id={id} className={cn('container-section', className)}>
      <StretchScrub>
        <SectionHeading index="08" title="Partners" stretch="scrub" />
      </StretchScrub>
      <div
        ref={gridRef}
        className="mt-9 grid grid-cols-2 gap-3 md:mt-[72px] md:grid-cols-3 md:gap-5"
      >
        {partners.map((partner) => {
          const img = (
            <img
              src={partner.logoFallbackSrc ?? partner.logoSrc}
              alt={partner.logoAlt}
              width={partner.intrinsicWidth}
              height={partner.intrinsicHeight}
              style={{ height: partner.gridHeight }}
              className="w-auto opacity-[0.92] brightness-0 invert"
            />
          );
          return (
            <div key={partner.id} className={cn(CELL_CLASSES, 'border-hairline border')}>
              {partner.logoFallbackSrc ? (
                <picture>
                  <source srcSet={partner.logoSrc} type="image/avif" />
                  {img}
                </picture>
              ) : (
                img
              )}
            </div>
          );
        })}
        {Array.from({ length: emptySlots }, (_, i) => (
          <OpenSlot key={`slot-${i}`} progress={scrollYProgress} className={CELL_CLASSES} />
        ))}
      </div>
    </section>
  );
}
