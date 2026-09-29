/**
 * The compact bar that keeps navigation on screen on desktop once the hero has
 * gone. The hero's own chrome — wordmark, hamburger, PAGES and FOLLOW ON — is
 * positioned inside the hero and scrolls away with it, as the design has it;
 * without this bar, everything after the first viewport had no navigation and
 * no call to action at all.
 *
 * Wordmark on the left, then the four `NAV_ITEMS` behind a hairline, and the
 * red Business Enquiries CTA on the right. Below `lg` the four links do not fit
 * beside the wordmark and the CTA, so they fold into the same hamburger the
 * hero bar uses, and the overlay menu lists them — with the same highlight.
 *
 * ## When it shows
 *
 * Hidden while any of the hero is on screen, shown from the moment the hero's
 * last pixel slides up under where the bar sits. The hand-off is deliberate:
 * the hero's CTA sits in its bottom strip, so the bar's CTA arrives as that
 * one leaves, and the hero's wordmark is long gone by then.
 *
 * Hidden means gone, not just transparent: `inert` from the first frame of the
 * hide (no focus, no clicks, out of the accessibility tree), and
 * `visibility: hidden` once the slide has finished — so a keyboard user
 * tabbing through the hero never lands on an invisible link.
 *
 * ## Placement
 *
 * Fixed, so it never shifts layout. z-30: the scroll rail (40), the overlay
 * menu (50) and the skip link (60) all stay above it. The side padding is the
 * hero chrome's 40px, which also clears the lap rail — 24px wide on the right
 * edge — with 16px to spare; the rail's `04 / 09` readout sits over the bar's
 * right end, on the bar's own background, above its bottom hairline. A section
 * reached through one of these links keeps its heading well below the bar —
 * sections open with 150px of padding on desktop, 110px on the pinned Sim to
 * Real stage — so the 64px bar never covers a title it has just scrolled to.
 *
 * ## Motion
 *
 * It slides down and fades in over `DURATION.base`; under
 * `prefers-reduced-motion` it appears and disappears in place, instantly.
 *
 * The labels are English and carry `lang="en"`, as everywhere in the nav.
 */

import { motion, type Variants } from 'motion/react';

import { DURATION, EASE_OUT, NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/cn';
import { usePrefersReducedMotion } from '@/hooks';
import type { SectionId } from '@/types';

import { EnquiriesLink } from './EnquiriesLink';
import { MenuButton } from './MenuButton';

/**
 * The bar's height in CSS pixels. Set as an inline style rather than `h-16`,
 * so the element and the observer offset in `Nav` read the same number even
 * when the reader has changed the browser's base font size.
 */
export const DESKTOP_BAR_HEIGHT = 64;

const BAR_VARIANTS: Variants = {
  shown: { y: 0, opacity: 1, visibility: 'visible' },
  hidden: { y: '-100%', opacity: 0, transitionEnd: { visibility: 'hidden' } },
};

export interface DesktopBarProps {
  /** Whether the hero has scrolled away. */
  shown: boolean;
  /** The section the reader is in, from Nav's one scroll-spy. */
  activeId: SectionId | null;
  menuOpen: boolean;
  onToggleMenu: () => void;
  /** Classes shared with the side column's links. */
  linkClassName: string;
}

export function DesktopBar({
  shown,
  activeId,
  menuOpen,
  onToggleMenu,
  linkClassName,
}: DesktopBarProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      data-nav-bar=""
      inert={!shown}
      initial={false}
      animate={shown ? 'shown' : 'hidden'}
      variants={BAR_VARIANTS}
      transition={{ duration: prefersReducedMotion ? 0 : DURATION.base, ease: EASE_OUT }}
      style={{ height: DESKTOP_BAR_HEIGHT }}
      className="border-hairline bg-bg/85 fixed inset-x-0 top-0 z-30 hidden items-center border-b px-10 backdrop-blur-md md:flex"
    >
      <a
        href="#hero"
        lang="en"
        className="tracking-wordmark stretch-display text-[15px] font-black uppercase"
      >
        Yavuz Eymen
      </a>

      <div className="border-hairline-strong ml-8 hidden items-center gap-7 border-l pl-8 lg:flex">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            lang="en"
            // `location`, not `page`: these are anchors within one document.
            aria-current={item.id === activeId ? 'location' : undefined}
            className={cn(linkClassName, item.id === activeId && 'text-accent-primary')}
          >
            {item.label}
          </a>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-4">
        <EnquiriesLink className="px-[22px] py-3" />
        {/* The same 3px pull as the hero bar's, so the lines end where the
            hero's did. */}
        <MenuButton open={menuOpen} onToggle={onToggleMenu} className="-mr-[3px] lg:hidden" />
      </div>
    </motion.div>
  );
}
