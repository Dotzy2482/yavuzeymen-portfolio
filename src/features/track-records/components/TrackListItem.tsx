/**
 * One row in the circuit list: name, country and the record lap time.
 *
 * TODO: implement the selected/hover treatment (accent rule, slide-in).
 * TODO: show the formatted lap time via formatLapTime once it is implemented.
 * TODO: verify the listbox semantics with a screen reader — the row must be
 *       reachable and its selected state announced.
 */

import { cn } from '@/lib/cn';

import type { Track, TrackId } from '../data/types';

export interface TrackListItemProps {
  track: Track;
  isSelected: boolean;
  onSelect: (id: TrackId) => void;
  className?: string;
}

export function TrackListItem({ track, isSelected, onSelect, className }: TrackListItemProps) {
  return (
    <li
      role="option"
      aria-selected={isSelected}
      className={cn('track-list-item', isSelected && 'is-selected', className)}
    >
      <button type="button" onClick={() => onSelect(track.id)}>
        <span className="track-list-item__name">{track.name}</span>
        <span className="track-list-item__country text-text-muted">{track.country}</span>
        {/* TODO: formatLapTime(track.lapTimeMs) */}
        <span className="num">--:--.---</span>
      </button>
    </li>
  );
}
