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
 *
 * ## The fan is a playlist
 *
 * Nine cards take turns in five slots: four Instagram reels Yavuz chose, each
 * a link to the reel, alternating with five clips of his own footage, which
 * link nowhere. The centre card plays its clip once at full size; when it
 * ends every card travels one slot left — position, size and tilt together —
 * the outer-left card glides offstage and the next one in the playlist glides
 * in at the right. The ← → buttons under the fan, either side of an "03 / 09"
 * counter, step it by hand. Side cards loop 270 × 480 previews and offstage
 * cards hold a poster, so one full clip and four small ones decode at a time:
 * five full clips in a fan that rotates and scrolls made the section stutter.
 * The playlist waits while the fan is off screen; under reduced motion the
 * cards jump instead of travelling and nothing plays.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';

import { cn } from '@/lib/cn';
import { padNumber } from '@/lib/format';
import { CountUp } from '@/components/motion';
import { MonoLabel, PhotoCard, SectionHeading } from '@/components/ui';
import { useInView, usePrefersReducedMotion } from '@/hooks';
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

/** How the cards travel when the playlist moves on: one slot, all together. */
const SHIFT = { duration: 0.8, ease: [0.65, 0, 0.35, 1] } as const;
/** An arrow press moves the fan one slot, quicker than the playlist does. */
const PICK_SHIFT = { duration: 0.42, ease: [0.33, 0, 0.2, 1] } as const;
const PICK_STEP_MS = 440;

/** The hover lift: quick and springy, but no overshoot past the cards beside it. */
const HOVER_SPRING = { type: 'spring', stiffness: 320, damping: 26 } as const;

/** Every card is drawn at the centre card's width and scaled to its slot. */
const CARD_WIDTH = FAN_RINGS[0].width;

interface FanSlot {
  /** Scale against CARD_WIDTH. */
  scale: number;
  rotate: number;
  y: number;
  /** Signed distance of the card's centre from the fan's centre, px. */
  x: number;
  z: number;
}

function fanSlot(index: number): FanSlot {
  const offset = index - FAN_CENTER_INDEX;
  // Anything beyond the outermost ring keeps the outermost treatment.
  const ringIndex = Math.min(Math.abs(offset), FAN_RINGS.length - 1);
  const ring = FAN_RINGS[ringIndex];
  const side = Math.sign(offset);
  return {
    scale: ring.width / CARD_WIDTH,
    rotate: side * ring.rotate,
    y: ring.y,
    x: side * ring.reach,
    z: FAN_RINGS.length - ringIndex,
  };
}

/** How many cards the fan shows at once: the centre and two rings each side. */
const VISIBLE = FAN_RINGS.length * 2 - 1;
/** How far past the outer slot a card travels as it leaves or arrives, px. */
const OFFSTAGE = 220;

interface FanCardProps {
  card: ReelCard;
  /** Place in the playlist relative to the fan: 0–4 are the slots, 5+ wait offstage. */
  position: number;
  previousPosition: number;
  /** +1: the playlist moved on (cards travel left); -1: it went back. */
  direction: 1 | -1;
  /** Travel quicker: an arrow press rather than the playlist moving on. */
  quick: boolean;
  /** Jump rather than travel: the static, reduced-motion fan. */
  instant: boolean;
  /** Scrub progress, 0 gathered → 1 dealt out; null under reduced motion. */
  spread: MotionValue<number> | null;
  /** The centre card's playback, when the playlist runs; null elsewhere. */
  centre: { playing: boolean; onEnded: () => void } | null;
}

/**
 * One card of the fan. It owns its place: when the playlist moves on, the card
 * itself travels to the slot beside it — position, size and tilt together. A
 * card leaving the outer slot glides offstage and fades; the next one in the
 * playlist glides in from the other side.
 *
 * Two layers, so the scrub and the hover never fight over the same transform:
 * the outer one is placed by the slot and the scrub, the inner one lifts under
 * the pointer and turns the card square to the reader. A card that is one of
 * Yavuz's Instagram reels is a link to it; his own footage links nowhere and
 * is not clickable.
 */
