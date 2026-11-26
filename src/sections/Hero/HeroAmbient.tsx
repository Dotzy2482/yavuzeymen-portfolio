/**
 * The hero's ambient background: two slow-drifting colour fields (red / blue
 * radial gradients) and faint SVG "racing lines" with a cyan dash running
 * along them.
 *
 * All movement is motion-driven (no CSS keyframes); everything is static
 * under reduced motion.
 *
 * ## What it costs
 *
 * The drift is written as whole `transform` keyframes rather than as `x`, `y`
 * and `scale`, and loops with `repeatType: 'reverse'` rather than `'mirror'`:
 * that is what lets motion hand it to the browser as a native animation,
 * which the compositor runs with no main-thread work at all. As `x`/`y`/
 * `scale` with `mirror`, each frame was script, a style recalculation and a
 * repaint of a gradient half the size of the screen — for as long as the page
 * was open, hero on screen or not. The two describe the same motion:
 * motion builds `translateX() translateY() scale()` from `x`/`y`/`scale` in
 * that order, and for a symmetric ease like `easeInOut`, playing a leg
 * backwards is the same curve as playing it forwards with the keyframes
 * swapped, which is all `mirror` does.
 *
 * The runners' dash offset cannot be composited, so they are held while the
 * hero is off screen (`visible`) — see `useLoop`.
 */

import { motion } from 'motion/react';

import { useLoop, usePrefersReducedMotion } from '@/hooks';

/** Total length used by the dash runner loop; matches the prototype. */
const DASH_LOOP = 3120;

interface RacingLineProps {
  d: string;
  /** Dash segment length for the cyan runner. */
  dash: number;
  duration: number;
  reverse?: boolean;
  opacity: number;
  /** False holds the runner where it is. */
  running: boolean;
}

function RacingLine({ d, dash, duration, reverse = false, opacity, running }: RacingLineProps) {
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

export interface HeroAmbientProps {
  mobile: boolean;
  /** Whether the hero is on screen; the runners hold while it is not. */
  visible: boolean;
}

export function HeroAmbient({ mobile, visible }: HeroAmbientProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const animate = !prefersReducedMotion;
  const running = animate && visible;

  // `reverse`, not `mirror`: see "What it costs" above.
  const blobTransition = {
    ease: 'easeInOut' as const,
    repeat: Infinity,
    repeatType: 'reverse' as const,
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute"
        style={{
          left: mobile ? '-30%' : '-18%',
          top: mobile ? '14%' : '12%',
          width: mobile ? '85%' : '60%',
          height: mobile ? '70%' : '80%',
          background: 'radial-gradient(ellipse at center, var(--ambient-red), transparent 62%)',
        }}
        animate={
          animate
            ? {
                transform: [
                  'translateX(-4%) translateY(-2%) scale(1)',
                  'translateX(5%) translateY(4%) scale(1.12)',
                ],
              }
            : undefined
        }
        transition={{ ...blobTransition, duration: 24 }}
      />
      <motion.div
        className="absolute"
        style={{
          right: mobile ? '-30%' : '-18%',
          top: mobile ? '8%' : '4%',
          width: mobile ? '88%' : '62%',
          height: mobile ? '74%' : '84%',
          background: 'radial-gradient(ellipse at center, var(--ambient-blue), transparent 62%)',
        }}
        animate={
          animate
            ? {
                transform: [
                  'translateX(4%) translateY(3%) scale(1.1)',
                  'translateX(-5%) translateY(-3%) scale(1)',
                ],
              }
            : undefined
        }
        transition={{ ...blobTransition, duration: 30 }}
      />
      {mobile ? (
        <svg
          viewBox="0 0 900 1600"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
        >
          <path
            d="M-60 1180 C220 1120 340 1280 560 1230 C760 1185 800 1060 960 1090"
            fill="none"
            stroke="var(--ambient-line-1)"
            strokeWidth="1.5"
          />
          <path
            d="M-60 320 C240 380 400 260 640 310 C790 340 840 280 960 300"
            fill="none"
            stroke="var(--ambient-line-2)"
            strokeWidth="1.5"
          />
          <RacingLine
            d="M-60 1180 C220 1120 340 1280 560 1230 C760 1185 800 1060 960 1090"
            dash={120}
            duration={26}
            opacity={0.26}
            running={running}
          />
          <RacingLine
            d="M-60 320 C240 380 400 260 640 310 C790 340 840 280 960 300"
            dash={90}
            duration={34}
            reverse
            opacity={0.16}
            running={running}
          />
        </svg>
      ) : (
        // The drift moves a wrapper, not the <svg>: Chrome will not run a
        // transform animation on an <svg> element on the compositor, so on
        // the svg itself every frame of the drift was a main-thread repaint
        // of the whole drawing. The wrapper is the box the svg had, and the
        // svg fills it, so the percentages mean the same thing.
        <motion.div
          className="absolute h-[106%] w-[108%]"
          style={{ inset: '-3% -4%' }}
          animate={animate ? { transform: ['translateX(-2.5%)', 'translateX(2.5%)'] } : undefined}
          transition={{ ...blobTransition, duration: 36 }}
        >
          <svg
            viewBox="0 0 1600 900"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 h-full w-full"
          >
            <path
              d="M-120 640 C260 560 430 780 780 710 C1120 642 1160 430 1500 470 L1740 500"
              fill="none"
              stroke="var(--ambient-line-1)"
              strokeWidth="1.5"
            />
            <path
              d="M-120 690 C260 610 430 830 780 760 C1120 692 1160 480 1500 520 L1740 550"
              fill="none"
              stroke="var(--ambient-line-3)"
              strokeWidth="1.5"
            />
            <path
              d="M-120 220 C300 300 520 130 860 190 C1180 246 1260 120 1560 170 L1740 200"
              fill="none"
              stroke="var(--ambient-line-2)"
              strokeWidth="1.5"
            />
            <path
              d="M-120 170 C300 250 520 80 860 140 C1180 196 1260 70 1560 120 L1740 150"
              fill="none"
              stroke="var(--ambient-line-4)"
              strokeWidth="1.5"
            />
            <RacingLine
              d="M-120 640 C260 560 430 780 780 710 C1120 642 1160 430 1500 470 L1740 500"
              dash={150}
              duration={26}
              opacity={0.28}
              running={running}
            />
            <RacingLine
              d="M-120 220 C300 300 520 130 860 190 C1180 246 1260 120 1560 170 L1740 200"
              dash={110}
              duration={34}
              reverse
              opacity={0.18}
              running={running}
            />
          </svg>
        </motion.div>
      )}
    </div>
  );
}
