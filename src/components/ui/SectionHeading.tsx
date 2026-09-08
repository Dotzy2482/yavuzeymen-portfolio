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
      <header className="@container flex items-baseline gap-4 md:gap-7">
        {index && (
          <span className="text-accent-primary font-mono text-[13px] md:text-[16px]">{index}</span>
        )}
        {/* Section titles are English; the document is lang="tr", where
            uppercasing would turn "Achievements" into "ACHİEVEMENTS". */}
        {/* The mobile size is fluid rather than a flat 32px. Archivo at wdth
            125 sets "ACHIEVEMENTS" 10.64em wide — 339px at 32px, wider than
            the whole 335px content box of a 375px viewport — and a title that
            cannot break puts the page into horizontal scroll. 58px is what the
            rest of the row costs: the index, the two gaps, and 8px so the
            hairline stays visible. The measure is `cqi` and not `vw` because
            a classic desktop scrollbar makes those differ by 15px, which is
            exactly the margin this used to overflow by. The 32px cap comes
            back at ~438px. */}
        <Tag
          lang="en"
          className="font-display tracking-title stretch-display m-0 text-[length:min(32px,calc((100cqi-58px)/10.64))] leading-none font-black uppercase md:text-[clamp(44px,4.6vw,72px)]"
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