function FanCard({
  card,
  position,
  previousPosition,
  direction,
  quick,
  instant,
  spread,
  centre,
}: FanCardProps) {
  const visible = position < VISIBLE;
  const wasVisible = previousPosition < VISIBLE;
  // Offstage cards wait at the outer slot of the side they will enter from.
  const slot = fanSlot(visible ? position : direction > 0 ? VISIBLE - 1 : 0);
  const emphasis = position === FAN_CENTER_INDEX;

  // The slot, as motion values that glide to each new slot.
  const slotX = useMotionValue(visible ? slot.x : 0);
  const slotY = useMotionValue(slot.y);
  const slotRotate = useMotionValue(slot.rotate);
  const slotScale = useMotionValue(slot.scale);
  const opacity = useMotionValue(visible ? 1 : 0);

  useEffect(() => {
    const transition = instant ? { duration: 0 } : quick ? PICK_SHIFT : SHIFT;
    if (!visible && !wasVisible) {
      opacity.set(0);
      return;
    }
    if (!visible) {
      // Leaving: on past the outer slot it last held, fading as it goes.
      const exitX = fanSlot(previousPosition).x - direction * OFFSTAGE;
      // Gone within the first third of the move: a card still half visible
      // past the outer slot read as a ghost of the fan.
      const moves = [
        animate(slotX, exitX, transition),
        animate(opacity, 0, { duration: instant ? 0 : transition.duration * 0.3, ease: 'easeOut' }),
      ];
      return () => moves.forEach((move) => move.stop());
    }
    if (!wasVisible) {
      // Arriving: start just offstage on the side it comes from.
      slotX.set(slot.x + direction * OFFSTAGE);
      slotY.set(slot.y);
      slotRotate.set(slot.rotate);
      slotScale.set(slot.scale);
      opacity.set(0);
    }
    const moves = [
      animate(slotX, slot.x, transition),
      animate(slotY, slot.y, transition),
      animate(slotRotate, slot.rotate, transition),
      animate(slotScale, slot.scale, transition),
      // An arriving card fades in once it is under way, not while offstage.
      animate(
        opacity,
        1,
        wasVisible || instant
          ? transition
          : { duration: transition.duration * 0.6, delay: transition.duration * 0.35 },
      ),
    ];
    return () => moves.forEach((move) => move.stop());
  }, [
    visible,
    wasVisible,
    previousPosition,
    direction,
    quick,
    instant,
    slot.x,
    slot.y,
    slot.rotate,
    slot.scale,
    slotX,
    slotY,
    slotRotate,
    slotScale,
    opacity,
  ]);

  // The scrub deals the fan out: from GATHER of the way in towards the centre,
  // flat and a little low, to the slot itself.
  const fallback = useMotionValue(1);
  const progress = spread ?? fallback;
  const x = useTransform(() => slotX.get() * (1 - GATHER * (1 - progress.get())));
  const y = useTransform(() => slotY.get() + 36 * (1 - progress.get()));
  const rotate = useTransform(() => slotRotate.get() * progress.get());

  const photo = (
    <PhotoCard
      src={card.src}
      // Offstage cards hold their poster: nothing to decode until they arrive.
      video={!visible ? undefined : centre ? card.video : card.preview}
      play={centre ? 'manual' : 'view'}
      playing={centre?.playing ?? false}
      onEnded={centre?.onEnded}
      caption={card.caption}
      stat={card.stat}
      emphasis={emphasis}
      className={emphasis ? 'shadow-fan' : 'shadow-card'}
    />
  );
  const lifted = spread ? (
    <motion.div
      whileHover={{ y: -16, rotate: -slot.rotate, scale: 1.04 }}
      transition={HOVER_SPRING}
    >
      {photo}
    </motion.div>
  ) : (
    photo
  );

  return (
    <motion.div
      aria-hidden={visible ? undefined : true}
      className={cn(
        'absolute bottom-0 left-1/2 origin-bottom hover:z-10',
        !visible && 'pointer-events-none',
      )}
      style={{
        width: CARD_WIDTH,
        marginLeft: -CARD_WIDTH / 2,
        x,
        y,
        rotate,
        scale: slotScale,
        opacity,
        zIndex: visible ? slot.z : 0,
      }}
    >
      {card.href ? (
        <a
          href={card.href}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={visible ? undefined : -1}
          aria-label={`${card.caption} — Instagram reel, ${card.stat ?? ''} izlenme`}
          className="block"
        >
          {lifted}
        </a>
      ) : (
        lifted
      )}
    </motion.div>
  );
}

/**
 * The fan is 1070px wide at full size, which fits from 1280px up. Between
 * 1024 and 1280 it scales about its top edge rather than overflowing into the
 * section's clip, and a negative bottom margin hands back the height the scale
 * frees, so the gap to Setup stays the same. Below 1024 a tablet gets the
 * phone's carousel: scaled any further, the captions stop being readable.
 *
 * The cards are absolutely placed from the centre (they travel between slots,
 * so they cannot sit in a flex row); the box is as tall as the centre card
 * plus the outer cards' drop.
 */
const FAN_CLASSES = cn(
  'relative mx-auto mt-24 mb-16 hidden h-[536px] w-[1070px] origin-top lg:block',
  'lg:-mb-[45px] lg:scale-[0.8] xl:mb-16 xl:scale-100',
);

const ARROW_CLASSES =
  'border-hairline-strong text-text hover:border-accent-primary hover:text-accent-primary duration-base flex size-11 items-center justify-center rounded-full border font-mono text-[16px] transition-colors disabled:opacity-40';

