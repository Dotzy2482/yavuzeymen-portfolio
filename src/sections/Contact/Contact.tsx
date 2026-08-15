/**
 * Closing section: how to get in touch, plus the social links.
 *
 * `profile.email` and `profile.phone` come from the environment and are empty
 * strings when unset — every consumer here must handle that, since the repo
 * will be public and those values are deliberately absent from it.
 *
 * TODO: render a mailto/tel link only when the value is non-empty.
 * TODO: decide whether a contact form is wanted. It would need a backend or a
 *       third-party endpoint, which this static site currently has neither of.
 * TODO: consider obfuscating the address against scrapers — it ships in the
 *       bundle either way.
 */

import { cn } from '@/lib/cn';
import { SectionHeading } from '@/components/ui';
import type { SectionProps } from '@/types';

export function Contact({ id = 'contact', className }: SectionProps) {
  return (
    <section id={id} className={cn('section', className)}>
      <SectionHeading index="09" title="Contact" />
      {/* TODO: conditional mailto / tel / social links */}
    </section>
  );
}
