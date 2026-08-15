/**
 * The heading block that opens every section: an index number, a title and an
 * optional lead paragraph.
 *
 * TODO: implement the visual treatment (display face, oversized index,
 *       accent rule) once the design lands.
 * TODO: wire up the per-character reveal animation.
 */

import { cn } from '@/lib/cn';

export interface SectionHeadingProps {
  /** Two-digit section index, e.g. `'03'`. */
  index?: string;
  title: string;
  /** Optional short lead paragraph under the title. */
  lead?: string;
  /** Heading level — the page has exactly one h1 (the hero). */
  as?: 'h1' | 'h2' | 'h3';
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeading({
  index,
  title,
  lead,
  as: Tag = 'h2',
  align = 'left',
  className,
}: SectionHeadingProps) {
  return (
    <header className={cn('section-heading', align === 'center' && 'text-center', className)}>
      {index && <span className="num text-text-muted">{index}</span>}
      <Tag className="font-display">{title}</Tag>
      {lead && <p className="text-text-muted">{lead}</p>}
    </header>
  );
}
