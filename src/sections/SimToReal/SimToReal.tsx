/**
 * 05 — SIM TO REAL: the sim → real photo story.
 *
 * From `md` up: a grid that reads left to right, top to bottom — rig, TOSFED
 * paddock, pit pass across the top; the FIAT Egea wide, the race crop and the
 * karting shot below. Two columns on a tablet, twelve tracks from `lg`.
 *
 * It used to be a pinned horizontal gallery: a 240vh wrapper held the page
 * still for more than two screens of scrolling while the row slid sideways.
 * That read as the page seizing up rather than as motion, so the page now
 * never stops here. The movement is parallax inside each frame instead: every
 * photo is drawn a little larger than its frame and drifts upward against the
 * scroll, each column at its own pace, so the grid gains depth while the
 * reader keeps full control of the scroll. Only `transform` changes, so it
 * costs the compositor and not layout.
 *
 * Under reduced motion the grid is the same, still, and never subscribes to
 * scroll — the same split Partners and the Content fan use. Phones keep the
 * plain stacked list (no pit-pass shot, per the mobile design).
 */

import { useRef } from 'react';
import { motion, useMotionValue, useScroll, useTransform, type MotionValue } from 'motion/react';

import { cn } from '@/lib/cn';
import { BREAKPOINTS } from '@/lib/constants';
import { useMediaQuery, usePrefersReducedMotion } from '@/hooks';
import { MonoLabel, Picture, SectionHeading } from '@/components/ui';
import { simToRealItems, type SimToRealItem } from '@/data';
import type { SectionProps } from '@/types';

const LEAD =
  "Simülatörde öğrendi, gerçek pistte kanıtladı: rig'den TOSFED padoklarına, FIAT Egea direksiyonuna.";

/**
 * How far a photo drifts inside its frame over the grid's pass through the
 * viewport, as a share of the frame's height either side of centre. The photo
 * is scaled up by enough to cover that travel, so no edge ever shows.
 */
const DRIFT = [0.05, 0.08, 0.06] as const;
/** Scale that covers the largest drift both ways, with a hair to spare. */
const DRIFT_SCALE = 1 + 2 * Math.max(...DRIFT) + 0.02;

function EmptySlot() {
  // An item with no photo yet (`src: null`); none today — karting, the last
  // one, was filled in November 2026. Its line is placeholder copy and keeps
  // the small size (see MonoLabel).
  return (
    <div className="border-border-dashed flex h-full w-full items-center justify-center border border-dashed">
      <MonoLabel size="xs" tracking="mono" tone="faint">
        Karting fotoğrafı yakında
      </MonoLabel>
    </div>
  );
}

interface GridPhotoProps {
  item: SimToRealItem;
  index: number;
  /** The grid's scroll progress, 0 entering → 1 leaving; null when still. */
  progress: MotionValue<number> | null;
}

function GridPhoto({ item, index, progress }: GridPhotoProps) {
  const drift = DRIFT[index % DRIFT.length];
  // Hooks cannot be skipped, so the still grid feeds the transform a parked
  // value; its output is never applied (see the style below).
  const fallback = useMotionValue(0);
  const y = useTransform(progress ?? fallback, [0, 1], [`${drift * 100}%`, `${-drift * 100}%`]);

  return (
    <figure className={cn('flex flex-col gap-3.5', item.cell)}>
      <MonoLabel size="md" tracking="xl" tone={item.accent ? 'accent' : 'secondary'}>
        {item.label}
      </MonoLabel>
      <div className={cn('bg-surface relative overflow-hidden', item.frame)}>
        {item.src ? (
          <motion.div
            className="absolute inset-0"
            style={progress ? { y, scale: DRIFT_SCALE } : undefined}
          >
            <Picture
              src={item.src}
              alt={item.alt}
              loading="lazy"
              width={item.intrinsicWidth ?? undefined}
              height={item.intrinsicHeight ?? undefined}
              style={item.focus ? { objectPosition: item.focus } : undefined}
              className="block h-full w-full object-cover saturate-[0.92]"
            />
          </motion.div>
        ) : (
          <EmptySlot />
        )}
      </div>
    </figure>
  );
}

const GRID_CLASSES = 'mt-14 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-12 lg:gap-y-14';

interface GridProps {
  progress: MotionValue<number> | null;
}

function Grid({ progress }: GridProps) {
  return (
    <>
      {simToRealItems.map((item, i) => (
        <GridPhoto key={item.id} item={item} index={i} progress={progress} />
      ))}
    </>
  );
}

function DriftingGrid() {
  const gridRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: gridRef, offset: ['start end', 'end start'] });
  return (
    <div ref={gridRef} className={GRID_CLASSES}>
      <Grid progress={scrollYProgress} />
    </div>
  );
}

function PhoneList() {
  return (
    <div className="mt-9 flex flex-col gap-8">
      {simToRealItems
        .filter((item) => !item.mobileHidden)
        .map((item) => (
          <figure key={item.id} className="flex flex-col gap-2.5">
            <MonoLabel size="md" tracking="xl" tone={item.accent ? 'accent' : 'secondary'}>
              {item.label}
            </MonoLabel>
            {item.src ? (
              <Picture
                src={item.src}
                alt={item.alt}
                loading="lazy"
                width={item.intrinsicWidth ?? undefined}
                height={item.intrinsicHeight ?? undefined}
                className="block h-auto w-full saturate-[0.92]"
              />
            ) : (
              <div className="h-[280px]">
                <EmptySlot />
              </div>
            )}
          </figure>
        ))}
    </div>
  );
}

export function SimToReal({ id = 'sim-to-real', className }: SectionProps) {
  const isDesktop = useMediaQuery(BREAKPOINTS.md);
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <section id={id} className={cn('container-section container-wide', className)}>
      <SectionHeading index="05" title="Sim to" accent="Real" lead={LEAD} />
      {!isDesktop ? (
        <PhoneList />
      ) : prefersReducedMotion ? (
        <div className={GRID_CLASSES}>
          <Grid progress={null} />
        </div>
      ) : (
        <DriftingGrid />
      )}
    </section>
  );
}
