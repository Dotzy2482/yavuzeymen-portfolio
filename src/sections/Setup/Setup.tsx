/**
 * 07 — SETUP: the technical-document equipment list next to the rig photo.
 *
 * Rows are mono component labels with bold values; every value is currently
 * the handoff's explicit "MODEL — YER TUTUCU" placeholder, dimmed to 45%
 * white until real models are filled into data/setup.ts.
 */

import { cn } from '@/lib/cn';
import { MonoLabel, SectionHeading } from '@/components/ui';
import { setupItems } from '@/data';
import type { SectionProps } from '@/types';

export function Setup({ id = 'setup', className }: SectionProps) {
  return (
    <section id={id} className={cn('container-section', className)}>
      <SectionHeading index="07" title="Setup" meta="EQUIPMENT SPEC" />
      <div className="mt-7 grid items-start gap-7 md:mt-[72px] md:grid-cols-[1.2fr_1fr] md:gap-20">
        <div className="flex flex-col">
          {setupItems.map((item) => (
            <div
              key={item.id}
              className="border-hairline-mid flex items-baseline justify-between gap-5 border-b py-[18px] md:gap-8 md:py-6"
            >
              <MonoLabel size="sm" tracking="chip" className="md:tracking-mono-lg md:text-[11px]">
                {item.label}
              </MonoLabel>
              <span
                className={cn(
                  'tracking-caps stretch-ui text-right text-[13px] font-extrabold uppercase md:text-[16px]',
                  item.placeholder ? 'text-text-tertiary' : 'text-text',
                )}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
        <img
          src="/images/simtoreal/rig.png"
          alt="Sim rig"
          loading="lazy"
          width={433}
          height={545}
          className="border-hairline block h-auto w-full border"
        />
      </div>
    </section>
  );
}
