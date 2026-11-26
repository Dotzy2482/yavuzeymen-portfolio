/**
 * Country flags as CSS `background` values.
 *
 * Flags are drawn with gradients rather than served as images: at the 20×13
 * chip size the design uses, a PNG per circuit would be fourteen requests for a few
 * hundred pixels each, and gradients stay sharp at any density.
 *
 * Keyed by country so circuits reference a country rather than repeating the
 * gradient — the six US circuits would otherwise carry six byte-identical
 * copies of the same 120-character string.
 *
 * A flag is decorative on its own; every consumer must also expose the
 * country name as text or as an accessible label.
 */

export type CountryCode = 'BE' | 'DE' | 'IT' | 'ES' | 'FR' | 'US' | 'AU' | 'JP';

export interface Country {
  /** Display name, used for accessible labels. */
  name: string;
  /** CSS `background` shorthand value. */
  flag: string;
}

export const COUNTRIES: Record<CountryCode, Country> = {
  BE: {
    name: 'Belçika',
    flag: 'linear-gradient(90deg,#000 0 33%,#FDDA24 33% 66%,#EF3340 66%)',
  },
  DE: {
    name: 'Almanya',
    flag: 'linear-gradient(180deg,#000 0 33%,#DD0000 33% 66%,#FFCE00 66%)',
  },
  IT: {
    name: 'İtalya',
    flag: 'linear-gradient(90deg,#009246 0 33%,#FFFFFF 33% 66%,#CE2B37 66%)',
  },
  ES: {
    name: 'İspanya',
    flag: 'linear-gradient(180deg,#AA151B 0 25%,#F1BF00 25% 75%,#AA151B 75%)',
  },
  FR: {
    name: 'Fransa',
    flag: 'linear-gradient(90deg,#002654 0 33%,#FFFFFF 33% 66%,#CE1126 66%)',
  },
  US: {
    name: 'Amerika Birleşik Devletleri',
    flag: 'linear-gradient(#3C3B6E,#3C3B6E) top left/45% 50% no-repeat,repeating-linear-gradient(180deg,#B22234 0 2px,#FFFFFF 2px 4px)',
  },
  AU: {
    name: 'Avustralya',
    flag: 'radial-gradient(circle at 72% 32%,#FFFFFF 7%,transparent 8%),radial-gradient(circle at 82% 62%,#FFFFFF 6%,transparent 7%),radial-gradient(circle at 62% 72%,#FFFFFF 6%,transparent 7%),radial-gradient(circle at 25% 30%,#FFFFFF 10%,transparent 11%),#012169',
  },
  JP: {
    name: 'Japonya',
    flag: 'radial-gradient(circle at 50% 50%,#BC002D 32%,#FFFFFF 33%)',
  },
};
