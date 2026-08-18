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
 */

import { cn } from '@/lib/cn';
import { Button, MonoLabel, SocialLinks } from '@/components/ui';
import { profile } from '@/data';
import type { SectionProps } from '@/types';

const FOOTER_LINK_CLASSES =
  'tracking-chip text-text-faint hover:text-text font-mono text-[9px] uppercase transition-colors md:text-[10px]';

export function Contact({ id = 'contact', className }: SectionProps) {
  const hasEmail = profile.email.length > 0;

  return (
    <section
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
      <h2
        lang="en"
        className="tracking-display stretch-display mt-6 text-[15vw] leading-[0.96] font-black uppercase md:mt-9 md:text-[clamp(56px,8vw,140px)]"
      >
        Let&apos;s race
        <br />
        <em className="font-serif font-normal tracking-normal normal-case italic">together.</em>
      </h2>
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
      <footer className="border-hairline-mid mt-20 flex w-full max-w-[1280px] flex-col items-center gap-2.5 border-t pt-6 pb-8 md:mt-[130px] md:flex-row md:justify-between md:pt-7 md:pb-[34px]">
        <MonoLabel size="xs" tracking="chip" tone="faint" lang="en" className="md:text-[10px]">
          © 2026 Yavuz Eymen
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
