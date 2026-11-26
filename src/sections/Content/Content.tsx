/**
 * 06 — CONTENT: three count-up figures and the reel-card fan.
 *
 * Counters run once, 1.6s easeOutCubic, when the section reaches 72% of the
 * viewport; Turkish number formatting throughout (dot thousands, `%82,3`).
 *
 * Desktop fan: five rounded 9:16 cards, centre flat and emphasised,
 * neighbours tilted ±5° and outer ±10° about their bottom edges, stepping
 * down an arc and overlapping 10px. The fan deals itself out as it scrolls
 * in, on a damped scrub, and hovering a card lifts it on a spring, squares it
 * to the reader and raises it above its neighbours. It used to overlap 44px
 * and tilt to ±13°, so a hovered neighbour swung across the centre card and
 * covered its view count. Phones and tablets: a scroll-snap carousel of straight cards,
 * centre card first.
 */

import { useMemo, useRef } from 'react';
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';

import { cn } from '@/lib/cn';
import { CountUp } from '@/components/motion';
import { MonoLabel, PhotoCard, SectionHeading } from '@/components/ui';
import { usePrefersReducedMotion } from '@/hooks';
import { contentCounters, reelCards, FAN_CENTER_INDEX, type ReelCard } from '@/data';
import type { SectionProps } from '@/types';

/**
 * Fan treatment by distance from the centre card: 0 = centre, 1 = neighbour,
 * 2 = outer. Rotation and position take their sign from which side the card
 * is on, so this describes half the fan and the other half is its mirror.
 *
 * Keyed by distance rather than by card index on purpose — indexing a
 * fixed-length table by position breaks the moment the number of reel cards
 * changes, and it breaks by throwing.
 *
 * `reach` is how far a card's centre sits from the fan's centre, in px: half
 * of each card between, less the 10px overlap that `--fan-overlap` sets on
 * the row. The scrub starts every card a share
 * of that distance in towards the middle (see GATHER) and deals it out.
 */
const FAN_RINGS = [
  { width: 270, rotate: 0, y: 0, z: 'z-[5]', reach: 0 },
  { width: 230, rotate: 5, y: 20, z: 'z-[3]', reach: 240 },
  { width: 190, rotate: 10, y: 56, z: 'z-[1]', reach: 440 },
] as const;

/**
 * At the start of the scrub every side card sits this share of its reach in
 * towards the centre card, flat, and a little low. Not all the way: a card
 * fully behind the centre one would be content the scrub hides, and the fan
 * has to read as five cards at every point of the scroll.
 */
const GATHER = 0.55;

/** How the fan follows the scroll: damped, so a flick settles rather than snaps. */
const FAN_SPRING = { stiffness: 140, damping: 28, mass: 0.5 } as const;

/** The hover lift: quick and springy, but no overshoot past the cards beside it. */
const HOVER_SPRING = { type: 'spring', stiffness: 320, damping: 26 } as const;

interface FanSlot {
  width: number;
  rotate: number;
  y: number;
  /** Signed distance from the fan's centre, px. */
  x: number;
  z: string;
  margin: string;
}

function fanSlot(index: number): FanSlot {
  const offset = index - FAN_CENTER_INDEX;
  // Anything beyond the outermost ring keeps the outermost treatment.
  const ring = FAN_RINGS[Math.min(Math.abs(offset), FAN_RINGS.length - 1)];
  const side = Math.sign(offset);
  return {
    width: ring.width,
    rotate: side * ring.rotate,
    y: ring.y,
    x: side * ring.reach,
    z: ring.z,
    margin: side === 0 ? '' : side < 0 ? 'mr-[var(--fan-overlap)]' : 'ml-[var(--fan-overlap)]',
  };
}

interface FanCardProps {
  card: ReelCard;
  index: number;
  /** Scrub progress, 0 gathered → 1 dealt out; null under reduced motion. */
  spread: MotionValue<number> | null;
}

/**
 * One card of the fan. Two layers, so scroll and hover never fight over the
 * same transform: the outer one is placed by the scrub, the inner one lifts
 * under the pointer and turns the card square to the reader. The hovered card
 * also rises above its neighbours — a class, so it happens at once rather
 * than tweening through the cards beside it.
 */
function FanCard({ card, index, spread }: FanCardProps) {
  const slot = fanSlot(index);
  const emphasis = index === FAN_CENTER_INDEX;

  const fallback = useMotionValue(1);
  const progress = spread ?? fallback;
  const x = useTransform(progress, [0, 1], [-slot.x * GATHER, 0]);
  const rotate = useTransform(progress, [0, 1], [0, slot.rotate]);
  const y = useTransform(progress, [0, 1], [slot.y + 36, slot.y]);

  const photo = (
    <PhotoCard
      src={card.src}
      caption={card.caption}
      stat={card.stat}
      emphasis={emphasis}
      className={emphasis ? 'shadow-fan' : 'shadow-card'}
    />
  );

  return (
    <motion.div
      className={cn('relative shrink-0 origin-bottom hover:z-10', slot.z, slot.margin)}
      style={{ width: slot.width, x, y, rotate }}
    >
      {spread ? (
        <motion.div
          whileHover={{ y: -16, rotate: -slot.rotate, scale: 1.04 }}
          transition={HOVER_SPRING}
        >
          {photo}
        </motion.div>
      ) : (
        photo
      )}
    </motion.div>
  );
}

/**
 * The row is 1070px wide at full size, which fits from 1280px up. Between
 * 1024 and 1280 it scales about its top edge rather than overflowing into the
 * section's clip, and a negative bottom margin hands back the height the scale
 * frees, so the gap to Setup stays the same. Below 1024 a tablet gets the
 * phone's carousel: scaled any further, the captions stop being readable.
 */
const FAN_CLASSES = cn(
  'mt-24 hidden origin-top items-end justify-center pb-16 [--fan-overlap:-10px] lg:flex',
  'lg:-mb-[115px] lg:scale-[0.8] xl:mb-0 xl:scale-100',
);

function ScrubbedFan() {
  const fanRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: fanRef,
    // Dealt out by the time the whole fan is on screen, so it is never seen
    // half gathered while someone is looking at it.
    offset: ['start end', 'end end'],
  });
  const spread = useSpring(scrollYProgress, FAN_SPRING);

  return (
    <div ref={fanRef} className={FAN_CLASSES}>
      {reelCards.map((card, i) => (
        <FanCard key={card.id} card={card} index={i} spread={spread} />
      ))}
    </div>
  );
}

/**
 * The desktop fan. Split in two, like Partners' grid, so that under reduced
 * motion `useScroll` is never called rather than merely ignored: the static
 * branch draws the dealt-out fan and registers no scroll listener.
 */
function Fan() {
  const prefersReducedMotion = usePrefersReducedMotion();
  if (prefersReducedMotion) {
    return (
      <div className={FAN_CLASSES}>
        {reelCards.map((card, i) => (
          <FanCard key={card.id} card={card} index={i} spread={null} />
        ))}
      </div>
    );
  }
  return <ScrubbedFan />;
}

export function Content({ id = 'content', className }: SectionProps) {
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
            <MonoLabel size="md" tracking="lg" as="div" className="mt-2 md:mt-3.5">
              {counter.label}
            </MonoLabel>
          </div>
        ))}
      </div>

      {/* Desktop card fan */}
      <Fan />

      {/* Mobile carousel */}
      <div className="-mx-[var(--gutter)] mt-11 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-3 lg:hidden">
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
