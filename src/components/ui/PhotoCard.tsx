/**
 * A 9:16 Instagram-reel placeholder card: cover photo, bottom gradient scrim,
 * mono caption, optional cyan view count.
 *
 * Shared by the Content section's desktop card fan and its mobile carousel —
 * the fan owns the rotation/hover treatment, this card only draws itself.
 */

import { cn } from '@/lib/cn';

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
        'bg-surface relative aspect-[9/16] overflow-hidden border',
        emphasis ? 'border-border-emphasis' : 'border-hairline-strong',
        className,
      )}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={cn('absolute inset-0 h-full w-full object-cover', !emphasis && 'opacity-85')}
      />
      <div
        className={cn(
          'from-bg/90 absolute inset-x-0 bottom-0 flex items-baseline justify-between gap-2 bg-gradient-to-t to-transparent',
          emphasis ? 'p-[18px]' : 'p-3.5',
        )}
      >
        <span
          className={cn(
            'tracking-label font-mono text-[9px]',
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
