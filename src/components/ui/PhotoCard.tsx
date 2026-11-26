/**
 * A 9:16 reel card: a cover photo or a short muted video loop, bottom gradient
 * scrim, mono caption, optional cyan view count.
 *
 * Shared by the Content section's desktop card fan and its mobile carousel —
 * the fan owns the rotation/hover treatment, this card only draws itself, and
 * eases its picture in a little under the pointer, which reads as the card
 * being picked up. Rounded, unlike the rest of the site: these are phone
 * screens.
 *
 * ## Video
 *
 * With a `video`, the card plays that clip muted and looped — but only while
 * it is on screen: it is `preload="none"`, starts when a quarter of the card
 * is in view and pauses when it leaves, so five clips never download or
 * decode at once and a visitor who never reaches the section fetches none of
 * them. `src` is the poster, shown until the first frame is ready. Under
 * reduced motion the card is the poster alone, as a picture: a looping video
 * is motion, and the still says the same thing.
 */

import { useEffect } from 'react';

import { cn } from '@/lib/cn';
import { useInView, usePrefersReducedMotion } from '@/hooks';

import { Picture } from './Picture';

export interface PhotoCardProps {
  /** The cover photo; the poster frame when there is a video. */
  src: string;
  /** Muted loop to play over the cover while the card is on screen. */
  video?: string;
  alt?: string;
  caption: string;
  /** Right-aligned cyan figure, e.g. `'797K'`. */
  stat?: string;
  /** The centre card of the fan: full-opacity picture, stronger border. */
  emphasis?: boolean;
  className?: string;
}

const MEDIA_CLASSES =
  'duration-slow absolute inset-0 h-full w-full object-cover transition-transform ease-out motion-safe:group-hover:scale-[1.04]';

interface CardVideoProps {
  src: string;
  poster: string;
  className: string;
}

function CardVideo({ src, poster, className }: CardVideoProps) {
  const { ref, inView } = useInView<HTMLVideoElement>({ threshold: 0.25, once: false });

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (inView) {
      // play() returns a promise in browsers (rejected if autoplay is
      // refused, which muted inline video never is) and nothing in jsdom.
      const playing = video.play() as Promise<void> | undefined;
      playing?.catch(() => {});
    } else {
      video.pause();
    }
  }, [inView, ref]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      className={className}
    />
  );
}

export function PhotoCard({
  src,
  video,
  alt = '',
  caption,
  stat,
  emphasis = false,
  className,
}: PhotoCardProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const mediaClasses = cn(MEDIA_CLASSES, !emphasis && 'opacity-85');

  return (
    <div
      className={cn(
        'bg-surface group rounded-card relative aspect-[9/16] overflow-hidden border',
        emphasis ? 'border-border-emphasis' : 'border-hairline-strong',
        className,
      )}
    >
      {video && !prefersReducedMotion ? (
        <CardVideo src={video} poster={src} className={mediaClasses} />
      ) : (
        <Picture src={src} alt={alt} loading="lazy" className={mediaClasses} />
      )}
      <div
        className={cn(
          'from-bg/90 absolute inset-x-0 bottom-0 flex items-baseline justify-between gap-2 bg-gradient-to-t to-transparent',
          emphasis ? 'p-[18px]' : 'p-3.5',
        )}
      >
        {/* 11px so the caption can be read; tracking closed to `caps` to pay
            for it, which keeps "REEL — BEHIND THE SCENES" on one line in the
            fan's 230px card. Wrapped, its first line started under the centre
            card that overlaps it and read "— BEHIND THE". It still wrapped at
            some widths with a pixel to spare, so the caption is held to one
            line too, with an ellipsis rather than a second line if it ever
            runs out of room. */}
        <span
          className={cn(
            'tracking-caps min-w-0 truncate font-mono text-[11px]',
            emphasis ? 'text-text' : 'text-text-body',
          )}
        >
          {caption}
        </span>
        {stat && <span className="num text-accent-primary text-[11px]">{stat}</span>}
      </div>
    </div>
  );
}
