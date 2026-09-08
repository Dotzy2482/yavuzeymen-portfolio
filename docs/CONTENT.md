# Content status

What on this site is real, what is a placeholder, and where the real version is
coming from.

The site is built to render correctly in either state — a placeholder is always
a visible, deliberate one (a dimmed value, a dashed slot), never a broken
layout or a crash.

## Copy and data

| Where                       | Field                                                | Status              | Source of truth                                        |
| --------------------------- | ---------------------------------------------------- | ------------------- | ------------------------------------------------------ |
| `data/profile.ts`           | Name, tagline, headline                              | **Real**            | Design handoff, signed off                             |
| `data/profile.ts`           | Current team + "main driver since"                   | **Real**            | Team Curve Hunters                                     |
| `data/profile.ts`           | iRating 4.020, License A 1.39, Türkiye Top 50, 7 yrs | **Real** (snapshot) | iRacing profile — re-check before launch               |
| `data/profile.ts`           | E-mail, phone                                        | **Env-driven**      | `.env.local`; empty string when unset                  |
| `data/profile.ts`           | Instagram / YouTube / TikTok URLs                    | **Env-driven**      | `.env.local`; fall back to `#`                         |
| `sections/About/About.tsx`  | Four Turkish bio paragraphs                          | **Real**            | Design handoff, final copy                             |
| `data/career.ts`            | Six timeline entries, 2019–2025                      | **Real**            | Design handoff, final copy                             |
| `data/achievements.ts`      | Six result cards                                     | **Real**            | Design handoff, final copy                             |
| `data/partners.ts`          | Four sponsors                                        | **Real**            | Logos supplied; see assets below                       |
| `data/partners.ts`          | Two "YOUR BRAND HERE" slots                          | **Intentional**     | Not a placeholder — the section doubles as a pitch     |
| `data/contentStats.ts`      | 146.848 views / 797.000 top reel / %82,3 reels       | **Placeholder**     | Instagram insights export                              |
| `data/contentStats.ts`      | Five reel cards (captions + covers)                  | **Placeholder**     | Real reel thumbnails + real captions                   |
| `data/setup.ts`             | All five rows: `MODEL — YER TUTUCU`                  | **Placeholder**     | Yavuz's actual hardware list; renders as a dashed slot |
| `data/simToReal.ts`         | Five photos + labels                                 | **Real** (low-res)  | Photos supplied; see assets below                      |
| `data/simToReal.ts`         | `karting` — `src: null`                              | **Placeholder**     | Karting photo, renders as a dashed empty slot          |
| `features/…/data/tracks.ts` | 12 circuit names + regions                           | **Real**            | Yavuz's circuit list                                   |
| `features/…/data/tracks.ts` | Lap times, lengths, corner counts                    | **Placeholder**     | iRacing personal-best export                           |
| `features/…/data/tracks.ts` | Circuit `path` geometry                              | **Placeholder**     | OpenStreetMap / Overpass — see below                   |
| `sections/Contact`          | Invitation paragraph                                 | **Real**            | Design handoff, final copy                             |
| `sections/Contact`          | `Gizlilik` / `Şartlar` footer links                  | **Placeholder**     | Legal pages not written                                |
| `index.html`                | `description`, `og:*`, `twitter:*`                   | **Real, English**   | Design handoff — see the note below                    |

### The document head is English, in a `lang="tr"` document

`index.html` carries `lang="tr"` and `og:locale` `tr_TR`, and every string in
its head — `description`, `og:title`, `og:description`, `og:image:alt` — is
English.

That is not the site's usual split. On the page, English is for headings and UI
labels while body copy is Turkish; a meta description is body copy by any
reading, so by that rule it would be Turkish.

It is left alone deliberately. Which language a shared link speaks is a
positioning decision about who the site is being shared _with_ — a Turkish
audience, or the international sim racing scene the driver competes in — and
that belongs to Yavuz, not to whoever is next in this file. Flagged here so the
decision gets made rather than inherited.

## Where the real data comes from

**iRacing profile** — the driver stats (iRating, licence class, national
ranking) and every circuit's personal best. These are snapshot values entered by
hand; there is no API integration and none is planned, because a live fetch
would need a server-side token and this is a static site. They need a documented
refresh cadence — realistically, before any campaign that points at the site.

**Instagram insights** — the three counters in the Content section and the reel
covers. Same reasoning: exported by hand, entered as constants, dated. The
current numbers came from the design handoff and should be treated as
illustrative until refreshed from the account.

**Photographer** — the Sim to Real gallery and the studio portraits. The
supplied files are low-resolution working copies (see below); the brief is that
hi-res versions replace them **at identical crops**, so no layout changes are
needed. The karting slot is waiting on a shoot that has not happened.

**Yavuz directly** — the Setup list (wheel, pedals, rig, display, PC). Five
strings, currently all reading `MODEL — YER TUTUCU`. Each row renders as a
dashed reserved slot — the same empty-slot language as the Partners cells and
the karting photo — sized to roughly the width a model name occupies. Setting
`placeholder: false` on a row swaps the slot for the real value with no layout
shift, so the section can be filled in one row at a time.

**OpenStreetMap via Overpass** — real circuit geometry to replace the
approximate shapes currently in `tracks.ts`. This is the largest outstanding
data task; see [TRACK_RECORDS.md](TRACK_RECORDS.md) and
[ROADMAP.md](ROADMAP.md).

## Image assets

All under `public/images/`. Everything referenced by the design is present and
loading.

