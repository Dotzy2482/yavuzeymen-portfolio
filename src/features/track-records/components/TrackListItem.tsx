/**
 * One row of the desktop track list: index, country chip, name, best lap.
 *
 * Hover and the active state share the same 3px cyan inset edge; only the
 * background differs, so moving down the list reads as one continuous
 * highlight rather than two competing ones.
 */

import { cn } from '@/lib/cn';
import { padNumber } from '@/lib/format';

import { FlagChip } from './FlagChip';
import type { Track } from '../data/types';

export interface TrackListItemProps {
  track: Track;
  index: number;
  isActive: boolean;
  onSelect: (id: string) => void;
}

export function TrackListItem({ track, index, isActive, onSelect }: TrackListItemProps) {
  return (
    <button
      type="button"
      aria-current={isActive ? 'true' : undefined}
      onClick={() => onSelect(track.id)}
      className={cn(
        'border-track-row-line flex w-full cursor-pointer items-center gap-3 border-0 border-b px-4 py-5 text-left transition-[background,box-shadow] duration-[250ms]',
        'hover:bg-track-row-hover hover:shadow-[inset_3px_0_0_var(--accent-primary)]',
        isActive
          ? 'bg-accent-primary-dim shadow-[inset_3px_0_0_var(--accent-primary)]'
          : 'bg-transparent',
      )}
    >
      <span className="num text-text-faint w-[22px] text-[11px]">{padNumber(index + 1, 2)}</span>
      <FlagChip country={track.country} />
      {/* Circuit names are proper nouns — Turkish casing would render
          "Silverstone" as "SİLVERSTONE". */}
      <span
        lang="en"
        className="tracking-ui stretch-ui min-w-0 flex-1 truncate text-[14px] font-extrabold uppercase"
      >
        {track.name}
      </span>
      <span className="num text-text-strong shrink-0 text-[13px] whitespace-nowrap">
        {track.lap}
      </span>
    </button>
  );
}
