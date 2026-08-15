/**
 * Sticky navigation with a scroll-progress indicator.
 *
 * Lives under sections/ rather than components/ because it is a fixed part of
 * the page composition, not a reusable primitive.
 *
 * TODO: highlight the active section using useScrollProgress / useInView.
 * TODO: draw the progress rail.
 * TODO: implement the mobile menu.
 * TODO: add a skip-to-content link — a fixed nav in front of a long page needs
 *       one.
 */

import { cn } from '@/lib/cn';
import { NAV_ITEMS } from '@/lib/constants';

export interface NavProps {
  className?: string;
}

export function Nav({ className }: NavProps) {
  return (
    <nav className={cn('nav', className)} aria-label="Main">
      <ul>
        {NAV_ITEMS.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`}>{item.label}</a>
          </li>
        ))}
      </ul>
      {/* TODO: scroll progress rail */}
    </nav>
  );
}