| File                            | Dimensions    | Size    | Used by                       | Note                                                                   |
| ------------------------------- | ------------- | ------- | ----------------------------- | ---------------------------------------------------------------------- |
| `hero/portrait-cutout.png`      | 1323 × 1189   | 1.16 MB | Hero                          | Background removed; helmet fit maths depends on these exact dimensions |
| `hero/helmet.png`               | 492 × 508     | 306 KB  | Hero                          | Transparent, sponsor livery baked in                                   |
| `portraits/studio-seated.jpg`   | 1023 × 1537   | 97 KB   | About, reel card              | Adequate                                                               |
| `portraits/studio-standing.jpg` | 941 × 1672    | 74 KB   | —                             | Copied but currently unused                                            |
| `simtoreal/paddock.jpg`         | **348 × 407** | 80 KB   | Sim to Real, reel card        | **Too low-res** — visibly soft at display size                         |
| `simtoreal/pit-pass.jpg`        | 1200 × 1600   | 161 KB  | Sim to Real, reel card        | Adequate                                                               |
| `simtoreal/fiat-egea.jpg`       | 1600 × 1066   | 219 KB  | Sim to Real                   | Adequate                                                               |
| `simtoreal/fiat-front.png`      | **828 × 788** | 1.16 MB | Sim to Real, centre reel card | Low-res **and** oversized — PNG of a photo                             |
| `simtoreal/rig.png`             | **433 × 545** | 415 KB  | Sim to Real, Setup, reel card | **Too low-res** — shown large in Setup                                 |
| `partners/gelbura.png`          | 178 × 63      | 8 KB    | Marquee, Partners             | Derived white-on-transparent crop                                      |
| `partners/spardox.png`          | 500 × 167     | 4 KB    | Marquee, Partners             | Black on transparent, inverted in CSS                                  |
| `partners/drivehunter.svg`      | 360 × 80      | 9 KB    | Marquee, Partners             | Vector — ideal                                                         |
| `partners/tch.avif` + `.png`    | 256 × 75      | 5/20 KB | Marquee, Partners             | AVIF with PNG fallback via `<picture>`                                 |

### Generated assets

Neither of these is photography, and neither is copied from anywhere. Both are
rasterised from sources inside this repo, and both must be regenerated rather
than edited:

| File                          | Dimensions | Size   | Source                     |
| ----------------------------- | ---------- | ------ | -------------------------- |
| `public/og-image.png`         | 1200 × 630 | 280 KB | `docs/assets/og-card.html` |
| `public/apple-touch-icon.png` | 180 × 180  | 3 KB   | `public/favicon.svg`       |

```bash
node docs/assets/generate-og-images.mjs
```

The card is composed from the site's own vocabulary — the hero's ambient wash
and racing lines, the helmet wireframe, Signal Cyan, and copy quoted from
`data/profile.ts` and the section headings. Nothing on it is written for the
card, so nothing on it can drift away from the page.

`og-image.png` is 280 KB, which is large for something that is 90% flat Track
Black, and it is a PNG because headless Chrome only writes PNGs. Neither costs
a visitor anything: the file is fetched by crawlers and never by the page. Once
[03](plans/03-weight-and-wiring.md) adds `sharp`, re-encoding it is a one-liner
worth taking.

The touch icon inherits `favicon.svg`'s **placeholder** status — when the real
visual identity lands, both change together.

### Resolution notes

Three files are below the resolution their display size needs — `rig.png`
(433 × 545, shown up to 440px tall in the gallery and full column width in
Setup), `paddock.jpg` (348 × 407), and `fiat-front.png` (828 × 788, and the
centre card of the Content fan). They look soft on any reasonably dense display.
The handoff flagged these as low-res placeholders with hi-res versions to
follow.

`fiat-front.png` and `portrait-cutout.png` are also the two largest files on
the site at ~1.2 MB each. The portrait needs PNG for its alpha channel; the
FIAT shot is a photograph stored as PNG for no reason and should become a JPEG
or WebP when it is replaced.

**When hi-res versions arrive:** keep the same filenames and the same crops.
Nothing in the code needs to change. A general pass to WebP/AVIF with
`<picture>` fallbacks is worth doing at the same time — the pattern is already
established by the TCH logo.

### Logo provenance

The gelbura source file supplied in the handoff
(`316821634_…_n.jpg`) is a 200 × 200 JPEG on a **white background** and is
unusable on a dark page. What ships is `gelbura_white.png`, a derived
transparent crop. In the Partners grid every logo is forced to pure white with
`brightness-0 invert`, so colour is discarded there anyway; the marquee is where
a proper vector would show. A real SVG would be an improvement if the sponsor
can supply one.

### Not copied from the handoff

Deliberately excluded: `uploads/Ekran görüntüsü *.png` (a screenshot of a
different website, used as reference only) and `uploads/pasted-*.png`
(intermediate working files). Also excluded are three superseded assets the
README mentioned but neither prototype actually references —
`ChatGPT … 19_02_02.png`, `… 19_06_04.png` and `… 20_24_15.png`.

## Privacy constraints on content

This repository will be made public and its history will not be rewritten.

- Contact details never appear as literals. `data/profile.ts` reads them from
  `import.meta.env`. `VITE_`-prefixed variables are inlined into the bundle and
  are publicly readable — keeping them out of git is not the same as keeping
  them secret.
- `public/images/private/` is git-ignored and is the holding area for media
  whose usage rights are not confirmed. Move a file out of it only once they
  are.
- The site must render with an empty `.env` — every variable is optional and
  resolves to an empty string. The Contact CTA falls back to a generic label
  rather than an empty `mailto:`.
