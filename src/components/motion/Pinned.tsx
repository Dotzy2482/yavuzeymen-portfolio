/**
 * A scroll-pinned stage: a tall wrapper (`heightVh`) with a sticky 100vh
 * stage inside. The render prop receives scroll progress through the wrapper
 * as a MotionValue (0 at pin start, 1 at release) — consumers feed it into
 * useTransform without ever re-rendering per frame.
 *
 * Used by the mobile hero (180vh) and the Sim to Real gallery (240vh). The
 * prototype pins via JS transforms; `position: sticky` does the same job
 * without fighting the scroll thread.
 */

import { useRef } from 'react';
import { useScroll, type MotionValue } from 'motion/react';

import { cn } from '@/lib/cn';

export interface PinnedProps {
  /** Total scroll length of the wrapper, in vh (e.g. 240). */
  heightVh: number;
  children: (progress: MotionValue<number>) => React.ReactNode;
  className?: string;
  /** Classes for the sticky 100vh stage. */
  stageClassName?: string;
}

export function Pinned({ heightVh, children, className, stageClassName }: PinnedProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  return (
    <div ref={ref} className={cn('relative', className)} style={{ height: `${heightVh}vh` }}>
      <div className={cn('sticky top-0 h-screen overflow-hidden', stageClassName)}>
        {children(scrollYProgress)}
      </div>
    </div>
  );
}
