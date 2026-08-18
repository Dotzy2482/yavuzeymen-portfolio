/**
 * Race results and titles worth calling out — the six cards of the
 * Achievements grid.
 *
 * `champion: true` switches the card to the Race Red treatment (red border +
 * red CHAMPION chip); everything else gets a neutral chip. Copy is
 * design-final.
 */

export interface Achievement {
  id: string;
  /** Event or championship name — the card's uppercase title. */
  title: string;
  /** One-line Turkish description under the title. */
  note: string;
  /** Chip text, e.g. "CHAMPION", "FINAL — P8". */
  chip: string;
  /** Red championship treatment. */
  champion: boolean;
  /**
   * BCP-47 tag when the title is not Turkish. The document is `lang="tr"`,
   * where uppercasing turns "iRacing" into "İRACİNG".
   */
  lang?: string;
}

export const achievements: Achievement[] = [
  {
    id: 'drl-summer-cup',
    title: 'DRL Summer Cup',
    lang: 'en',
    note: 'Şampiyonluk',
    chip: 'CHAMPION',
    champion: true,
  },
  {
    id: 'iracing-24h-le-mans',
    title: 'iRacing 24h Le Mans',
    lang: 'en',
    note: 'Şampiyonluk',
    chip: 'CHAMPION',
    champion: true,
  },
  {
    id: 'fiat-dijital',
    title: 'FIAT Dijital Turnuva',
    note: 'Binlerce katılımcı arasından finalde 8.',
    chip: 'FINAL — P8',
    champion: false,
  },
  {
    id: 'acer-predator',
    title: 'Acer Predator Cup',
    lang: 'en',
    note: 'Elemeleri geçip 20 finalistten biri oldum.',
    chip: 'FINALIST',
    champion: false,
  },
  {
    id: 'borusan',
    title: 'Borusan Final Yarışları',
    note: 'Final yarışlarında mücadele ettim.',
    chip: 'FINALS',
    champion: false,
  },
  {
    id: 'tosfed-top50',
    title: 'TOSFED İlk 50',
    note: 'Türkiye sıralamasında ilk 50 pilot arasında.',
    chip: 'RANKING',
    champion: false,
  },
];
