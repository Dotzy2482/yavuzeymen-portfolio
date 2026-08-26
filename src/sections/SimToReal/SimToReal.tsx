/**
 * 05 — SIM TO REAL: the pinned horizontal gallery.
 *
 * Desktop: a 240vh wrapper pins a 100vh stage; scroll progress translates the
 * varied-height photo row left by exactly its overflow
 * (`x = −p × (rowWidth − viewportWidth)`), so the row lands flush at the end
 * of the pin. Photos are bottom-aligned, sim → real, ending on the empty
 * karting slot.
 *
 * Desktop under reduced motion: no pin and no scrub. The row keeps its
 * left-to-right reading but becomes a plainly scrollable strip — pinning it
 * without the scrub would leave most of the gallery clipped inside an
 * overflow-hidden stage with no way to reach it.
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
          // Intrinsic size, so the photo occupies its final width before it
          // decodes. The pinned row is measured to work out the scrub distance.
          width={item.intrinsicWidth ?? undefined}
          height={item.intrinsicHeight ?? undefined}
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

/** The desktop photo row, shared by the pinned stage and the reduced-motion strip. */
function GalleryRow() {
  return (
    <>
      {simToRealItems.map((item) => (
        <GalleryPhoto key={item.id} item={item} mobile={false} />
      ))}
    </>
  );
}

interface DesktopStageProps {
  progress: MotionValue<number>;
}

function DesktopStage({ progress }: DesktopStageProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(0);

  // How far the row overflows the viewport, which is exactly how far the scrub
  // has to travel. Re-measured on viewport resize *and* whenever the row's own
  // size changes — a window listener alone misses the photos finishing decode.
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const measure = () => setOverflow(Math.max(0, row.scrollWidth - window.innerWidth));
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(row);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
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
        style={{ x }}
      >
        <GalleryRow />
      </motion.div>
    </div>
  );
}

export function SimToReal({ id = 'sim-to-real', className }: SectionProps) {
  const isDesktop = useMediaQuery(BREAKPOINTS.md);
  const prefersReducedMotion = usePrefersReducedMotion();

  if (isDesktop && !prefersReducedMotion) {
    return (
      <section id={id} className={className}>
        <Pinned heightVh={240}>{(progress) => <DesktopStage progress={progress} />}</Pinned>
      </section>
    );
  }

  if (isDesktop) {
    return (
      <section id={id} className={cn('container-section container-wide', className)}>
        <SectionHeading index="05" title="Sim to" accent="Real" lead={LEAD} />
        <div className="-mx-[var(--gutter)] mt-11 overflow-x-auto px-[var(--gutter)] pb-4">
          <div className="flex w-max items-end gap-10">
            <GalleryRow />
          </div>
        </div>
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
