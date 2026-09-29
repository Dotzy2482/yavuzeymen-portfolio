/**
 * Full-screen overlay menu (PAGES + FOLLOW ON), from the mobile design.
 * Available on every viewport: the hamburger in the top bar opens it, and so
 * does the one in the desktop bar at widths too narrow for its four links.
 *
 * It also carries the Business Enquiries CTA, under the page links. The hero's
 * copy of that button is desktop-only, so without this one a phone's first
 * call to action was the Contact section, some 10,900px down. Like the page
 * links, it closes the menu as it navigates.
 *
 * It is a modal, so it behaves like one: `role="dialog"` + `aria-modal`, focus
 * moves inside on open, Tab cycles within it instead of escaping to the page
 * underneath, Escape closes, and focus returns to whatever opened it. A
 * full-screen overlay you can Tab out of is worse than no overlay, because the
 * focus ring disappears behind it.
 *
 * The nav labels and the CTA are English and carry `lang="en"`; the close
 * button is Turkish, like the rest of the site's interface copy.
 *
 * The active section arrives as a prop rather than from `useActiveSection`
 * here: the menu unmounts when closed, and a spy inside it would tear its
 * observer down and rebuild it on every open. Nav owns the one observer.
 */

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import { DURATION, NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/cn';
import { MonoLabel, SocialLinks } from '@/components/ui';

import type { SectionId } from '@/types';

import { EnquiriesLink } from './EnquiriesLink';

/** Everything in here is a link or a button; no inputs to worry about. */
const FOCUSABLE = 'a[href], button:not([disabled])';

export const MOBILE_MENU_ID = 'mobile-menu';

export interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  /** The section the reader is in, or null when it is not one the nav lists. */
  activeId: SectionId | null;
}

export function MobileMenu({ open, onClose, activeId }: MobileMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    // Remember what opened the menu so focus can go back there on close.
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const focusables = () => {
      const root = containerRef.current;
      if (!root) return [];
      // offsetParent filters out anything display:none at this breakpoint.
      return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null,
      );
    };

    // Move focus inside, otherwise the first Tab lands back on the page behind.
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      // Wrap at both ends, and pull focus back in if it has drifted out.
      if (!containerRef.current?.contains(document.activeElement)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKey);

    // Lock the page behind, compensating for the scrollbar's width so the
    // content underneath does not jump sideways as it disappears.
    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      window.removeEventListener('keydown', onKey);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={containerRef}
          id={MOBILE_MENU_ID}
          role="dialog"
          aria-modal="true"
          aria-label="Menü"
          className="bg-bg/[0.97] fixed inset-0 z-50 flex flex-col overflow-y-auto overscroll-contain px-8 py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DURATION.base }}
        >
          <button
            type="button"
            onClick={onClose}
            className="tracking-mono-lg text-text absolute top-3.5 right-3.5 cursor-pointer p-3.5 font-mono text-[13px] uppercase"
          >
            Kapat ✕
          </button>
          {/* `my-auto` rather than `justify-center` on the dialog: centred
              while it fits, and scrollable from its first line when it does
              not. A phone on its side is 390px tall and this list is ~490px;
              `justify-center` clipped both ends out of reach. The dialog's
              64px of vertical padding keeps the list clear of Kapat. */}
          <div className="my-auto flex flex-col gap-3.5">
            <MonoLabel size="sm" tracking="2xl" lang="en">
              Pages
            </MonoLabel>
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                lang="en"
                onClick={onClose}
                // `location`, not `page`: these are anchors within one document.
                aria-current={item.id === activeId ? 'location' : undefined}
                className={cn(
                  'tracking-caps stretch-display hover:text-accent-primary py-1.5 text-[30px] font-black uppercase transition-colors',
                  item.id === activeId && 'text-accent-primary',
                )}
              >
                {item.label}
              </a>
            ))}
            <EnquiriesLink onClick={onClose} className="mt-5 self-start px-[26px] py-[15px]" />
            <MonoLabel size="sm" tracking="2xl" lang="en" className="mt-7">
              Follow on
            </MonoLabel>
            <div className="flex gap-6">
              <SocialLinks linkClassName="py-2.5 font-mono text-[12px] tracking-chip uppercase transition-colors hover:text-accent-primary" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
