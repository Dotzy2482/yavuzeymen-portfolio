/**
 * 08 — PARTNERS: Yavuz's partners, one feature card each.
 *
 * Today that is his team alone. The section used to be a six-cell logo wall —
 * four logos forced white and two dashed "YOUR BRAND HERE" slots — but three
 * of those logos sponsor the team, not him (see data/partners.ts), and one
 * logo beside five empty cells would read as a vacancy notice. So each partner
 * gets a card: the logo in its own colours on the left, what the partnership
 * is on the right, set like the hero's team card (cyan rule, mono kicker,
 * display name). The pitch the empty slots used to make is one line under the
 * cards, linking to Contact.
 *
 * The logo is shown at no more than its native 256px width: it is a small PNG,
 * and upscaling it would soften the edges the card is there to show off.
 */

import { cn } from '@/lib/cn';
import { MonoLabel, Picture, SectionHeading } from '@/components/ui';
import { StretchScrub } from '@/components/motion';
import { partners, type Partner } from '@/data';
import type { SectionProps } from '@/types';

interface PartnerCardProps {
  partner: Partner;
}

function PartnerCard({ partner }: PartnerCardProps) {
  return (
    <article className="border-hairline bg-surface grid border md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div className="border-hairline flex h-[180px] items-center justify-center border-b px-8 md:h-[280px] md:border-r md:border-b-0">
        <Picture
          src={partner.logoSrc}
          alt={partner.logoAlt}
          loading="lazy"
          width={partner.intrinsicWidth}
          height={partner.intrinsicHeight}
          className="block h-auto w-[200px] max-w-full md:w-[256px]"
        />
      </div>
      <div className="flex flex-col justify-center px-6 py-8 md:px-12">
        <div className="border-accent-primary flex flex-col gap-2 border-l-2 pl-4 md:gap-3 md:pl-5">
          <MonoLabel size="md" tracking="xl" tone="accent" lang="en">
            {partner.kind}
          </MonoLabel>
          <h3
            lang="en"
            className="tracking-ui stretch-wide text-[22px] leading-[1.1] font-black uppercase md:text-[30px]"
          >
            {partner.name}
          </h3>
          <p className="text-text-body max-w-[420px] text-[14px] leading-relaxed md:text-[15px]">
            {partner.note}
          </p>
        </div>
      </div>
    </article>
  );
}

export function Partners({ id = 'partners', className }: SectionProps) {
  return (
    <section id={id} className={cn('container-section', className)}>
      <StretchScrub>
        <SectionHeading index="08" title="Partners" stretch="scrub" />
      </StretchScrub>
      <div className="mt-9 flex flex-col gap-5 md:mt-[72px]">
        {partners.map((partner) => (
          <PartnerCard key={partner.id} partner={partner} />
        ))}
      </div>
      <div className="mt-6 flex flex-col gap-3 md:mt-8 md:flex-row md:items-center md:justify-between">
        <p className="text-text-secondary text-[14px] md:text-[15px]">
          Bu sayfadaki bir sonraki partner siz olabilirsiniz.
        </p>
        <a
          href="#contact"
          lang="en"
          className="tracking-btn stretch-ui text-accent-primary hover:text-text duration-base self-start text-[13px] font-extrabold uppercase transition-colors md:self-auto"
        >
          Become a partner →
        </a>
      </div>
    </section>
  );
}
