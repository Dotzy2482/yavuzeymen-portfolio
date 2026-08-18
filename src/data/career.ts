/**
 * Career timeline entries, oldest first — the design's scroll-filled timeline
 * reads top-down from 2019 to the present.
 *
 * The shape mirrors what the design actually renders per node: a year, an
 * uppercase title and one line of Turkish description. Copy is design-final.
 */

export interface CareerEntry {
  id: string;
  year: number;
  title: string;
  description: string;
  /** BCP-47 tag when the title is not Turkish (see Achievement.lang). */
  lang?: string;
}

export const career: CareerEntry[] = [
  {
    id: 'start',
    year: 2019,
    title: "Sim Racing'e Başlangıç",
    description: 'İlk direksiyon setiyle rekabetçi liglerde yarışmaya başladım.',
  },
  {
    id: 'sensible',
    year: 2020,
    title: 'Sensible Racing',
    lang: 'en',
    description: 'İlk takım deneyimi; ulusal liglerde düzenli podyumlar.',
  },
  {
    id: 'nogrip',
    year: 2022,
    title: "NoGripSimRacing'in Kuruluşu",
    description: 'Kendi içerik markamı kurdum; topluluk hızla büyüdü.',
  },
  {
    id: 'tch',
    year: 2023,
    title: 'Team Curve Hunters',
    lang: 'en',
    description: 'Takıma katıldım; uluslararası GT3 organizasyonlarında yarıştım.',
  },
  {
    id: 'main-driver',
    year: 2024,
    title: 'Ana Takım Pilotluğu',
    description: 'Team Curve Hunters ana kadrosuna yükseldim.',
  },
  {
    id: 'real-track',
    year: 2025,
    title: 'Gerçek Pist — TOSFED & FIAT',
    description: 'Simülatörden gerçek piste geçtim; TOSFED ve FIAT programlarında yarıştım.',
  },
];

/** Right-aligned meta label in the section header. */
export const careerRange = '2019 — 2026';
