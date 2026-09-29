/**
 * The page chrome: the top bar over the hero (wordmark + hamburger), the
 * desktop side columns (PAGES / FOLLOW ON), the compact desktop bar that takes
 * over once the hero has gone, the full-screen overlay menu, and the scroll
 * rail down the right edge that stands in for the hidden native scrollbar.
 *
 * Lives under sections/ rather than components/ because it is a fixed part of
 * the page composition, not a reusable primitive.
 *
 * ## Positioning
 *
 * On desktop the hero's chrome belongs to the hero and scrolls away with it
 * (absolute), exactly like the prototype's in-hero nav; the side columns sit
 * vertically centred in the first viewport. `DesktopBar` then keeps the
 * navigation and the CTA on screen for the rest of the page.
 *
 * On mobile the top bar stays fixed so the menu is always reachable. Fixed and
 * transparent, it would draw the wordmark over body copy, photos and counters
 * on nearly every screen, so once the page leaves its very top a background
 * fades in under it: the page ground at 85% with a blur and a hairline, so the
 * wordmark always reads on the bar's own surface. At the top, over the hero,
 * the bar stays clear as the design has it. Under reduced motion the
 * background appears without the fade.
 *
 * ## Landmarks
 *
 * Everything that navigates is inside the one `<nav>`, so a screen reader
 * finds a single "Ana menü" landmark however many copies of the links are on
 * screen. The scroll rail is outside it: it is aria-hidden chrome, not
 * navigation.
 *
 * ## The scroll-spy
 *
 * One `useActiveSection` observer, here, feeds all three lists — the side
 * column, the desktop bar and the overlay menu — so none of them spies on its
 * own.
 *
 * Every label here is English and carries `lang="en"` — the document is
 * `lang="tr"`, where `text-transform: uppercase` maps `i` to `İ`.
 */

import { useState } from 'react';
import { motion } from 'motion/react';

import { DURATION, NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/cn';
import { useActiveSection, usePrefersReducedMotion } from '@/hooks';
import { MonoLabel, SocialLinks } from '@/components/ui';

import { DesktopBar, DESKTOP_BAR_HEIGHT } from './DesktopBar';
import { MenuButton } from './MenuButton';
import { MobileMenu } from './MobileMenu';
import { ScrollRail } from './ScrollRail';
import { usePageScrolled, useSectionPassed } from './useNavChrome';

const NAV_LINK_CLASSES =
  'text-[13px] font-extrabold tracking-nav uppercase stretch-ui transition-colors duration-base hover:text-accent-primary';

export interface NavProps {
  className?: string;
}

export function Nav({ className }: NavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  // One observer for every list — the menu and the desktop bar are handed the
  // result rather than spying on their own, so neither starts a second one.
  const activeId = useActiveSection(NAV_ITEMS.map((item) => item.id));
  const scrolled = usePageScrolled();
  const heroPassed = useSectionPassed('hero', DESKTOP_BAR_HEIGHT);

  const toggleMenu = () => setMenuOpen((open) => !open);

  return (
    <>
      <nav className={className} aria-label="Ana menü">
        {/* Top bar. 9px + the 44px menu button + 9px = 62px on mobile, and
            17 + 44 + 17 = 78px on desktop: the heights the design gives it. */}
        <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-[9px] md:absolute md:px-10 md:py-[17px]">
          {/* Mobile only: the surface the wordmark reads on once content
              scrolls under the bar. Behind the bar's contents (-z-10 inside
              the bar's own stacking context), never in front of them. */}
          <motion.div
            aria-hidden="true"
            data-nav-surface=""
            className="border-hairline bg-bg/85 absolute inset-0 -z-10 border-b backdrop-blur-md md:hidden"
            initial={false}
            animate={{ opacity: scrolled ? 1 : 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : DURATION.base }}
          />
          <a
            href="#hero"
            lang="en"
            className="tracking-wordmark stretch-display text-[15px] font-black uppercase md:text-[17px]"
          >
            Yavuz Eymen
          </a>
          {/* -3px: the 44px box is wider than the old 38px one, and this keeps
              the lines' right end exactly where it was. */}
          <MenuButton open={menuOpen} onToggle={toggleMenu} className="-mr-[3px]" />
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

        <DesktopBar
          shown={heroPassed}
          activeId={activeId}
          menuOpen={menuOpen}
          onToggleMenu={toggleMenu}
          linkClassName={NAV_LINK_CLASSES}
        />

        <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} activeId={activeId} />
      </nav>
      {/* Outside the landmark: it is aria-hidden chrome, not navigation. */}
      <ScrollRail />
    </>
  );
}
