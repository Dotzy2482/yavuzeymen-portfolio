/**
 * The heading block that opens every section — the design's "section header
 * pattern": cyan mono index + huge Archivo title + 1px hairline flex-filler +
 * optional right-aligned mono meta label.
 *
 * `accent` renders one word of the title in Instrument Serif italic
 * ("Who is *Yavuz Eymen?*", "Sim to *Real*") — never more than one word,
 * per the style guide.
 */

import { MonoLabel } from './MonoLabel';

export interface SectionHeadingProps {
  /** Two-digit section index, e.g. `'03'`. */
  index?: string;
  title: string;
  /** Serif-italic accent appended to the title. One word (or name) max. */
  accent?: string;
  /** Right-aligned mono meta label, e.g. `'2019 — 2026'`. */
  meta?: string;
  /** Optional short lead paragraph under the title. */
  lead?: string;
  /** Heading level — the page has exactly one h1 (the hero). */
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
}

export function SectionHeading({
  index,
  title,
  accent,
  meta,
  lead,
  as: Tag = 'h2',
  className,
}: SectionHeadingProps) {
  return (
    <div className={className}>
      <header className="flex items-baseline gap-4 md:gap-7">
        {index && (
          <span className="text-accent-primary font-mono text-[13px] md:text-[16px]">{index}</span>
        )}
        {/* Section titles are English; the document is lang="tr", where
            uppercasing would turn "Achievements" into "ACHİEVEMENTS". */}
        <Tag
          lang="en"
          className="font-display tracking-title stretch-display m-0 text-[32px] leading-none font-black uppercase md:text-[clamp(44px,4.6vw,72px)]"
        >
          {title}
          {accent && (
            <>
              {' '}
              <em className="font-serif font-normal tracking-normal normal-case italic">
                {accent}
              </em>
            </>
          )}
        </Tag>
        <span aria-hidden="true" className="bg-hairline-strong h-px flex-1 self-center" />
        {meta && (
          <MonoLabel size="md" tracking="lg" className="hidden text-right md:inline">
            {meta}
          </MonoLabel>
        )}
      </header>
      {lead && (
        <p className="text-text-secondary mt-7 max-w-[520px] text-[14px] leading-[1.8] md:text-[16px]">
          {lead}
        </p>
      )}
    </div>
  );
}
