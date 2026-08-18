/**
 * Full-viewport opening section. Carries the page's only <h1>.
 *
 * Layer order (bottom→top): ambient background → portrait → headline →
 * helmet → info cards → sponsor marquee + CTA. The Nav chrome overlays this
 * section from outside.
 *
 * Desktop: a plain 100vh stage; the helmet fades away under the cursor.
 * Mobile: a pinned 180vh wrapper; scrolling scrubs the helmet reveal.
 */

import { useRef } from 'react';
import { motion, useMotionValue, useTransform, type MotionValue } from 'motion/react';

import { cn } from '@/lib/cn';
import { BREAKPOINTS } from '@/lib/constants';
import { useMediaQuery } from '@/hooks';
import { Marquee, Pinned } from '@/components/motion';
import { MonoLabel } from '@/components/ui';
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
      {partners.map((partner) =>
        partner.logoFallbackSrc ? (
          <picture key={partner.id}>
            <source srcSet={partner.logoSrc} type="image/avif" />
            <img
              src={partner.logoFallbackSrc}
              alt={partner.logoAlt}
              style={{ height: partner[heightKey] }}
              className={cn('w-auto', partner.marqueeClass)}
            />
          </picture>
        ) : (
          <img
            key={partner.id}
            src={partner.logoSrc}
            alt={partner.logoAlt}
            style={{ height: partner[heightKey] }}
            className={cn('w-auto', partner.marqueeClass)}
          />
        ),
      )}
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

  // Desktop has no pin, so progress stays a constant 0.
  const staticProgress = useMotionValue(0);
  const headlineY = useTransform(progress ?? staticProgress, (v) => `${-v * 4}vh`);

  const words = profile.headline.split(' ');
  const accent = words.pop();

  return (
    <div ref={stageRef} className="bg-bg relative h-full overflow-hidden">
      <HeroAmbient mobile={!isDesktop} />

      <HeroPortrait
        mode={isDesktop ? 'hover' : 'scroll'}
        progress={progress ?? undefined}
        stageRef={stageRef}
      />

      {/* Headline — in front of the portrait, behind the helmet. */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-[11vh] z-[3] px-2 text-center md:top-[max(68px,9vh)] md:px-0"
        style={{ y: headlineY }}
      >
        <h1
          lang="en"
          className="tracking-title stretch-display md:tracking-display m-0 text-[min(13vw,8.5vh)] leading-[0.95] font-black uppercase [text-shadow:var(--hero-headline-shadow)] md:text-[max(52px,min(8.5vw,12.5vh))] md:leading-[0.94]"
        >
          {words.join(' ')}{' '}
          <em className="font-serif font-normal tracking-normal normal-case italic">{accent}</em>
        </h1>
      </motion.div>

      {/* Bottom-left: current team card. */}
      <div className="border-accent-primary absolute bottom-[86px] left-5 z-[6] flex flex-col gap-1 border-l-2 pl-3 md:bottom-[110px] md:left-10 md:gap-1.5 md:pl-4">
        <MonoLabel size="xs" tracking="xl" className="md:text-[10px]">
          {profile.currentTeam.label}
        </MonoLabel>
        <span className="tracking-ui stretch-wide text-[13px] font-black uppercase md:text-[16px]">
          {profile.currentTeam.name}
        </span>
        <MonoLabel size="xs" tracking="mono" className="md:text-[10px]">
          {profile.currentTeam.detail}
        </MonoLabel>
      </div>

      {/* Bottom-right: role tagline (desktop only). */}
      <MonoLabel
        as="div"
        size="md"
        tracking="sub"
        lang="en"
        className="absolute right-10 bottom-[110px] z-[5] hidden max-w-[340px] text-right leading-loose md:block"
      >
        Professional sim racing driver
        <br />& content creator
      </MonoLabel>

      {/* Sponsor marquee + CTA. */}
      <div className="border-hairline-mid bg-bg absolute inset-x-0 bottom-0 z-[7] flex h-[60px] items-center border-t md:h-[76px]">
        <Marquee duration={42} trackClassName="gap-12 pr-12 md:gap-[72px] md:pr-[72px]">
          <PartnerLogo heightKey="marqueeHeight" />
        </Marquee>
        <a
          href="#contact"
          lang="en"
          className="bg-accent-secondary tracking-btn text-text stretch-ui hover:bg-accent-secondary-hover absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 px-[26px] py-[15px] text-[13px] font-extrabold whitespace-nowrap uppercase shadow-[0_0_0_14px_var(--bg)] transition-colors duration-[250ms] md:inline-block"
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
