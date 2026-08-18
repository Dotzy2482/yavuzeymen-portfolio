/**
 * 02 — CAREER: the scroll-filled vertical timeline.
 *
 * A 2px rail with a cyan fill whose height tracks scroll — the fill line sits
 * at 80% of the viewport, exactly the prototype's
 * `clamp((0.8·viewportH − nodesTop) / nodesHeight)`, which motion's useScroll
 * expresses as offset ['start 0.8', 'end 0.8']. Each node lights up (cyan
 * dot + glow, full opacity) once the fill passes its dot.
 */

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

import { cn } from '@/lib/cn';
import { MonoLabel, SectionHeading } from '@/components/ui';
import { useInView } from '@/hooks';
import { career, careerRange, type CareerEntry } from '@/data';
import type { SectionProps } from '@/types';

interface TimelineNodeProps {
  entry: CareerEntry;
}

function TimelineNode({ entry }: TimelineNodeProps) {
  // Active once the node's dot crosses the 80%-viewport fill line; tracks
  // both directions so scrolling back up dims the node again.
  const { ref, inView } = useInView<HTMLDivElement>({
    threshold: 0,
    rootMargin: '0px 0px -20% 0px',
    once: false,
  });

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex flex-col gap-1.5 py-[22px] pl-8 transition-opacity duration-[400ms] md:flex-row md:items-baseline md:gap-12 md:py-[30px] md:pl-[52px]',
        inView ? 'opacity-100' : 'opacity-55',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-[26px] -left-1.5 box-border size-3.5 rounded-full border-2 transition-colors duration-[400ms] md:top-9',
          inView
            ? 'border-accent-primary bg-accent-primary shadow-glow-dot'
            : 'border-border-btn bg-bg',
        )}
      />
      <span className="num text-text-secondary w-16 shrink-0 text-[12px] md:text-[15px]">
        {entry.year}
      </span>
      <div>
        <div
          lang={entry.lang}
          className="tracking-caps stretch-wide text-[17px] font-black uppercase md:text-[22px]"
        >
          {entry.title}
        </div>
        <div className="text-text-secondary mt-1.5 text-[13px] leading-[1.7] md:mt-2.5 md:text-[15px]">
          {entry.description}
        </div>
      </div>
    </div>
  );
}

export function Career({ id = 'career', className }: SectionProps) {
  const nodesRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: nodesRef,
    offset: ['start 0.8', 'end 0.8'],
  });
  const fillHeight = useTransform(scrollYProgress, (v) => `${v * 100}%`);

  return (
    <section id={id} className={cn('container-section', className)}>
      <SectionHeading index="02" title="Career" meta={careerRange} />
      <div className="relative mt-11 ml-1.5 md:mt-20 md:ml-2">
        <div
          aria-hidden="true"
          className="bg-hairline-mid absolute top-1.5 bottom-1.5 left-0 w-0.5"
        />
        <motion.div
          aria-hidden="true"
          className="bg-accent-primary shadow-glow-line absolute top-1.5 left-0 w-0.5"
          style={{ height: fillHeight }}
        />
        <div ref={nodesRef} className="flex flex-col md:gap-2">
          {career.map((entry) => (
            <TimelineNode key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
      <MonoLabel size="sm" tracking="chip" className="mt-6 md:hidden">
        {careerRange}
      </MonoLabel>
    </section>
  );
}
