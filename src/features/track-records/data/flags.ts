/**
 * Country flags as CSS `background` values.
 *
 * Flags are drawn with gradients rather than served as images: at the 20×13
 * chip size the design uses, twelve PNGs would be twelve requests for a few
 * hundred pixels each, and gradients stay sharp at any density.
 *
 * Keyed by country so circuits reference a country rather than repeating the
 * gradient — the four US circuits previously carried four byte-identical
 * copies of the same 120-character string.
 *
 * A flag is decorative on its own; every consumer must also expose the
 * country name as text or as an accessible label.
 */

export type CountryCode = 'DE' | 'NL' | 'IT' | 'GB' | 'AT' | 'US' | 'BR' | 'AU' | 'JP';

export interface Country {
  /** Display name, used for accessible labels. */
  name: string;
  /** CSS `background` shorthand value. */
  flag: string;
}

export const COUNTRIES: Record<CountryCode, Country> = {
  DE: {
    name: 'Almanya',
    flag: 'linear-gradient(180deg,#000 0 33%,#DD0000 33% 66%,#FFCE00 66%)',
  },
  NL: {
    name: 'Hollanda',
    flag: 'linear-gradient(180deg,#AE1C28 0 33%,#FFFFFF 33% 66%,#21468B 66%)',
  },
  IT: {
    name: 'İtalya',
    flag: 'linear-gradient(90deg,#009246 0 33%,#FFFFFF 33% 66%,#CE2B37 66%)',
  },
  GB: {
    name: 'Birleşik Krallık',
    flag: 'linear-gradient(90deg,transparent 44%,#C8102E 44% 56%,transparent 56%),linear-gradient(180deg,transparent 40%,#C8102E 40% 60%,transparent 60%),linear-gradient(90deg,transparent 36%,#FFFFFF 36% 64%,transparent 64%),linear-gradient(180deg,transparent 32%,#FFFFFF 32% 68%,transparent 68%),#012169',
  },
  AT: {
    name: 'Avusturya',
    flag: 'linear-gradient(180deg,#ED2939 0 33%,#FFFFFF 33% 66%,#ED2939 66%)',
  },
  US: {
    name: 'Amerika Birleşik Devletleri',
    flag: 'linear-gradient(#3C3B6E,#3C3B6E) top left/45% 50% no-repeat,repeating-linear-gradient(180deg,#B22234 0 2px,#FFFFFF 2px 4px)',
  },
  BR: {
    name: 'Brezilya',
    flag: 'radial-gradient(circle at 50% 50%,#002776 16%,#FFDF00 17% 40%,#009C3B 41%)',
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
