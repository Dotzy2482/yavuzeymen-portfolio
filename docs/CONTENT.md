# Content status

What on this site is real, what is a placeholder, and where the real version is
coming from.

The site is built to render correctly in either state — a placeholder is always
a visible, deliberate one (a dimmed value, a dashed slot), never a broken
layout or a crash.

## Copy and data

| Where                       | Field                                                | Status              | Source of truth                                                      |
| --------------------------- | ---------------------------------------------------- | ------------------- | -------------------------------------------------------------------- |
| `data/profile.ts`           | Name, tagline, headline                              | **Real**            | Design handoff, signed off                                           |
| `data/profile.ts`           | Current team + "main driver since"                   | **Real**            | Team Curve Hunters                                                   |
| `data/profile.ts`           | iRating 4.020, License A 1.39, Türkiye Top 50, 7 yrs | **Real** (snapshot) | iRacing profile — re-check before launch                             |
| `data/profile.ts`           | E-mail, phone                                        | **Env-driven**      | `.env.local`; empty string when unset                                |
| `data/profile.ts`           | Instagram / YouTube / TikTok URLs                    | **Env-driven**      | `.env.local`; fall back to `#`                                       |
| `sections/About/About.tsx`  | Four Turkish bio paragraphs                          | **Real**            | Design handoff, final copy                                           |
| `data/career.ts`            | Six timeline entries, 2019–2025                      | **Real**            | Design handoff, final copy                                           |
| `data/achievements.ts`      | Six result cards                                     | **Real**            | Design handoff, final copy                                           |
| `data/partners.ts`          | Four sponsors                                        | **Real**            | Logos supplied; see assets below                                     |
| `data/partners.ts`          | Two "YOUR BRAND HERE" slots                          | **Intentional**     | Not a placeholder — the section doubles as a pitch                   |
| `data/contentStats.ts`      | 146.848 views / 797.000 top reel / %82,3 reels       | **Placeholder**     | Instagram insights export                                            |
| `data/contentStats.ts`      | Five reel cards (captions + covers)                  | **Placeholder**     | Real reel thumbnails + real captions                                 |
| `data/setup.ts`             | All five rows: `MODEL — YER TUTUCU`                  | **Placeholder**     | Yavuz's actual hardware list; renders as a dashed slot               |
| `data/simToReal.ts`         | Five photos + labels                                 | **Real** (low-res)  | Photos supplied; see assets below                                    |
| `data/simToReal.ts`         | `karting` — `src: null`                              | **Placeholder**     | Karting photo, renders as a dashed empty slot                        |
| `features/…/data/tracks.ts` | 12 circuit names + regions                           | **Real**            | Yavuz's circuit list                                                 |
| `features/…/data/tracks.ts` | Lengths, corner counts                               | **Real**            | Published figures; every length agrees with the OSM geometry to 1.5% |
| `features/…/data/tracks.ts` | Lap times                                            | **Placeholder**     | iRacing personal-best export                                         |
| `features/…/trackPaths.ts`  | Circuit `path` geometry                              | **Real**            | Generated from OpenStreetMap; see TRACK_RECORDS.md                   |
| `sections/Contact`          | Invitation paragraph                                 | **Real**            | Design handoff, final copy                                           |
| `sections/Contact`          | `Gizlilik` / `Şartlar` footer links                  | **Placeholder**     | Legal pages not written                                              |
| `index.html`                | `description`, `og:*`, `twitter:*`                   | **Real, English**   | Design handoff — see the note below                                  |

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

## Image assets

All under `public/images/`. Everything referenced by the design is present and
loading.

Every raster ships three ways: the original, and an AVIF and a WebP that
`pnpm images` (`docs/assets/encode-images.mjs`) writes beside it at exactly the
original's pixel size. `<Picture>` (`components/ui`) derives both encodes from
the original's path, so a browser takes the AVIF, falls back to the WebP, and
only fetches the original if it takes neither. The table lists the original
and the AVIF, which is what a current browser actually downloads.

