/**
 * The red "Business Enquiries →" call to action, as the nav chrome carries it:
 * in the desktop bar once the hero — and the hero's own copy of this button —
 * has scrolled away, and in the overlay menu, which is the only place a phone
 * offers it before the Contact section.
 *
 * Race Red is the site's colour for earned moments and the main CTA only (see
 * tokens.css), so it stays on this one link. The styling follows the hero's
 * button in `sections/Hero/Hero.tsx`; only the padding is left to the caller,
 * because a 64px bar and a full-screen menu want different sizes of it.
 */

import { cn } from '@/lib/cn';

const CTA_CLASSES =
  'bg-accent-secondary tracking-btn text-text stretch-ui hover:bg-accent-secondary-hover duration-base text-[13px] font-extrabold whitespace-nowrap uppercase transition-colors';

export interface EnquiriesLinkProps {
  /** Padding and placement; the look is fixed. */
  className?: string;
  onClick?: () => void;
}

export function EnquiriesLink({ className, onClick }: EnquiriesLinkProps) {
  return (
    <a href="#contact" lang="en" onClick={onClick} className={cn(CTA_CLASSES, className)}>
      Business Enquiries →
    </a>
  );
}
