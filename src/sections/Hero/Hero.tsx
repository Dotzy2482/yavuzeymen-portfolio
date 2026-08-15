/**
 * Full-viewport opening section: name, tagline, and the first scroll cue.
 *
 * Carries the page's only <h1>.
 *
 * TODO: implement the entrance choreography (name mask-reveal, tagline fade,
 *       background parallax).
 * TODO: decide the background treatment — video, still, or generated.
 * TODO: add the scroll-down indicator.
 */

import { cn } from '@/lib/cn';
import { SectionHeading } from '@/components/ui';
import { profile } from '@/data';
import type { SectionProps } from '@/types';

export function Hero({ id = 'hero', className }: SectionProps) {
  return (
    <section id={id} className={cn('section section--hero', className)}>
      <SectionHeading as="h1" title={profile.name} lead={profile.tagline} />
      {/* TODO: tagline, scroll cue, background layers */}
    </section>
  );
}
