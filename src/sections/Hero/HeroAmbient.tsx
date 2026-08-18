/**
 * The hero's ambient background: two slow-drifting colour fields (red / blue
 * radial gradients) and faint SVG "racing lines" with a cyan dash running
 * along them.
 *
 * All movement is motion-driven (no CSS keyframes); everything is static
 * under reduced motion.
 */

import { motion } from 'motion/react';

import { usePrefersReducedMotion } from '@/hooks';

/** Total length used by the dash runner loop; matches the prototype. */
const DASH_LOOP = 3120;

interface RacingLineProps {
  d: string;
  /** Dash segment length for the cyan runner. */
  dash: number;
  duration: number;
  reverse?: boolean;
  opacity: number;
  animate: boolean;
}

function RacingLine({ d, dash, duration, reverse = false, opacity, animate }: RacingLineProps) {
  return (
    <motion.path
      d={d}
      fill="none"
      stroke="var(--accent-primary)"
      strokeOpacity={opacity}
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray={`${dash} ${DASH_LOOP - dash}`}
      initial={{ strokeDashoffset: 0 }}
      animate={animate ? { strokeDashoffset: reverse ? DASH_LOOP : -DASH_LOOP } : undefined}
      transition={{ duration, ease: 'linear', repeat: Infinity }}
    />
  );
}

export interface HeroAmbientProps {
  mobile: boolean;
}

export function HeroAmbient({ mobile }: HeroAmbientProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const animate = !prefersReducedMotion;

  const blobTransition = {
    ease: 'easeInOut' as const,
    repeat: Infinity,
    repeatType: 'mirror' as const,
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
        animate={animate ? { x: ['-4%', '5%'], y: ['-2%', '4%'], scale: [1, 1.12] } : undefined}
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
        animate={animate ? { x: ['4%', '-5%'], y: ['3%', '-3%'], scale: [1.1, 1] } : undefined}
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
            animate={animate}
          />
          <RacingLine
            d="M-60 320 C240 380 400 260 640 310 C790 340 840 280 960 300"
            dash={90}
            duration={34}
            reverse
            opacity={0.16}
            animate={animate}
          />
        </svg>
      ) : (
        <motion.svg
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid slice"
          className="absolute h-[106%] w-[108%]"
          style={{ inset: '-3% -4%' }}
          animate={animate ? { x: ['-2.5%', '2.5%'] } : undefined}
          transition={{ ...blobTransition, duration: 36 }}
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
            animate={animate}
          />
          <RacingLine
            d="M-120 220 C300 300 520 130 860 190 C1180 246 1260 120 1560 170 L1740 200"
            dash={110}
            duration={34}
            reverse
            opacity={0.18}
            animate={animate}
          />
        </motion.svg>
      )}
    </div>
  );
}
