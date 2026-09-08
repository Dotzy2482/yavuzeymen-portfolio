/**
 * Page chrome over the hero: top bar (wordmark + hamburger), the desktop side
 * columns (PAGES / FOLLOW ON) and the full-screen mobile menu.
 *
 * Lives under sections/ rather than components/ because it is a fixed part of
 * the page composition, not a reusable primitive.
 *
 * Positioning follows the design: on desktop the chrome belongs to the hero
 * and scrolls away with it (absolute); on mobile the bar stays fixed so the
 * menu is always reachable. The side columns sit vertically centred in the
 * first viewport, exactly like the prototype's in-hero nav.
 *
 * Every label here is English and carries `lang="en"` — the document is
 * `lang="tr"`, where `text-transform: uppercase` maps `i` to `İ`.
 */

import { useState } from 'react';

import { NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/cn';
import { useActiveSection } from '@/hooks';
import { MonoLabel, SocialLinks } from '@/components/ui';

import { MobileMenu, MOBILE_MENU_ID } from './MobileMenu';

const NAV_LINK_CLASSES =
  'text-[13px] font-extrabold tracking-nav uppercase stretch-ui transition-colors duration-[250ms] hover:text-accent-primary';

export interface NavProps {
  className?: string;
}

export function Nav({ className }: NavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  // One observer for both lists — the mobile menu is handed the result rather
  // than spying on its own, so opening it does not start a second one.
  const activeId = useActiveSection(NAV_ITEMS.map((item) => item.id));

  return (
    <nav className={className} aria-label="Ana menü">
      {/* Top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-[14px] md:absolute md:px-10 md:py-[22px]">
        <a
          href="#hero"
          lang="en"
          className="tracking-wordmark stretch-display text-[15px] font-black uppercase md:text-[17px]"
        >
          Yavuz Eymen
        </a>
        <button
          type="button"
          aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
          aria-expanded={menuOpen}
          aria-controls={MOBILE_MENU_ID}
          onClick={() => setMenuOpen((open) => !open)}
          className="flex cursor-pointer flex-col gap-1.5 px-1.5 py-3"
        >
          <span className="bg-text block h-0.5 w-[26px]" />
          <span className="bg-text block h-0.5 w-[26px]" />
        </button>
      </div>

      {/* Desktop side columns — vertically centred in the hero viewport. */}
      <div className="absolute top-[50vh] left-10 z-20 hidden -translate-y-1/2 flex-col gap-3.5 md:flex">
        <MonoLabel size="sm" tracking="2xl" lang="en" className="mb-1">
          Pages
        </MonoLabel>
        {NAV_ITEMS.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            lang="en"
            // `location`, not `page`: these are anchors within one document.
            aria-current={item.id === activeId ? 'location' : undefined}
            className={cn(NAV_LINK_CLASSES, item.id === activeId && 'text-accent-primary')}
          >
            {item.label}
          </a>
        ))}
      </div>
      <div className="absolute top-[50vh] right-10 z-20 hidden -translate-y-1/2 flex-col items-end gap-3.5 md:flex">
        <MonoLabel size="sm" tracking="2xl" lang="en" className="mb-1">
          Follow on
        </MonoLabel>
        <SocialLinks linkClassName={NAV_LINK_CLASSES} />
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} activeId={activeId} />
    </nav>
  );
}
