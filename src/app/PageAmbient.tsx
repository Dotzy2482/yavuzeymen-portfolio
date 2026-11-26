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
 * The first version read as a filter laid over the page: its colour fields
 * barely moved, so the same red wash sat in the same corner on every screen,
 * and its racing lines crossed the middle of the viewport, straight behind
 * the section headings. So the fields are fainter and travel a long way over
 * the scroll — the light changes as the reader goes down the page — and the
 * two lines keep to the top and bottom edges, clear of the text band.
 *
 * Motion is tied to the scroll, not to a clock: the fields drift and the cyan
 * runners travel their lines as the page moves. Only transforms and a dash
 * offset change — no layout, no blur filter. Under reduced motion it is the
 * same picture, still.
 */

import { motion, useMotionValue, useScroll, useTransform, type MotionValue } from 'motion/react';

import { usePrefersReducedMotion } from '@/hooks';

/** Two racing lines across a 1600 × 900 box: one near the top, one near the foot. */
const LINES = [
  {
    d: 'M-80 120 C300 170 540 70 880 110 C1160 145 1320 80 1680 105',
    stroke: 'var(--ambient-line-3)',
    runner: { dash: 120, opacity: 0.16, travel: 2600 },
  },
  {
    d: 'M-80 820 C260 770 480 860 820 810 C1120 768 1300 840 1680 800',
    stroke: 'var(--ambient-line-4)',
    runner: { dash: 150, opacity: 0.2, travel: -2400 },
  },
] as const;

/** Total dash pattern length; longer than either line, so one runner shows. */
const DASH_LOOP = 3200;

interface RunnerProps {
  d: string;
  dash: number;
  opacity: number;
  offset: MotionValue<number> | null;
}

function Runner({ d, dash, opacity, offset }: RunnerProps) {
  return (
    <motion.path
      d={d}
      fill="none"
      stroke="var(--accent-primary)"
      strokeOpacity={opacity}
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray={`${dash} ${DASH_LOOP - dash}`}
      style={offset ? { strokeDashoffset: offset } : { strokeDashoffset: -600 }}
    />
  );
}

interface LayerProps {
  /** Page scroll progress, 0 → 1; null under reduced motion. */
  progress: MotionValue<number> | null;
}

function Layer({ progress }: LayerProps) {
  // Hooks cannot be skipped, so the still layer feeds them a parked value.
  const parked = useMotionValue(0);
  const p = progress ?? parked;
  // The fields cross a good part of the screen over the page, so the light is
  // somewhere else on every screen rather than a fixed wash.
  const redX = useTransform(p, [0, 1], ['0%', '55%']);
  const redY = useTransform(p, [0, 1], ['10%', '-45%']);
  const blueX = useTransform(p, [0, 1], ['0%', '-50%']);
  const blueY = useTransform(p, [0, 1], ['-10%', '55%']);
  const runnerA = useTransform(p, [0, 1], [0, -LINES[0].runner.travel]);
  const runnerB = useTransform(p, [0, 1], [0, -LINES[1].runner.travel]);
  const moving = progress !== null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
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
          left: '-25%',
          top: '20%',
          width: '60%',
          height: '80%',
          opacity: 0.55,
          x: moving ? redX : 0,
          y: moving ? redY : 0,
          background: 'radial-gradient(ellipse at center, var(--ambient-red), transparent 62%)',
        }}
      />
      <motion.div
        className="absolute"
        style={{
          right: '-25%',
          top: '-10%',
          width: '60%',
          height: '80%',
          opacity: 0.55,
          x: moving ? blueX : 0,
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
        {LINES.map((line, i) => (
          <Runner
            key={`runner-${line.d}`}
            d={line.d}
            dash={line.runner.dash}
            opacity={line.runner.opacity}
            offset={moving ? (i === 0 ? runnerA : runnerB) : null}
          />
        ))}
      </svg>
    </div>
  );
}

function ScrolledLayer() {
  const { scrollYProgress } = useScroll();
  return <Layer progress={scrollYProgress} />;
}

/**
 * Split like the other scroll-driven pieces, so that under reduced motion
 * `useScroll` is never called rather than merely ignored.
 */
export function PageAmbient() {
  const prefersReducedMotion = usePrefersReducedMotion();
  return prefersReducedMotion ? <Layer progress={null} /> : <ScrolledLayer />;
}
