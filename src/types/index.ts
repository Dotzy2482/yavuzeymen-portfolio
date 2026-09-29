/**
 * Types shared across the whole app.
 *
 * Feature-local types stay inside their feature (see
 * `features/track-records/data/types.ts`). Only put something here when more
 * than one area of the app genuinely needs it.
 */

/** Every scroll target on the single page, in document order. */
export type SectionId =
  | 'hero'
  | 'about'
  | 'career'
  | 'achievements'
  | 'track-records'
  | 'sim-to-real'
  | 'content'
  | 'setup'
  | 'partners'
  | 'contact';

/** An entry in the sticky navigation. */
export interface NavItem {
  id: SectionId;
  label: string;
}

/** Props every page section accepts. */
export interface SectionProps {
  /** Anchor id used by the nav and by scroll progress tracking. */
  id?: SectionId;
  className?: string;
}

/** A link to an external profile or piece of content. */
export interface ExternalLink {
  label: string;
  href: string;
}

/**
 * A stretch of copy in a language other than the page's, such as an English
 * brand name inside a Turkish title.
 */
export interface ForeignRun {
  text: string;
  /** BCP-47 tag, e.g. `'en'`. */
  lang: string;
}

/**
 * Copy that mixes languages: plain strings are in the document's language,
 * `ForeignRun`s carry their own.
 *
 * This matters wherever the copy is uppercased in CSS. The document is
 * `lang="tr"`, and Turkish casing maps `i` to `İ`, so "NoGripSimRacing'in"
 * renders "NOGRİPSİMRACİNG'İN" unless the brand is tagged English — and the
 * Turkish suffix after it must stay Turkish, or "'in" would lose its dot.
 */
export type MixedText = readonly (string | ForeignRun)[];

/** A year range; `end` is null while ongoing. */
export interface DateRange {
  start: number;
  end: number | null;
}
