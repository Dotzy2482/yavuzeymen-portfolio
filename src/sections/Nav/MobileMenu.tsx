/**
 * Full-screen overlay menu (PAGES + FOLLOW ON), from the mobile design.
 * Available on every viewport — on desktop the hamburger is the only way in,
 * matching the prototype's chrome.
 *
 * The nav labels are English and carry `lang="en"`; the close button is
 * Turkish, like the rest of the site's interface copy.
 */

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import { DURATION, NAV_ITEMS } from '@/lib/constants';
import { MonoLabel, SocialLinks } from '@/components/ui';

export interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  // Close on Escape; lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="bg-bg/[0.97] fixed inset-0 z-50 flex flex-col justify-center gap-3.5 px-8"
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
          <MonoLabel size="sm" tracking="2xl" lang="en">
            Pages
          </MonoLabel>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              lang="en"
              onClick={onClose}
              className="tracking-caps stretch-display hover:text-accent-primary py-1.5 text-[30px] font-black uppercase transition-colors"
            >
              {item.label}
            </a>
          ))}
          <MonoLabel size="sm" tracking="2xl" lang="en" className="mt-7">
            Follow on
          </MonoLabel>
          <div className="flex gap-6">
            <SocialLinks linkClassName="py-2.5 font-mono text-[12px] tracking-chip uppercase transition-colors hover:text-accent-primary" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
