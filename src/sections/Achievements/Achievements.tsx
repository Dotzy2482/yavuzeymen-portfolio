/**
 * 03 — ACHIEVEMENTS: six result cards.
 *
 * Championship cards carry the Race Red treatment (red border + red chip);
 * everything else is neutral. Hover lifts the card and turns the border cyan
 * — red and cyan never on the same element at the same time, per the style
 * guide, which is why hover clears to cyan on neutral cards only.
 *
 * Desktop: 3-column grid of tall cards. Mobile: stacked rows with the chip on
 * the right.
 */

import { motion } from 'motion/react';

import { cn } from '@/lib/cn';
import { SectionHeading, Tag } from '@/components/ui';
import { usePrefersReducedMotion } from '@/hooks';
import { achievements, type Achievement } from '@/data';
import { padNumber } from '@/lib/format';
import type { SectionProps } from '@/types';

interface AchievementCardProps {
  achievement: Achievement;
  index: number;
}

function AchievementCard({ achievement, index }: AchievementCardProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <motion.article
      whileHover={prefersReducedMotion ? undefined : { y: -6 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'bg-surface flex items-center justify-between gap-4 border px-[22px] py-6 transition-colors duration-[250ms] md:min-h-[190px] md:flex-col md:items-stretch md:justify-between md:gap-6 md:px-[30px] md:py-[34px]',
        achievement.champion
          ? 'border-accent-secondary-border'
          : 'border-hairline hover:border-accent-primary',
      )}
    >
      <div className="order-2 hidden items-center justify-between md:order-1 md:flex">
        <Tag variant={achievement.champion ? 'champion' : 'default'}>{achievement.chip}</Tag>
        <span className="num text-text-faint text-[11px]">{padNumber(index + 1, 2)}</span>
      </div>
      <div className="order-1">
        <h3
          lang={achievement.lang}
          className="stretch-wide text-[17px] leading-[1.25] font-black uppercase md:text-[21px]"
        >
          {achievement.title}
        </h3>
        <p className="text-text-secondary mt-1 text-[13px] md:mt-2 md:text-[14px]">
          {achievement.note}
        </p>
      </div>
      <Tag
        variant={achievement.champion ? 'champion' : 'default'}
        className="order-3 shrink-0 md:hidden"
      >
        {achievement.chip}
      </Tag>
    </motion.article>
  );
}

export function Achievements({ id = 'achievements', className }: SectionProps) {
  return (
    <section id={id} className={cn('container-section', className)}>
      <SectionHeading index="03" title="Achievements" meta="6 HIGHLIGHTS" />
      <div className="mt-9 flex flex-col gap-3.5 md:mt-[72px] md:grid md:grid-cols-3 md:gap-5">
        {achievements.map((achievement, i) => (
          <AchievementCard key={achievement.id} achievement={achievement} index={i} />
        ))}
      </div>
    </section>
  );
}
