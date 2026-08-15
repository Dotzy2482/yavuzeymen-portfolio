/**
 * Who the driver is: bio copy plus a portrait.
 *
 * TODO: lay out the two-column copy/portrait split.
 * TODO: add the portrait once its usage rights are confirmed — unresolved
 *       photos live in the git-ignored public/images/private/.
 * TODO: wrap the copy in <Reveal /> once that is implemented.
 */

import { cn } from '@/lib/cn';
import { SectionHeading } from '@/components/ui';
import { profile } from '@/data';
import type { SectionProps } from '@/types';

export function About({ id = 'about', className }: SectionProps) {
  return (
    <section id={id} className={cn('section', className)}>
      <SectionHeading index="01" title="About" />
      <p className="text-text-muted">{profile.bio}</p>
    </section>
  );
}
