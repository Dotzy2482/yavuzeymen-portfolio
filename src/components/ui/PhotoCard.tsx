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
 * it is on screen: it is `preload="none"`, starts when `playThreshold` of the
 * card is in view and pauses when it leaves, so a visitor who never reaches
 * the section fetches none of them. `play="hover"` waits for the pointer as
 * well: five 540 × 960 clips decoding at once inside a fan that rotates and
 * scrolls made the section stutter, so the fan autoplays its centre card only
 * and its side cards come alive under the pointer.
 *
 * `src` is the cover picture, and it is always drawn: the video sits on top of
 * it, transparent until it is actually playing, then fades in. A `poster`
 * would not do — browsers drop it as soon as play() is called and paint black
 * until the first frame decodes, which flashed every card black on a phone.
 * Videos play under reduced motion too. They used to give way to the still
 * there, and Windows' "Animation effects" switch sets that preference on
 * plenty of machines whose owners never chose it, so the reels simply never
 * played on them. The clips are the section's content, not decoration.
 */

import { useEffect, useState } from 'react';

import { cn } from '@/lib/cn';
import { useInView } from '@/hooks';

import { Picture } from './Picture';

export interface PhotoCardProps {
  /** The cover photo, drawn under the video until it has a frame. */
  src: string;
  /** Muted loop to play over the cover while the card is on screen. */
  video?: string;
  alt?: string;
  caption: string;
  /** Right-aligned cyan figure, e.g. a real view count. */
  stat?: string;
  /**
   * `view`: loop whenever on screen. `hover`: loop only while the pointer is on
   * it. `manual`: play once, when `playing` says so, and report the end through
   * `onEnded` — the fan's playlist drives its centre card this way.
   */
  play?: 'view' | 'hover' | 'manual';
  /** For `play="manual"`: whether the clip should be running now. */
  playing?: boolean;
  /** For `play="manual"`: called when the clip reaches its end. */
  onEnded?: () => void;
  /** Share of the card that must be visible for its video to run. */
  playThreshold?: number;
  /** The centre card of the fan: full-opacity picture, stronger border. */
  emphasis?: boolean;
  className?: string;
}

const MEDIA_CLASSES =
  'duration-slow absolute inset-0 h-full w-full object-cover transition-transform ease-out motion-safe:group-hover:scale-[1.04]';

interface CardVideoProps {
  src: string;
  className: string;
  /** False holds the clip paused even while it is on screen. */
  active: boolean;
  threshold: number;
  /** Ignore visibility and play whenever `active` (the caller has checked it). */
  manual: boolean;
  onEnded?: () => void;
}

function CardVideo({ src, className, active, threshold, manual, onEnded }: CardVideoProps) {
  const { ref, inView } = useInView<HTMLVideoElement>({ threshold, once: false });
  const shouldPlay = active && (manual || inView);
  // Hidden until it has a frame to show. With `preload="none"` a browser
  // drops the poster the moment play() is called and paints black until the
  // first frame decodes, which on a phone flashed every card black as it
  // scrolled into view. The cover picture sits underneath instead, and the
  // video fades in over it once it is actually playing.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (shouldPlay) {
      // play() returns a promise in browsers (rejected if autoplay is
      // refused, which muted inline video never is) and nothing in jsdom.
      const playing = video.play() as Promise<void> | undefined;
      playing?.catch(() => {});
    } else {
      video.pause();
    }
    // `src` too: a card that reaches the fan's centre swaps its preview for
    // the full clip, and the new source has to be started again.
  }, [shouldPlay, src, ref]);

  return (
    <video
      ref={ref}
      src={src}
      muted
      loop={!manual}
      playsInline
      onEnded={onEnded}
      onPlaying={() => setReady(true)}
      preload="none"
      aria-hidden="true"
      className={cn(className, 'transition-[transform,opacity]', !ready && 'opacity-0')}
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
  play = 'view',
  playing = false,
  onEnded,
  playThreshold = 0.25,
  className,
}: PhotoCardProps) {
  const [hovered, setHovered] = useState(false);
  // The dimming sits on a wrapper, not on each layer: with the video over the
  // cover picture, two 85% layers would let the picture show through.
  const mediaFrameClasses = cn('absolute inset-0', !emphasis && 'opacity-85');

  return (
    <div
      onPointerEnter={play === 'hover' ? () => setHovered(true) : undefined}
      onPointerLeave={play === 'hover' ? () => setHovered(false) : undefined}
      className={cn(
        'bg-surface group rounded-card relative aspect-[9/16] overflow-hidden border',
        emphasis ? 'border-border-emphasis' : 'border-hairline-strong',
        className,
      )}
    >
      <div className={mediaFrameClasses}>
        <Picture src={src} alt={alt} loading="lazy" className={MEDIA_CLASSES} />
        {video && (
          <CardVideo
            // Keyed by clip: a card that reaches the fan's centre swaps its
            // preview for the full clip, and the new one must stay hidden
            // until it has a frame, like the first did.
            key={video}
            src={video}
            className={MEDIA_CLASSES}
            active={play === 'manual' ? playing : play === 'view' || hovered}
            threshold={playThreshold}
            manual={play === 'manual'}
            onEnded={onEnded}
          />
        )}
      </div>
      <div
        className={cn(
          'from-bg/90 absolute inset-x-0 bottom-0 flex items-baseline justify-between gap-2 bg-gradient-to-t to-transparent',
          emphasis ? 'p-[18px]' : 'p-3.5',
        )}
      >
        {/* 11px so the caption can be read; tracking closed to `caps` to pay
            for it, which keeps a long caption on one line in the fan's 230px
            card. Wrapped, the first line of one started under the centre card
            that overlaps it. It still wrapped at some widths with a pixel to
            spare, so the caption is held to one line too, with an ellipsis
            rather than a second line if it ever runs out of room. */}
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