interface FanBodyProps {
  spread: MotionValue<number> | null;
  /** Whether the fan is on screen; the playlist waits while it is not. */
  active: boolean;
}

function positionOf(cardIndex: number, offset: number, count: number): number {
  // The card at playlist index `offset` sits in slot 0 (outer left).
  return (((cardIndex - offset) % count) + count) % count;
}

interface FanStep {
  /** Playlist index of the card in slot 0. */
  offset: number;
  previous: number;
  direction: 1 | -1;
  quick: boolean;
}

function FanBody({ spread, active }: FanBodyProps) {
  const count = reelCards.length;
  // Offset 0 puts playlist card i in slot i, so the fan opens on card
  // FAN_CENTER_INDEX in the centre slot (both are 2).
  const [step, setStep] = useState<FanStep>({
    offset: 0,
    previous: 0,
    direction: 1,
    quick: false,
  });
  const [busy, setBusy] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const stepBy = (direction: 1 | -1, quick: boolean) =>
    setStep((s) => ({
      offset: (s.offset + direction + count) % count,
      previous: s.offset,
      direction,
      quick,
    }));

  // The arrows: one quick step, then a pause so a held click cannot pile up.
  const press = (direction: 1 | -1) => {
    if (busy) return;
    setBusy(true);
    stepBy(direction, true);
    timer.current = window.setTimeout(() => setBusy(false), PICK_STEP_MS);
  };

  return (
    <>
      {reelCards.map((card, i) => {
        const position = positionOf(i, step.offset, count);
        const isCentre = position === FAN_CENTER_INDEX;
        return (
          <FanCard
            key={card.id}
            card={card}
            position={position}
            previousPosition={positionOf(i, step.previous, count)}
            direction={step.direction}
            quick={step.quick}
            instant={!spread}
            spread={spread}
            centre={
              spread && isCentre
                ? { playing: active && !busy, onEnded: () => stepBy(1, false) }
                : null
            }
          />
        );
      })}
      {/* The playlist's own controls, centred under the fan: back, where the
          playlist is, forward. */}
      <div className="absolute -bottom-14 left-1/2 z-20 flex -translate-x-1/2 items-center gap-5">
        <button
          type="button"
          lang="en"
          aria-label="Previous"
          className={ARROW_CLASSES}
          disabled={busy}
          onClick={() => press(-1)}
        >
          ←
        </button>
        <span className="num text-text-faint w-[64px] text-center text-[12px]" aria-live="polite">
          <span className="text-text">
            {padNumber(((step.offset + FAN_CENTER_INDEX) % count) + 1, 2)}
          </span>
          {' / '}
          {padNumber(count, 2)}
        </span>
        <button
          type="button"
          lang="en"
          aria-label="Next"
          className={ARROW_CLASSES}
          disabled={busy}
          onClick={() => press(1)}
        >
          →
        </button>
      </div>
    </>
  );
}

function ScrubbedFan() {
  const fanRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: fanRef,
    // Dealt out by the time the whole fan is on screen, so it is never seen
    // half gathered while someone is looking at it.
    offset: ['start end', 'end end'],
  });
  const spread = useSpring(scrollYProgress, FAN_SPRING);
  const { ref: viewRef, inView } = useInView<HTMLDivElement>({ threshold: 0.5, once: false });

  return (
    <div ref={viewRef}>
      <div ref={fanRef} className={FAN_CLASSES}>
        <FanBody spread={spread} active={inView} />
      </div>
    </div>
  );
}

/**
 * The desktop fan. Split in two, like Partners' grid, so that under reduced
 * motion `useScroll` is never called rather than merely ignored: the static
 * branch draws the dealt-out fan, five stills that never move, and registers
 * no scroll listener.
 */
function Fan() {
  const prefersReducedMotion = usePrefersReducedMotion();
  if (prefersReducedMotion) {
    return (
      <div className={FAN_CLASSES}>
        <FanBody spread={null} active={false} />
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
      <SectionHeading index="06" title="Content" meta="@YAVUZEYMEN_12" />

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
                suffix={counter.suffix}
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
        {carouselOrder.map((card, i) => {
          const photo = (
            <PhotoCard
              src={card.src}
              video={card.preview}
              caption={card.caption}
              stat={card.stat}
              emphasis={i === 0}
              playThreshold={0.75}
              className="w-[240px] shrink-0"
            />
          );
          return card.href ? (
            <a
              key={card.id}
              href={card.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${card.caption} — Instagram reel, ${card.stat ?? ''} izlenme`}
              className="shrink-0 snap-center"
            >
              {photo}
            </a>
          ) : (
            <div key={card.id} className="shrink-0 snap-center">
              {photo}
            </div>
          );
        })}
      </div>
    </section>
  );
}