| File                          | Dimensions    | Original | AVIF  | Used by                       | Note                                                                 |
| ----------------------------- | ------------- | -------- | ----- | ----------------------------- | -------------------------------------------------------------------- |
| `hero/portrait-cutout.png`    | 1323 × 1189   | 1.16 MB  | 75 KB | Hero                          | Background removed. Must stay the same crop as `portrait-helmet.png` |
| `hero/portrait-helmet.png`    | 1323 × 1189   | 1.13 MB  | 78 KB | Hero                          | The same frame with the helmet on — the layer the cursor reveals     |
| `portraits/studio-seated.jpg` | 1023 × 1537   | 99 KB    | 57 KB | About, reel card              | Adequate                                                             |
| `simtoreal/paddock.jpg`       | **348 × 407** | 82 KB    | 19 KB | Sim to Real, reel card        | **Too low-res** — visibly soft at display size                       |
| `simtoreal/pit-pass.jpg`      | 1200 × 1600   | 165 KB   | 67 KB | Sim to Real, reel card        | Adequate                                                             |
| `simtoreal/fiat-egea.jpg`     | 1600 × 1066   | 224 KB   | 94 KB | Sim to Real                   | Adequate                                                             |
| `simtoreal/fiat-front.png`    | **828 × 788** | 1.18 MB  | 48 KB | Sim to Real, centre reel card | Low-res, and a photograph stored as PNG                              |
| `simtoreal/rig.png`           | **433 × 545** | 425 KB   | 23 KB | Sim to Real, Setup, reel card | **Too low-res** — shown large in Setup                               |
| `partners/gelbura.png`        | 178 × 63      | 8 KB     | 2 KB  | Marquee, Partners             | Derived white-on-transparent crop                                    |
| `partners/spardox.png`        | 500 × 167     | 4 KB     | 6 KB  | Marquee, Partners             | Black on transparent, inverted in CSS. The one AVIF that is larger   |
| `partners/drivehunter.svg`    | 360 × 80      | 9 KB     | —     | Marquee, Partners             | Vector — ideal, nothing to encode                                    |
| `partners/tch.png`            | 256 × 75      | 20 KB    | 6 KB  | Marquee, Partners             |                                                                      |

What a browser that takes AVIF downloads for the whole page went from 4.50 MB
to 484 KB when the encodes landed in [03](plans/03-weight-and-wiring.md); the
two hero portraits alone from 2.29 MB to 153 KB. A WebP-only browser gets
631 KB. The originals stay in the repository as the `<picture>` fallback, so
the repository itself grew by the encodes, about 1.1 MB.

Each encode profile is chosen by eye in `encode-images.mjs`: photography with a
lossless original (the hero cut-outs keep their alpha) at AVIF 65, JPEG
originals at 55 because past their own artefacts there is no detail left to
keep, and the logos lossless in WebP. `encoded-images.json` beside the script
records each original's SHA-256, and `pnpm test` fails if an original has no
encodes, if its encodes are stale or the wrong size, or if an encode is left
with no original.

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
a visitor anything: the file is fetched by crawlers and never by the page.
`sharp` is a devDependency now, so squeezing the PNG is a one-liner worth
taking one day — [03](plans/03-weight-and-wiring.md) left it alone because its
job was what the page costs, and this file is not on the page.

The touch icon inherits `favicon.svg`'s **placeholder** status — when the real
visual identity lands, both change together.

### Resolution notes

Three files are below the resolution their display size needs — `rig.png`
(433 × 545, shown up to 440px tall in the gallery and full column width in
Setup), `paddock.jpg` (348 × 407), and `fiat-front.png` (828 × 788, and the
centre card of the Content fan). They look soft on any reasonably dense display.
The handoff flagged these as low-res placeholders with hi-res versions to
follow.

`fiat-front.png` and the two portraits are still the largest files in the
repository at ~1.2 MB each, but no current browser fetches them: their AVIFs
are 48–78 KB. The portraits are PNG legitimately, for their alpha. The FIAT
shot is a photograph stored as PNG for no reason; its replacement can be a
JPEG, which means updating the path in `data/simToReal.ts` and
`data/contentStats.ts`.

**When hi-res versions arrive:** keep the same filenames and the same crops,
then run `pnpm images`. That step is not optional: the old encodes beside the
file would otherwise keep winning the `<picture>`, and the new photo would
never be seen. `pnpm test` fails until the encodes are rewritten.

### Logo provenance

The gelbura source file supplied in the handoff
(`316821634_…_n.jpg`) is a 200 × 200 JPEG on a **white background** and is
unusable on a dark page. What ships is `gelbura.png`, a derived white-on-
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
