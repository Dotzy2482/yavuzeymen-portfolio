/**
 * The INSTAGRAM / YOUTUBE / TIKTOK / KICK link row, shared by the hero side column,
 * the mobile menu and the contact section.
 *
 * URLs come from the environment and fall back to `#` when unset, so the row
 * always renders — an unset link simply does not open a new tab.
 *
 * While Yavuz is live on Kick (useKickLive), the KICK link carries a red dot
 * and, for screen readers, "(live)".
 *
 * `noopener` alongside `noreferrer`: modern browsers imply it for
 * `target="_blank"`, but stating it is what makes the guarantee independent of
 * the browser, and it costs nothing.
 */

import { cn } from '@/lib/cn';
import { socialLinks } from '@/data';
import { useKickLive } from '@/hooks';

export interface SocialLinksProps {
  /** Classes applied to every link. */
  linkClassName?: string;
  /** Classes applied to the wrapper. */
  className?: string;
}

export function SocialLinks({ linkClassName, className }: SocialLinksProps) {
  const { live } = useKickLive();
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
            rel={isPlaceholder ? undefined : 'noopener noreferrer'}
            className={cn(linkClassName, className)}
          >
            {link.label}
            {live && link.label === 'KICK' && (
              <>
                <span
                  aria-hidden="true"
                  className="bg-accent-secondary ml-1.5 inline-block size-1.5 rounded-full align-middle"
                />
                <span className="sr-only"> (live)</span>
              </>
            )}
          </a>
        );
      })}
    </>
  );
}
