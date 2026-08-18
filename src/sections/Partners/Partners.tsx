/**
 * 08 — PARTNERS: hairline-bordered logo wall.
 *
 * Every logo is forced pure white (`brightness-0 invert`); the two dashed
 * "YOUR BRAND HERE" cells double as a sponsorship pitch and hover to cyan.
 * 3 columns on desktop, 2 on mobile.
 */

import { cn } from '@/lib/cn';
import { MonoLabel, SectionHeading } from '@/components/ui';
import { partners, emptySlots } from '@/data';
import type { SectionProps } from '@/types';

const CELL_CLASSES = 'flex h-[110px] items-center justify-center md:h-[160px]';

export function Partners({ id = 'partners', className }: SectionProps) {
  return (
    <section id={id} className={cn('container-section', className)}>
      <SectionHeading index="08" title="Partners" />
      <div className="mt-9 grid grid-cols-2 gap-3 md:mt-[72px] md:grid-cols-3 md:gap-5">
        {partners.map((partner) => {
          const img = (
            <img
              src={partner.logoFallbackSrc ?? partner.logoSrc}
              alt={partner.logoAlt}
              style={{ height: partner.gridHeight }}
              className="w-auto opacity-[0.92] brightness-0 invert"
            />
          );
          return (
            <div key={partner.id} className={cn(CELL_CLASSES, 'border-hairline border')}>
              {partner.logoFallbackSrc ? (
                <picture>
                  <source srcSet={partner.logoSrc} type="image/avif" />
                  {img}
                </picture>
              ) : (
                img
              )}
            </div>
          );
        })}
        {Array.from({ length: emptySlots }, (_, i) => (
          <div
            key={`slot-${i}`}
            className={cn(
              CELL_CLASSES,
              'group border-border-dashed hover:border-accent-primary cursor-default border border-dashed transition-colors duration-[250ms]',
            )}
          >
            <MonoLabel
              size="xs"
              tracking="mono"
              tone="faint"
              lang="en"
              className="group-hover:text-accent-primary md:tracking-mono-xl transition-colors duration-[250ms] md:text-[11px]"
            >
              Your brand here
            </MonoLabel>
          </div>
        ))}
      </div>
    </section>
  );
}
