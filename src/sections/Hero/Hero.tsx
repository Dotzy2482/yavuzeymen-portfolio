/**
 * Full-viewport opening section. Carries the page's only <h1>.
 *
 * Layer order (bottom→top): ambient background → portrait → headline →
 * helmet → info cards → sponsor marquee + CTA. The helmet sits above the
 * headline on purpose: where the reveal opens, the shell occludes the type the
 * way it would in a photograph. The Nav chrome overlays this section from
 * outside.
 *
 * Desktop: a plain 100vh stage, with the helmet revealed under the cursor.
 * Mobile: a pinned 180vh wrapper; scrolling irises the helmet shut instead.
 *
 * ## The mobile headline block
 *
 * On a phone the headline carries the role line under it — without it nothing
 * in the first screen says what he does — and the two move as one block
 * between the fixed top bar and the portrait. Two limits hold it there:
 *
 * - **The bar.** The block rests at `max(11vh, 72px)` and drifts up by
 *   `clamp(0px, 11vh - 72px, 4vh)` over the pin, so it arrives at 72px and
 *   never above: the bar is 62px tall, and 72 leaves the wordmark air. The
 *   drift used to be a flat 4vh from 11vh, which put "ALWAYS" under the
 *   wordmark by the end of the pin — at 59px on a 390×844 phone and 46px on a
 *   375×667 one. On a 390×844 phone the drift is now 21px instead of 34.
 * - **The portrait.** It is bottom-anchored and `min(78vh, 118vw)` tall (see
 *   HeroPortrait), so the helmet's crown sits that far above the bottom.
 *   `--hero-room` is the height left between the block's top and the crown
 *   once the role line has its 52px (10px margin, two 16.5px lines, 9px of
 *   air). The headline's third size term fits the h1 into that room, and it
 *   only binds on short screens: 390×844 and taller set exactly what they did.
 *
 *   The term takes the larger of two sizes that both fit. Three lines ("ALWAYS
 *   / ON THE / LIMIT.") are 2.85em tall; two ("ALWAYS ON / THE LIMIT.") are
 *   1.9em, but only stay two while "ALWAYS ON", 7.63em wide in Archivo at this
 *   width axis, fits the line — hence the `/ 7.9` cap on that size. On a
 *   375×667 phone that is a two-line headline at 45px, where three lines would
 *   have to drop to 35. The 32px floor is for landscape phones, where the
 *   portrait leaves no room at all: without it the size would go to zero, and
 *   with it `8.5vh` wins again, as it did before. The role line is hidden in
 *   landscape, where the helmet would cover it.
 *
 *   Both numbers belong to other files: the portrait's height to HeroPortrait,
 *   the 7.63em to the headline copy in data/profile.ts. Change either and this
 *   term has to follow.
 */

import { Fragment, useRef } from 'react';
import { motion, useMotionValue, useTransform, type MotionValue } from 'motion/react';

import { cn } from '@/lib/cn';
import { BREAKPOINTS } from '@/lib/constants';
import { useMediaQuery, usePrefersReducedMotion } from '@/hooks';
import { Marquee, Pinned } from '@/components/motion';
import { MonoLabel, Picture } from '@/components/ui';
import { partners, profile } from '@/data';
import type { SectionProps } from '@/types';

import { HeroAmbient } from './HeroAmbient';
import { HeroPortrait } from './HeroPortrait';

interface PartnerLogoProps {
  heightKey: 'marqueeHeight' | 'gridHeight';
}

function PartnerLogo({ heightKey }: PartnerLogoProps) {
  return (
    <>
      {partners.map((partner) => (
        <Picture
          key={partner.id}
          src={partner.logoSrc}
          alt={partner.logoAlt}
          width={partner.intrinsicWidth}
          height={partner.intrinsicHeight}
          style={{ height: partner[heightKey] }}
          className={cn('w-auto', partner.marqueeClass)}
        />
      ))}
    </>
  );
}

interface HeroStageProps {
  /** Pin progress; null on desktop, which has no pin. */
  progress: MotionValue<number> | null;
}

