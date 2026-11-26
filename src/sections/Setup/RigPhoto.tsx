/**
 * The photo of Yavuz's own rig, with numbered markers on the hardware the
 * spec list names: wheel, pedals, displays, PC. Each marker's number also
 * leads the list rows it belongs to, so the list and the photo read as one
 * annotated drawing rather than a table beside a picture.
 *
 * Markers are placed in percent of the photo (data/setup.ts), so they stay on
 * their object at every size. They pop in one after another when the photo
 * comes into view, and a ring breathes around each; under reduced motion they
 * are simply there.
 */

import { motion } from 'motion/react';

import { Picture } from '@/components/ui';
import { setupMarkers } from '@/data';
import { usePrefersReducedMotion } from '@/hooks';

const MARKER_CLASSES =
  'border-accent-primary bg-bg/75 text-accent-primary shadow-glow-dot absolute flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border font-mono text-[10px] backdrop-blur-sm md:size-8 md:text-[11px]';

export function RigPhoto() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <figure className="border-hairline relative m-0 border">
      <Picture
        src="/images/setup/desk.jpg"
        alt="Yavuz Eymen'in evdeki sim racing kurulumu: Logitech G29 direksiyon, Moza SRP pedallar, iki ekran ve oyun bilgisayarı"
        loading="lazy"
        width={1600}
        height={2000}
        className="block h-auto w-full"
      />
      {setupMarkers.map((marker, i) => (
        <span
          key={marker.n}
          role="img"
          aria-label={`${marker.n} — ${marker.label}`}
          className="absolute"
          style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
        >
          {prefersReducedMotion ? (
            <span className={MARKER_CLASSES}>{marker.n}</span>
          ) : (
            <motion.span
              className={MARKER_CLASSES}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22, delay: 0.25 + i * 0.12 }}
            >
              {marker.n}
              <motion.span
                aria-hidden="true"
                className="border-accent-primary absolute inset-0 rounded-full border"
                animate={{ scale: [1, 1.9], opacity: [0.6, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: i * 0.4 }}
              />
            </motion.span>
          )}
        </span>
      ))}
    </figure>
  );
}
