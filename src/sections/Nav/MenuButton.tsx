/**
 * The two-line hamburger that opens the overlay menu. Rendered in the top bar
 * over the hero on every viewport, and in the desktop bar at widths too narrow
 * for its four links.
 *
 * The box is 44 × 44 — the minimum touch target — while the icon keeps the
 * design's two 26px lines, centred in it. The extra room is taken out of the
 * bars' padding, not added to their height.
 *
 * The labels are Turkish, like the rest of the site's interface copy.
 */

import { cn } from '@/lib/cn';

import { MOBILE_MENU_ID } from './MobileMenu';

export interface MenuButtonProps {
  open: boolean;
  onToggle: () => void;
  className?: string;
}

export function MenuButton({ open, onToggle, className }: MenuButtonProps) {
  return (
    <button
      type="button"
      aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
      aria-expanded={open}
      aria-controls={MOBILE_MENU_ID}
      onClick={onToggle}
      className={cn(
        'flex size-11 cursor-pointer flex-col items-center justify-center gap-1.5',
        className,
      )}
    >
      <span className="bg-text block h-0.5 w-[26px]" />
      <span className="bg-text block h-0.5 w-[26px]" />
    </button>
  );
}
