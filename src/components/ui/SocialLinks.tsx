/**
 * The INSTAGRAM / YOUTUBE / TIKTOK link row, shared by the hero side column,
 * the mobile menu and the contact section.
 *
 * URLs come from the environment and fall back to `#` when unset, so the row
 * always renders — an unset link simply does not open a new tab.
 */

import { cn } from '@/lib/cn';
import { socialLinks } from '@/data';

export interface SocialLinksProps {
  /** Classes applied to every link. */
  linkClassName?: string;
  /** Classes applied to the wrapper. */
  className?: string;
}

export function SocialLinks({ linkClassName, className }: SocialLinksProps) {
  return (
    <>
      {socialLinks.map((link) => {
        const isPlaceholder = link.href === '#';
        return (
          <a
            key={link.label}
            href={link.href}
            lang="en"
            target={isPlaceholder ? undefined : '_blank'}
            rel={isPlaceholder ? undefined : 'noreferrer'}
            className={cn(linkClassName, className)}
          >
            {link.label}
          </a>
        );
      })}
    </>
  );
}
