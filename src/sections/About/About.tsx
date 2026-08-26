/**
 * 01 — WHO IS YAVUZ EYMEN?
 *
 * Two-column split: four hairline-separated Turkish paragraphs on the left,
 * the seated studio portrait with an overlapping 2×2 stat card on the right.
 * On mobile the portrait + stat card come before the copy, per the mobile
 * design. Copy is design-final and holds inline <strong> emphasis, which is
 * why it lives here rather than in a data file.
 */

import { Fragment } from 'react';

import { cn } from '@/lib/cn';
import { Divider, SectionHeading, StatValue } from '@/components/ui';
import { profile } from '@/data';
import type { SectionProps } from '@/types';

const PARAGRAPHS: React.ReactNode[] = [
  <>
    Yaklaşık 7 yıldır sim racing dünyasında aktif olarak yarışıyorum. Ulusal ve uluslararası
    organizasyonlarda mücadele ediyor, bugün{' '}
    <strong className="text-text font-bold">Team Curve Hunters</strong> ana takım pilotu olarak
    yarışıyorum.
  </>,
  <>
    <strong className="text-text font-bold">NoGripSimRacing</strong> markasının kurucusuyum;
    Instagram ve YouTube&apos;da sim racing içerikleri üretiyor, canlı yayınlar yapıyorum.
  </>,
  <>
    iRacing ve ACC&apos;de GT3 sınıfında yarışıyorum.{' '}
    <strong className="text-text font-bold">4.020 iRating</strong> ve A 1.39 lisans ile
    Türkiye&apos;nin ilk 50 pilotu arasındayım.
  </>,
  <>
    Simülatörde öğrendiklerimi gerçek piste taşıdım:{' '}
    <strong className="text-text font-bold">TOSFED</strong> ve{' '}
    <strong className="text-text font-bold">FIAT</strong> programlarında gerçek yarış deneyimi
    kazandım.
  </>,
];

export function About({ id = 'about', className }: SectionProps) {
  return (
    <section id={id} className={cn('container-section', className)}>
      <SectionHeading index="01" title="Who is" accent="Yavuz Eymen?" />
      <div className="mt-9 grid items-start gap-8 md:mt-[72px] md:grid-cols-[1.1fr_1fr] md:gap-20">
        <div className="order-2 flex flex-col md:order-1">
          {PARAGRAPHS.map((paragraph, i) => (
            <Fragment key={i}>
              {i > 0 && <Divider />}
              <p className="text-text-body py-[18px] text-[15px] leading-[1.75] md:py-[26px] md:text-[17px] md:leading-[1.8]">
                {paragraph}
              </p>
            </Fragment>
          ))}
        </div>
        <div className="relative order-1 md:order-2">
          <img
            src="/images/portraits/studio-seated.jpg"
            alt="Yavuz Eymen — stüdyo portresi"
            loading="lazy"
            width={1023}
            height={1537}
            className="block h-auto w-full [mask-image:linear-gradient(#000_78%,transparent_100%)]"
          />
          <div className="border-hairline-mid bg-surface relative z-[1] -mt-14 grid grid-cols-2 gap-x-6 gap-y-3.5 border p-[18px] md:absolute md:bottom-9 md:-left-7 md:mt-0 md:gap-x-9 md:px-[26px] md:py-[22px]">
            {profile.stats.map((stat) => (
              <StatValue
                key={stat.label}
                label={stat.label}
                value={stat.value}
                accent={stat.accent}
                size="sm"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
