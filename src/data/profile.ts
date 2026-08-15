/**
 * The driver's core identity and contact details.
 *
 * SECURITY: e-mail, phone and any address MUST NOT appear as literals in this
 * file. This repository will be made public and its history is not going to be
 * rewritten, so anything committed here is committed forever. Contact details
 * are read from the environment at build time instead.
 *
 * Caveat: `VITE_`-prefixed variables are inlined into the bundle and are
 * readable in the browser. This keeps them out of git; it does not make them
 * secret. Anything that must stay secret does not belong in this codebase.
 *
 * Public profile URLs (Instagram, YouTube) are fine as literals — they are
 * public by definition — but are read from the environment too so that all
 * external references sit in one place.
 *
 * TODO: fill in the real copy once it is written.
 */

export interface Profile {
  name: string;
  /** Short line under the name in the hero. */
  tagline: string;
  /** One or two paragraphs for the About section. */
  bio: string;
  /** Home base, city-level only — never a street address. */
  location: string;
  /** Empty string when the variable is not set; the UI must handle that. */
  email: string;
  /** Empty string when the variable is not set; the UI must handle that. */
  phone: string;
  socials: {
    instagram: string;
    youtube: string;
  };
}

export const profile: Profile = {
  name: 'Yavuz Eymen',
  tagline: '',
  bio: '',
  location: '',
  email: import.meta.env.VITE_CONTACT_EMAIL ?? '',
  phone: import.meta.env.VITE_CONTACT_PHONE ?? '',
  socials: {
    instagram: import.meta.env.VITE_INSTAGRAM_URL ?? '',
    youtube: import.meta.env.VITE_YOUTUBE_URL ?? '',
  },
};
