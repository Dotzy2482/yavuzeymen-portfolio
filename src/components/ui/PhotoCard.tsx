/**
 * A 9:16 Instagram-reel placeholder card: cover photo, bottom gradient scrim,
 * mono caption, optional cyan view count.
 *
 * Shared by the Content section's desktop card fan and its mobile carousel —
 * the fan owns the rotation/hover treatment, this card only draws itself, and
 * eases its photo in a little under the pointer, which reads as the card being
 * picked up. Rounded, unlike the rest of the site: these are phone screens.
 */

import { cn } from '@/lib/cn';

import { Picture } from './Picture';

export interface PhotoCardProps {
  src: string;
  alt?: string;
  caption: string;
  /** Right-aligned cyan figure, e.g. `'797K'`. */
  stat?: string;
  /** The centre card of the fan: full-opacity photo, stronger border. */
  emphasis?: boolean;
  className?: string;
}

export function PhotoCard({
  src,
  alt = '',
  caption,
  stat,
  emphasis = false,
  className,
}: PhotoCardProps) {
  return (
    <div
      className={cn(
        'bg-surface group rounded-card relative aspect-[9/16] overflow-hidden border',
        emphasis ? 'border-border-emphasis' : 'border-hairline-strong',
        className,
      )}
    >
      <Picture
        src={src}
        alt={alt}
        loading="lazy"
        className={cn(
          'duration-slow absolute inset-0 h-full w-full object-cover transition-transform ease-out motion-safe:group-hover:scale-[1.04]',
          !emphasis && 'opacity-85',
        )}
      />
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
