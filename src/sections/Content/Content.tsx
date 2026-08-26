/**
 * 06 — CONTENT: three count-up figures and the reel-card fan.
 *
 * Counters run once, 1.6s easeOutCubic, when the section reaches 72% of the
 * viewport; Turkish number formatting throughout (dot thousands, `%82,3`).
 *
 * Desktop fan: five 9:16 cards — centre flat and emphasised, neighbours
 * rotated ±6°, outer ±13°, overlapping −44px; hovering straightens and lifts
 * a card above its siblings. Mobile: a scroll-snap carousel of straight
 * cards, centre card first.
 */

import { useMemo } from 'react';
import { motion } from 'motion/react';

import { cn } from '@/lib/cn';
import { CountUp } from '@/components/motion';
import { MonoLabel, PhotoCard, SectionHeading } from '@/components/ui';
import { usePrefersReducedMotion } from '@/hooks';
import { contentCounters, reelCards, FAN_CENTER_INDEX } from '@/data';
import type { SectionProps } from '@/types';

/**
 * Fan treatment by distance from the centre card: 0 = centre, 1 = neighbour,
 * 2 = outer. Rotation and margin take their sign from which side the card is
 * on, so this describes half the fan and the other half is its mirror.
 *
 * Keyed by distance rather than by card index on purpose — indexing a
 * fixed-length table by position breaks the moment the number of reel cards
 * changes, and it breaks by throwing.
 */
const FAN_RINGS = [
  { width: 290, rotate: 0, y: 0, z: 5 },
  { width: 230, rotate: 6, y: 12, z: 2 },
  { width: 200, rotate: 13, y: 34, z: 1 },
] as const;

interface FanSlot {
  width: number;
  rotate: number;
  y: number;
  z: number;
  margin: string;
}

function fanSlot(index: number): FanSlot {
  const offset = index - FAN_CENTER_INDEX;
  // Anything beyond the outermost ring keeps the outermost treatment.
  const ring = FAN_RINGS[Math.min(Math.abs(offset), FAN_RINGS.length - 1)];
  return {
    width: ring.width,
    rotate: Math.sign(offset) * ring.rotate,
    y: ring.y,
    z: ring.z,
    margin: offset < 0 ? 'md:mr-[-44px]' : offset > 0 ? 'md:ml-[-44px]' : '',
  };
}

export function Content({ id = 'content', className }: SectionProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  // Mobile carousel leads with the emphasised centre card. Memoised so the
  // list identity is stable across the re-renders the counters trigger.
  const carouselOrder = useMemo(
    () => [reelCards[FAN_CENTER_INDEX], ...reelCards.filter((_, i) => i !== FAN_CENTER_INDEX)],
    [],
  );

  return (
    <section id={id} className={cn('container-section container-wide overflow-hidden', className)}>
      <SectionHeading index="06" title="Content" meta="@NOGRIPSIMRACING" />

      {/* Counters */}
      <div className="mt-9 flex flex-col gap-6 md:mt-[72px] md:grid md:grid-cols-3 md:gap-5">
        {contentCounters.map((counter) => (
          <div key={counter.id} className="border-hairline-strong border-l pl-[18px] md:pl-7">
            <div
              className={cn(
                'num text-[34px] font-medium md:text-[clamp(36px,3.6vw,56px)]',
                counter.accent && 'text-accent-primary',
              )}
            >
              <CountUp
                to={counter.value}
                decimals={counter.decimals}
                prefix={counter.prefix}
                duration={1.6}
              />
            </div>
            <MonoLabel size="xs" tracking="lg" as="div" className="mt-2 md:mt-3.5 md:text-[10px]">
              {counter.label}
            </MonoLabel>
          </div>
        ))}
      </div>

      {/* Desktop card fan */}
      <div className="mt-24 hidden items-end justify-center pb-10 md:flex">
        {reelCards.map((card, i) => {
          const slot = fanSlot(i);
          const emphasis = i === FAN_CENTER_INDEX;
          return (
            <motion.div
              key={card.id}
              className={cn('relative', slot.margin, emphasis && 'shadow-fan')}
              style={{ width: slot.width, zIndex: slot.z }}
              initial={false}
              animate={prefersReducedMotion ? undefined : { rotate: slot.rotate, y: slot.y }}
              whileHover={
                prefersReducedMotion
                  ? undefined
                  : { rotate: 0, y: emphasis ? -14 : slot.y > 12 ? 6 : -8, zIndex: 9 }
              }
              transition={{ duration: 0.3 }}
            >
              <PhotoCard
                src={card.src}
                caption={card.caption}
                stat={card.stat}
                emphasis={emphasis}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Mobile carousel */}
      <div className="-mx-[var(--gutter)] mt-11 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-3 md:hidden">
        {carouselOrder.map((card) => (
          <PhotoCard
            key={card.id}
            src={card.src}
            caption={card.caption}
            stat={card.stat}
            emphasis={card.stat !== undefined}
            className="w-[240px] shrink-0 snap-center"
          />
        ))}
      </div>
    </section>
  );
}
