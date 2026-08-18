/**
 * 05 — SIM TO REAL: the pinned horizontal gallery.
 *
 * Desktop: a 240vh wrapper pins a 100vh stage; scroll progress translates the
 * varied-height photo row left by exactly its overflow
 * (`x = −p × (rowWidth − viewportWidth)`), so the row lands flush at the end
 * of the pin. Photos are bottom-aligned, sim → real, ending on the empty
 * karting slot.
 *
 * Mobile: a plain vertical stack, no pinning (and no pit-pass shot, per the
 * mobile design).
 */

import { useEffect, useRef, useState } from 'react';
import { motion, useTransform, type MotionValue } from 'motion/react';

import { cn } from '@/lib/cn';
import { BREAKPOINTS } from '@/lib/constants';
import { useMediaQuery, usePrefersReducedMotion } from '@/hooks';
import { Pinned } from '@/components/motion';
import { MonoLabel, SectionHeading } from '@/components/ui';
import { simToRealItems, type SimToRealItem } from '@/data';
import type { SectionProps } from '@/types';

const LEAD =
  "Simülatörde öğrendi, gerçek pistte kanıtladı. Soldan sağa: rig'den TOSFED padoklarına, FIAT Egea direksiyonuna.";

interface GalleryPhotoProps {
  item: SimToRealItem;
  mobile: boolean;
}

function GalleryPhoto({ item, mobile }: GalleryPhotoProps) {
  return (
    <figure className={cn('flex flex-col', mobile ? 'gap-2.5' : 'gap-3.5')}>
      <MonoLabel
        size={mobile ? 'xs' : 'sm'}
        tracking="xl"
        tone={item.accent ? 'accent' : 'secondary'}
      >
        {item.label}
      </MonoLabel>
      {item.src ? (
        <img
          src={item.src}
          alt={item.alt}
          loading="lazy"
          style={mobile ? undefined : { height: item.height }}
          className={cn('block saturate-[0.92]', mobile ? 'h-auto w-full' : 'w-auto')}
        />
      ) : (
        // The empty karting slot — photo to come.
        <div
          style={mobile ? { height: 280 } : { height: item.height, width: item.width }}
          className={cn(
            'border-border-dashed flex items-center justify-center border border-dashed',
            mobile && 'w-full',
          )}
        >
          <MonoLabel size="xs" tracking="mono" tone="faint">
            Karting fotoğrafı yakında
          </MonoLabel>
        </div>
      )}
    </figure>
  );
}

interface DesktopStageProps {
  progress: MotionValue<number>;
}

function DesktopStage({ progress }: DesktopStageProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Measure how far the row overflows the viewport; re-measure on resize.
  useEffect(() => {
    const measure = () => {
      const row = rowRef.current;
      if (row) setOverflow(Math.max(0, row.scrollWidth - window.innerWidth));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const x = useTransform(progress, (v) => -v * overflow);

  return (
    <div className="flex h-full flex-col">
      <div className="mx-auto w-full max-w-[1360px] px-[72px] pt-[110px]">
        <SectionHeading index="05" title="Sim to" accent="Real" lead={LEAD} />
      </div>
      <motion.div
        ref={rowRef}
        className="mt-auto flex w-max items-end gap-10 px-[72px] pt-8 pb-[9vh] will-change-transform"
        style={prefersReducedMotion ? undefined : { x }}
      >
        {simToRealItems.map((item) => (
          <GalleryPhoto key={item.id} item={item} mobile={false} />
        ))}
      </motion.div>
    </div>
  );
}

export function SimToReal({ id = 'sim-to-real', className }: SectionProps) {
  const isDesktop = useMediaQuery(BREAKPOINTS.md);

  if (isDesktop) {
    return (
      <section id={id} className={className}>
        <Pinned heightVh={240}>{(progress) => <DesktopStage progress={progress} />}</Pinned>
      </section>
    );
  }

  return (
    <section id={id} className={cn('container-section', className)}>
      <SectionHeading index="05" title="Sim to" accent="Real" lead={LEAD} />
      <div className="mt-9 flex flex-col gap-8">
        {simToRealItems
          .filter((item) => !item.mobileHidden)
          .map((item) => (
            <GalleryPhoto key={item.id} item={item} mobile />
          ))}
      </div>
    </section>
  );
}
