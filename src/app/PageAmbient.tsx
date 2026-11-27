/**
 * The page's ambient background below the hero: the hero's own language —
 * a red and a blue colour field, faint racing lines with a cyan runner — at a
 * lower volume, behind every section, plus a fine dot grid like telemetry
 * paper. Before it, the page past the hero was a flat #0a0b0d.
 *
 * It is one fixed layer behind `main`. The hero paints an opaque stage, so it
 * covers this layer completely and the two ambients never stack; everything
 * after the hero is transparent and shows it.
 *
 * It stays out of sight while the hero fills the screen and fades in as the
 * hero scrolls away. Shown from the top of the page, its red field sat right
 * under the hero bar beside the hero's own red light, and the junction read
 * as a stain.
 *
 * The colour fields drift with the scroll; the cyan runners travel their
 * lines on their own clock, like the hero's. Only transforms and a dash
 * offset change — no layout, no blur filter. Under reduced motion it is the
 * same picture, still.
 *
 * ## What it costs
 *
 * It is painted as one layer, on purpose. Plan 07 gave the two fields and the
 * lines a compositor layer each (`will-change-transform`) so that a scroll
 * frame would only move layers instead of repainting the masked dot grid and
 * both gradients. Headless Chrome agreed; a real browser window did not.
 * Three promoted layers inside this fixed, clipped, masked one made every
 * frame of the page more expensive for the GPU, wherever the scroll was, and
 * on a window whose GPU is shared (a game, an animated wallpaper, a second
 * monitor) that cost came straight out of the frame rate: a full-page scroll
 * drew 188 frames instead of 214, and four times as many took over 50 ms.
 * Promoting any one of the three alone was as bad as all three. The
 * repaint it saves is cheap, main-thread and off the GPU, so it is the better
 * trade. Measured in docs/plans/07-performance.md ("Follow-up"); do not promote
 * these again without measuring in a real, headed window.
 *
 * The runners hold while the layer is fully transparent — at the top of the
 * page, behind the hero — since a dash offset is never compositor work (see
 * `useLoop`).
 */

import { useState } from 'react';
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react';

import { useLoop, usePrefersReducedMotion } from '@/hooks';

/** Racing lines across a 1600 × 900 box, sliced to the viewport. */
const LINES = [
  {
    d: 'M-80 640 C260 560 420 760 760 690 C1060 628 1180 470 1680 540',
    stroke: 'var(--ambient-line-1)',
    runner: { dash: 140, opacity: 0.22, duration: 28, reverse: false },
  },
  {
    d: 'M-80 210 C300 280 520 140 860 200 C1140 250 1300 150 1680 190',
    stroke: 'var(--ambient-line-2)',
    runner: { dash: 100, opacity: 0.14, duration: 36, reverse: true },
  },
  {
    d: 'M-80 820 C380 760 700 900 1040 820 C1300 760 1460 800 1680 760',
    stroke: 'var(--ambient-line-3)',
    runner: null,
  },
] as const;

/** Total dash pattern length; longer than either line, so one runner shows. */
const DASH_LOOP = 3200;

interface RunnerProps {
  d: string;
  dash: number;
  opacity: number;
  /** Seconds per lap of the dash pattern. */
  duration: number;
  reverse: boolean;
  /** False holds the runner still (reduced motion). */
  running: boolean;
}

/**
 * A cyan dash running along a racing line on its own clock, the way the
 * hero's do. It was tied to the scroll at first; the owner preferred it
 * running by itself, which also keeps the background alive while the page
 * is still.
 */
function Runner({ d, dash, opacity, duration, reverse, running }: RunnerProps) {
  const offset = useLoop(reverse ? DASH_LOOP : -DASH_LOOP, duration, running);
  return (
    <motion.path
      d={d}
      fill="none"
      stroke="var(--accent-primary)"
      strokeOpacity={opacity}
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray={`${dash} ${DASH_LOOP - dash}`}
      style={{ strokeDashoffset: offset }}
    />
  );
}

interface LayerProps {
  /** Page scroll progress, 0 → 1; null under reduced motion. */
  progress: MotionValue<number> | null;
  /** The layer's own opacity: it fades in as the hero leaves. */
  presence: MotionValue<number> | number;
  /** Whether the layer can be seen at all; the runners hold while it cannot. */
  shown: boolean;
}

function Layer({ progress, presence, shown }: LayerProps) {
  // Hooks cannot be skipped, so the still layer feeds them a parked value.
  const parked = useMotionValue(0);
  const p = progress ?? parked;
  // The fields cross a good part of the screen over the page, so the light is
  // somewhere else on every screen rather than a fixed wash.
  const redY = useTransform(p, [0, 1], ['0%', '-18%']);
  const blueY = useTransform(p, [0, 1], ['0%', '14%']);
  const moving = progress !== null;
  const running = moving && shown;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ opacity: presence }}
    >
      {/* Telemetry paper: a fine dot grid, fading out towards the edges. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(var(--ambient-dot) 1px, transparent 1.2px)',
          backgroundSize: '28px 28px',
          // A mask reads only alpha; any opaque colour will do.
          maskImage: 'radial-gradient(ellipse 75% 70% at 50% 50%, var(--bg) 30%, transparent 100%)',
        }}
      />
      <motion.div
        className="absolute"
        style={{
          left: '-22%',
          top: '35%',
          width: '65%',
          height: '85%',
          opacity: 0.75,
          y: moving ? redY : 0,
          background: 'radial-gradient(ellipse at center, var(--ambient-red), transparent 62%)',
        }}
      />
      <motion.div
        className="absolute"
        style={{
          right: '-22%',
          top: '-20%',
          width: '65%',
          height: '85%',
          opacity: 0.75,
          y: moving ? blueY : 0,
          background: 'radial-gradient(ellipse at center, var(--ambient-blue), transparent 62%)',
        }}
      />
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        {LINES.map((line) => (
          <path key={line.d} d={line.d} fill="none" stroke={line.stroke} strokeWidth="1.5" />
        ))}
        <Runner d={LINES[0].d} {...LINES[0].runner} running={running} />
        <Runner d={LINES[1].d} {...LINES[1].runner} running={running} />
      </svg>
    </motion.div>
  );
}

function ScrolledLayer() {
  const { scrollY, scrollYProgress } = useScroll();
  // Hidden while the hero fills the screen, in by the time it has scrolled
  // most of the way off: shown from the top of the page, the layer's red
  // field sat right under the hero bar, beside the hero's own red light, and
  // the junction read as a stain.
  const presence = useTransform(() => {
    const vh = window.innerHeight;
    return Math.min(1, Math.max(0, (scrollY.get() - vh * 0.45) / (vh * 0.6)));
  });
  // Re-renders only when the layer crosses between invisible and not.
  const [shown, setShown] = useState(() => presence.get() > 0);
  useMotionValueEvent(presence, 'change', (v) => setShown(v > 0));
  return <Layer progress={scrollYProgress} presence={presence} shown={shown} />;
}

/**
 * Split like the other scroll-driven pieces, so that under reduced motion
 * `useScroll` is never called rather than merely ignored.
 */
export function PageAmbient() {
  const prefersReducedMotion = usePrefersReducedMotion();
  return prefersReducedMotion ? <Layer progress={null} presence={1} shown /> : <ScrolledLayer />;
}
