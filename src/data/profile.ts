/**
 * The driver's core identity and contact details.
 *
 * SECURITY: e-mail, phone and any address MUST NOT appear as literals in this
 * file. This repository will be made public and its history is not going to be
 * rewritten, so anything committed here is committed forever. Contact details
 * are read from the environment at build time instead — this matches the
 * design handoff, which ships a literal `{EMAIL}` placeholder.
 *
 * Caveat: `VITE_`-prefixed variables are inlined into the bundle and are
 * readable in the browser. This keeps them out of git; it does not make them
 * secret. Anything that must stay secret does not belong in this codebase.
 */

export interface HeroStat {
  label: string;
  value: string;
  accent: boolean;
}

export interface Profile {
  name: string;
  /** Mono two-liner in the hero's bottom-right corner; one entry per line. */
  tagline: string[];
  /** The hero headline; serif accent is the last word. */
  headline: string;
  currentTeam: {
    label: string;
    name: string;
    detail: string;
  };
  /** The 2×2 stat card overlapping the About portrait. */
  stats: HeroStat[];
  /** Empty string when the variable is not set; the UI must handle that. */
  email: string;
  /** Empty string when the variable is not set; the UI must handle that. */
  phone: string;
  socials: {
    instagram: string;
    youtube: string;
    tiktok: string;
  };
}

export const profile: Profile = {
  name: 'Yavuz Eymen',
  tagline: ['PROFESSIONAL SIM RACING DRIVER', '& CONTENT CREATOR'],
  headline: 'ALWAYS ON THE LIMIT.',
  currentTeam: {
    label: 'CURRENT TEAM',
    name: 'TEAM CURVE HUNTERS',
    detail: 'MAIN DRIVER SINCE 2024',
  },
  stats: [
    { label: 'IRATING', value: '4.020', accent: true },
    { label: 'LICENSE', value: 'A 1.39', accent: false },
    { label: 'TÜRKİYE', value: 'TOP 50', accent: false },
    { label: 'EXPERIENCE', value: '7 YRS', accent: false },
  ],
  email: import.meta.env.VITE_CONTACT_EMAIL ?? '',
  phone: import.meta.env.VITE_CONTACT_PHONE ?? '',
  socials: {
    instagram: import.meta.env.VITE_INSTAGRAM_URL ?? '',
    youtube: import.meta.env.VITE_YOUTUBE_URL ?? '',
    tiktok: import.meta.env.VITE_TIKTOK_URL ?? '',
  },
};

/** Hero/menu/contact social link rows, in display order. */
export const socialLinks = [
  { label: 'INSTAGRAM', href: profile.socials.instagram || '#' },
  { label: 'YOUTUBE', href: profile.socials.youtube || '#' },
  { label: 'TIKTOK', href: profile.socials.tiktok || '#' },
] as const;
