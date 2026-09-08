/**
 * The heading block that opens every section — the design's "section header
 * pattern": cyan mono index + huge Archivo title + 1px hairline flex-filler +
 * optional right-aligned mono meta label.
 *
 * `accent` renders one word of the title in Instrument Serif italic
 * ("Who is *Yavuz Eymen?*", "Sim to *Real*") — never more than one word,
 * per the style guide.
 *
 * `stretch` picks which of the two width mechanisms the title uses. The
 * component stays presentational either way: it knows nothing about scroll,
 * and swaps one class. The scroll-linked value arrives from a `StretchScrub`
 * ancestor as a custom property this heading's title happens to read.
 */

import { cn } from '@/lib/cn';

import { MonoLabel } from './MonoLabel';

/**
 * `display` is the fixed 125% width. `scrub` reads the live `--axis-wdth`
 * channel instead, which falls back to the same 125 when no `StretchScrub`
 * is publishing one. The two spell the same axis in incompatible syntaxes and
 * `font-variation-settings` wins over `font-stretch`, so they are alternatives
 * rather than layers — exactly one of them lands on the title.
 */
export type SectionHeadingStretch = 'display' | 'scrub';

const STRETCH_CLASSES: Record<SectionHeadingStretch, string> = {
  display: 'stretch-display',
  scrub: 'stretch-scrub',
};

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
  /** Width mechanism for the title. Default `'display'` — the fixed 125%. */
  stretch?: SectionHeadingStretch;
  className?: string;
}

export function SectionHeading({
  index,
  title,
  accent,
  meta,
  lead,
  as: Tag = 'h2',
  stretch = 'display',
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
          className={cn(
            'font-display tracking-title m-0 text-[length:min(32px,calc((100cqi-58px)/10.64))] leading-none font-black uppercase md:text-[clamp(44px,4.6vw,72px)]',
            STRETCH_CLASSES[stretch],
          )}
        >
          {title}
          {accent && (
            <>
              {' '}
              {/* Instrument Serif is a static font and ignores the axes today.
                  Pinning the accent to `normal` is belt and braces against a
                  future variable serif inheriting a `wdth` meant for Archivo. */}
              <em className="font-serif font-normal tracking-normal normal-case italic [font-variation-settings:normal]">
                {accent}
              </em>
            </>
          )}
        </Tag>
        {/* The filler shortens as a scrubbed title widens — that is the effect.
            The floor stops a short heading crushing it to zero and snapping,
            and is scoped to `scrub` so the six static headings keep today's
            measurements exactly.

            24px is more than the 8px of hairline the size formula above budgets
            for, and that is safe rather than lucky: the 10.64em divisor is sized
            for "ACHIEVEMENTS", so the two scrubbed titles — "SETUP" and
            "PARTNERS" — leave the row hundreds of pixels of slack at every
            width. A long title would have to opt into `scrub` before the two
            numbers could argue. */}
        <span
          aria-hidden="true"
          className={cn(
            'bg-hairline-strong h-px flex-1 self-center',
            stretch === 'scrub' && 'min-w-6',
          )}
        />
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