function HeroStage({ progress }: HeroStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery(BREAKPOINTS.md);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Desktop has no pin, and reduced motion keeps the headline still, so either
  // way the drift reads a constant 0. The clamp is the bar rule described at
  // the top of the file.
  const staticProgress = useMotionValue(0);
  const headlineY = useTransform(
    progress && !prefersReducedMotion ? progress : staticProgress,
    (v) => `calc(${-v} * clamp(0px, 11vh - 72px, 4vh))`,
  );

  const words = profile.headline.split(' ');
  const accent = words.pop();

  return (
    <div ref={stageRef} className="bg-bg relative h-full overflow-hidden">
      <HeroAmbient mobile={!isDesktop} />

      <HeroPortrait
        mode={isDesktop ? 'static' : 'scroll'}
        progress={progress ?? undefined}
        stageRef={stageRef}
      />

      {/* Headline — in front of the portrait, behind the helmet. On mobile the
          role line rides under it; see the note at the top of the file. */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-[max(11vh,72px)] z-[3] px-2 text-center md:top-[max(68px,9vh)] md:px-0"
        style={{ y: headlineY }}
      >
        <h1
          lang="en"
          className="tracking-title stretch-display md:tracking-display m-0 text-[length:min(13vw,8.5vh,max(32px,calc(var(--hero-room)/2.85),min(calc(var(--hero-room)/1.9),calc((100vw_-_16px)/7.9))))] leading-[0.95] font-black uppercase [--hero-room:calc(100vh_-_min(78vh,118vw)_-_max(11vh,72px)_-_52px)] [text-shadow:var(--hero-headline-shadow)] md:text-[max(52px,min(8.5vw,12.5vh))] md:leading-[0.94]"
        >
          {words.join(' ')}{' '}
          <em className="font-serif font-normal tracking-normal normal-case italic">{accent}</em>
        </h1>
        <MonoLabel
          as="div"
          size="md"
          tracking="mono"
          lang="en"
          className="mt-2.5 leading-normal md:hidden [@media(orientation:landscape)]:hidden"
        >
          {profile.tagline.map((line, i) => (
            <Fragment key={line}>
              {i > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </MonoLabel>
      </motion.div>

      {/* Bottom-left: current team card. */}
      <div className="border-accent-primary absolute bottom-[86px] left-5 z-[6] flex flex-col gap-1 border-l-2 pl-3 md:bottom-[110px] md:left-10 md:gap-1.5 md:pl-4">
        <MonoLabel size="md" tracking="xl">
          {profile.currentTeam.label}
        </MonoLabel>
        <span className="tracking-ui stretch-wide text-[13px] font-black uppercase md:text-[16px]">
          {profile.currentTeam.name}
        </span>
        <MonoLabel size="md" tracking="mono">
          {profile.currentTeam.detail}
        </MonoLabel>
      </div>

      {/* Bottom-right: role tagline. Desktop only — a phone shows it under the
          headline instead. */}
      <MonoLabel
        as="div"
        size="md"
        tracking="sub"
        lang="en"
        className="absolute right-10 bottom-[110px] z-[5] hidden max-w-[340px] text-right leading-loose md:block"
      >
        {profile.tagline.map((line, i) => (
          <Fragment key={line}>
            {i > 0 && <br />}
            {line}
          </Fragment>
        ))}
      </MonoLabel>

      {/* Sponsor marquee + CTA. */}
      <div className="border-hairline-mid bg-bg absolute inset-x-0 bottom-0 z-[7] flex h-[60px] items-center border-t md:h-[76px]">
        {/* flex-1 so the strip fills the bar; without it the marquee sizes to
            its own content and the right of the bar stays empty. */}
        <Marquee
          duration={42}
          className="min-w-0 flex-1"
          trackClassName="gap-12 pr-12 md:gap-[72px] md:pr-[72px]"
        >
          <PartnerLogo heightKey="marqueeHeight" />
        </Marquee>
        <a
          href="#contact"
          lang="en"
          className="bg-accent-secondary tracking-btn text-text stretch-ui hover:bg-accent-secondary-hover duration-base absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 px-[26px] py-[15px] text-[13px] font-extrabold whitespace-nowrap uppercase shadow-[0_0_0_14px_var(--bg)] transition-colors md:inline-block"
        >
          Business Enquiries →
        </a>
      </div>
    </div>
  );
}

export function Hero({ id = 'hero', className }: SectionProps) {
  const isDesktop = useMediaQuery(BREAKPOINTS.md);

  if (isDesktop) {
    return (
      <section id={id} className={cn('relative h-screen', className)}>
        <HeroStage progress={null} />
      </section>
    );
  }

  return (
    <section id={id} className={className}>
      <Pinned heightVh={180}>{(progress) => <HeroStage progress={progress} />}</Pinned>
    </section>
  );
}
