/**
 * 09 — CONTACT + footer: full-viewport centred close.
 *
 * `profile.email` comes from the environment and is an empty string when
 * unset — in that case the CTA still renders (the design demands one) but
 * falls back to a generic label and scrolls nowhere; drop the real address
 * into .env.local to arm it.
 *
 * The headline, kicker and CTA are English and carry `lang="en"`; the
 * invitation copy and the legal links stay Turkish.
 *
 * The copyright year is read at runtime rather than written in — a static build
 * would otherwise keep claiming the year it was built in.
 *
 * Two scrubs close the page. The headline's width axis widens as the visitor
 * arrives (see components/motion/StretchScrub), and the footer's top rule draws
 * itself left to right — Career's vertical timeline fill, laid on its side, so
 * the page opens and closes on the same gesture. `width` rather than `scaleX`,
 * because `shadow-glow-line` distorts under a transform.
 *
 * The finish line's offset is `['start end', 'end end']` on purpose. This is
 * the last element in the document and only about one viewport tall, so the
 * obvious `['start start', 'end end']` leaves almost no travel and collapses to
 * zero on a short viewport — the fill would sit at 0 forever. Measuring from
 * the section entering the viewport gives it a full viewport of range at any
 * height.
 */

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

import { cn } from '@/lib/cn';
import { Button, MonoLabel, SocialLinks } from '@/components/ui';
import { StretchScrub } from '@/components/motion';
import { profile } from '@/data';
import { usePrefersReducedMotion } from '@/hooks';
import type { SectionProps } from '@/types';

const FOOTER_LINK_CLASSES =
  'tracking-chip text-text-faint hover:text-text font-mono text-[9px] uppercase transition-colors md:text-[10px]';

export function Contact({ id = 'contact', className }: SectionProps) {
  const hasEmail = profile.email.length > 0;
  const prefersReducedMotion = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end end'],
  });
  const finishLineWidth = useTransform(scrollYProgress, (v) => `${v * 100}%`);

  return (
    <section
      ref={sectionRef}
      id={id}
      className={cn(
        'flex min-h-[92vh] flex-col items-center justify-center px-5 pt-[100px] text-center md:min-h-screen md:px-[72px] md:pt-[150px]',
        className,
      )}
    >
      {/* The contact header breaks the shared section pattern by design; the
          SectionHeading component is deliberately not used here. */}
      <MonoLabel size="sm" tracking="kicker" tone="accent" lang="en" className="md:text-[11px]">
        09 — Contact
      </MonoLabel>
      <StretchScrub>
        <h2
          lang="en"
          className="tracking-display stretch-scrub mt-6 text-[15vw] leading-[0.96] font-black uppercase md:mt-9 md:text-[clamp(56px,8vw,140px)]"
        >
          Let&apos;s race
          <br />
          {/* Instrument Serif is static and ignores the axes; pinning it is
              belt and braces against a future variable serif inheriting a
              `wdth` meant for Archivo. */}
          <em className="font-serif font-normal tracking-normal normal-case italic [font-variation-settings:normal]">
            together.
          </em>
        </h2>
      </StretchScrub>
      <p className="text-text-secondary mt-7 max-w-[520px] text-[14px] leading-[1.75] md:mt-11 md:text-[17px] md:leading-[1.8]">
        Sponsorluk, iş birliği ve medya çalışmaları için bana ulaşın. Markanızı simülasyondan gerçek
        piste uzanan bir hikayenin parçası yapalım.
      </p>
      <Button
        href={hasEmail ? `mailto:${profile.email}` : '#contact'}
        variant="primary"
        size="lg"
        lang="en"
        className="mt-9 md:mt-[52px]"
      >
        {hasEmail ? profile.email : 'Business Enquiries'} →
      </Button>
      <div className="mt-8 flex gap-6 md:mt-11 md:gap-9">
        <SocialLinks linkClassName="tracking-mono-lg text-text-secondary hover:text-accent-primary py-2.5 font-mono text-[10px] uppercase transition-colors duration-[250ms] md:py-0 md:text-[11px]" />
      </div>

      {/* Footer */}
      <footer className="border-hairline-mid relative mt-20 flex w-full max-w-[1280px] flex-col items-center gap-2.5 border-t pt-6 pb-8 md:mt-[130px] md:flex-row md:justify-between md:pt-7 md:pb-[34px]">
        {/* The finish line, drawn over the footer's own top rule. No translate
            or scale utility here: in Tailwind v4 those compile to standalone
            properties that compose with `transform` rather than override it —
            and `left-0` alone, never `inset-x-0`, so the animated width is not
            fighting a right edge. */}
        <motion.span
          aria-hidden="true"
          className="bg-accent-primary shadow-glow-line absolute -top-px left-0 h-px"
          style={{ width: prefersReducedMotion ? '100%' : finishLineWidth }}
        />
        <MonoLabel size="xs" tracking="chip" tone="faint" lang="en" className="md:text-[10px]">
          © {new Date().getFullYear()} Yavuz Eymen
        </MonoLabel>
        <MonoLabel size="xs" tracking="chip" tone="faint" lang="en" className="md:text-[10px]">
          NoGripSimRacing
        </MonoLabel>
        <span className="flex gap-5 md:gap-6">
          <a href="#" className={FOOTER_LINK_CLASSES}>
            Gizlilik
          </a>
          <a href="#" className={FOOTER_LINK_CLASSES}>
            Şartlar
          </a>
        </span>
      </footer>
    </section>
  );
}
