/**
 * The bar along the foot of the hero: Kick status on the left, the Business
 * Enquiries button in the middle (desktop), a scroll cue on the right.
 *
 * It replaced a scrolling strip of partner logos. Three of those logos sponsor
 * the team rather than Yavuz, and a ticker of his numbers in their place read
 * as busy, so the bar is still now — but it is kept, because it is what gives
 * the stage a floor: without it the portrait, which runs past the bottom of
 * the viewport, is cut off by the next section's background in a hard line.
 *
 * The left slot is live. While Yavuz is streaming it says so in race red with
 * a pulsing dot and the viewer count, linking to the stream; otherwise it is a
 * quiet link to the channel. The status comes from useKickLive, which never
 * claims "live" on a failed or unexpected answer. With no Kick URL configured
 * the slot stays empty.
 */

import { motion } from 'motion/react';

import { cn } from '@/lib/cn';
import { useKickLive, usePrefersReducedMotion } from '@/hooks';
import { profile } from '@/data';

const SLOT_CLASSES =
  'flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-mono whitespace-nowrap md:text-[11px]';

function KickStatus() {
  const { live, viewers } = useKickLive();
  const prefersReducedMotion = usePrefersReducedMotion();
  const href = profile.socials.kick;
  if (!href) return <span />;

  if (!live) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        lang="en"
        className={cn(
          SLOT_CLASSES,
          'text-text-faint hover:text-text duration-base transition-colors',
        )}
      >
        <span aria-hidden="true" className="bg-text-faint block size-1.5 rounded-full" />
        Streams on Kick →
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      lang="en"
      className={cn(
        SLOT_CLASSES,
        'text-text hover:text-accent-secondary-hover duration-base transition-colors',
      )}
    >
      <span aria-hidden="true" className="relative block size-2">
        {!prefersReducedMotion && (
          <motion.span
            className="bg-accent-secondary absolute inset-0 rounded-full"
            // A whole `transform`, not `scale`: that way motion hands the
            // pulse to the compositor instead of running it on the main thread.
            animate={{ transform: ['scale(1)', 'scale(2.6)'], opacity: [0.6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
        <span className="bg-accent-secondary absolute inset-0 rounded-full" />
      </span>
      <span className="text-accent-secondary font-bold">Live</span>
      <span>on Kick</span>
      {viewers !== null && (
        <span className="text-text-faint hidden md:inline">· {viewers} watching</span>
      )}
    </a>
  );
}

/** The scroll cue's sweep, and the sweep plus its pause, in seconds. */
const CUE_TRAVEL = 2.2;
const CUE_LOOP = CUE_TRAVEL + 0.4;

function ScrollCue() {
  const prefersReducedMotion = usePrefersReducedMotion();
  return (
    <span aria-hidden="true" lang="en" className={cn(SLOT_CLASSES, 'text-text-faint')}>
      Scroll
      <span className="bg-hairline-strong relative block h-px w-10 overflow-hidden md:w-14">
        {prefersReducedMotion ? (
          <span className="bg-accent-primary absolute inset-y-0 left-0 w-1/3" />
        ) : (
          <motion.span
            className="bg-accent-primary absolute inset-y-0 left-0 w-1/3"
            // 2.2s across, then 0.4s parked past the end of the track, where
            // the clip hides it. Written as one 2.6s loop with a held last
            // keyframe rather than as `x` with a `repeatDelay`, because either
            // of those keeps motion from handing the loop to the compositor.
            animate={{
              transform: ['translateX(-100%)', 'translateX(300%)', 'translateX(300%)'],
            }}
            transition={{
              duration: CUE_LOOP,
              times: [0, CUE_TRAVEL / CUE_LOOP, 1],
              ease: ['easeInOut', 'linear'],
              repeat: Infinity,
            }}
          />
        )}
      </span>
    </span>
  );
}

export function HeroBar() {
  return (
    <div className="border-hairline-mid bg-bg absolute inset-x-0 bottom-0 z-[7] flex h-[60px] items-center justify-between border-t px-5 md:h-[76px] md:px-10">
      <KickStatus />
      <a
        href="#contact"
        lang="en"
        className="bg-accent-secondary tracking-btn text-text stretch-ui hover:bg-accent-secondary-hover duration-base absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 px-[26px] py-[15px] text-[13px] font-extrabold whitespace-nowrap uppercase shadow-[0_0_0_14px_var(--bg)] transition-colors md:inline-block"
      >
        Business Enquiries →
      </a>
      <ScrollCue />
    </div>
  );
}
