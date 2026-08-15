/**
 * Social presence: platform stats and links out to the channels.
 *
 * TODO: build the stat row from `socialStats` with <CountUp />.
 * TODO: show `socialStatsUpdatedAt` — these are hand-entered snapshots, and
 *       saying so is more honest than implying a live feed.
 * TODO: decide whether to embed recent videos or just link out.
 */

import { cn } from '@/lib/cn';
import { SectionHeading } from '@/components/ui';
import type { SectionProps } from '@/types';

export function Content({ id = 'content', className }: SectionProps) {
  return (
    <section id={id} className={cn('section', className)}>
      <SectionHeading index="06" title="Content" />
      {/* TODO: platform stats from src/data/socialStats.ts */}
    </section>
  );
}
