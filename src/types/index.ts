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
  | 'track-records'
  | 'career'
  | 'achievements'
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

/** A year range; `end` is null while ongoing. */
export interface DateRange {
  start: number;
  end: number | null;
}
