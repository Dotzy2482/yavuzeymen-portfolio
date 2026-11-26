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
| `data/profile.ts`           | Instagram / YouTube / TikTok / Kick URLs             | **Env-driven**      | `.env.local`; fall back to `#`                                       |
| `sections/About/About.tsx`  | Four Turkish bio paragraphs                          | **Real**            | Design handoff, final copy                                           |
| `data/career.ts`            | Six timeline entries, 2019–2025                      | **Real**            | Design handoff, final copy                                           |
| `data/achievements.ts`      | Six result cards                                     | **Real**            | Design handoff, final copy                                           |
| `data/partners.ts`          | Team Curve Hunters, the one partner                  | **Real**            | gelbura, SPARDOX, DriveHunter sponsor the team, not Yavuz — removed  |
| `data/contentStats.ts`      | 5M+ reel views / 797.000 top reel / 9 reels ≥ 100K   | **Real** (snapshot) | All 346 reels of @yavuzeymen_12, read signed in, 27 Nov 2026         |
| `data/contentStats.ts`      | Nine cards: 4 reels Yavuz picked (linked) + 5 clips  | **Real**            | `public/videos/reels/` (+ `preview/`), posters in `images/reels/`    |
| `data/setup.ts`             | Wheel, pedals, displays, PC, sim + photo markers     | **Real**            | Yavuz, Nov 2026; displays read off his rig photo (`images/setup/`)   |
| `data/simToReal.ts`         | Six photos, karting included                         | **Real**            | Originals supplied November 2026; see assets below                   |
| `features/…/data/tracks.ts` | 14 circuit names + regions                           | **Real**            | Every circuit he has an iRacing lap at                               |
| `features/…/data/tracks.ts` | Lengths, corner counts                               | **Real**            | Published figures; every length agrees with the OSM geometry to 2.6% |
| `features/…/data/tracks.ts` | Lap times + car                                      | **Real** (snapshot) | iRacing profile, November 2026 — see TRACK_RECORDS.md                |
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
needed. The November 2026 delivery covered the gallery, karting included.

**Yavuz directly** — the Setup list. Filled in November 2026 with the two rows
he wanted (wheel and base, pedals); the rig, display and PC rows the handoff
reserved were dropped rather than left empty. A row added later with
`placeholder: true` renders as a dashed reserved slot, the same empty-slot
language as the Partners cells and the karting photo.

## Image assets

All under `public/images/`. Everything referenced by the design is present and
loading.

Every raster ships three ways: the original, and an AVIF and a WebP that
`pnpm images` (`docs/assets/encode-images.mjs`) writes beside it at exactly the
original's pixel size. `<Picture>` (`components/ui`) derives both encodes from
the original's path, so a browser takes the AVIF, falls back to the WebP, and
only fetches the original if it takes neither. The table lists the original
and the AVIF, which is what a current browser actually downloads.

| File                          | Dimensions  | Original | AVIF   | Used by                       | Note                                                                  |
| ----------------------------- | ----------- | -------- | ------ | ----------------------------- | --------------------------------------------------------------------- |
| `hero/portrait-cutout.png`    | 1323 × 1189 | 1.16 MB  | 75 KB  | Hero                          | Background removed. Must stay the same crop as `portrait-helmet.png`  |
| `hero/portrait-helmet.png`    | 1323 × 1189 | 1.13 MB  | 78 KB  | Hero                          | The same frame with the helmet on — the layer the cursor reveals      |
| `portraits/studio-seated.jpg` | 1682 × 2528 | 230 KB   | —      | About, reel card              | Upscaled with Gemini (Nov 2026) from the 1023 × 1537 original         |
| `simtoreal/paddock.jpg`       | 1600 × 2000 | 230 KB   | —      | Sim to Real, reel card        | Yavuz in the TOSFED paddock, cut from pro shot `rv__9891`             |
| `simtoreal/pit-pass.jpg`      | 1500 × 2000 | —        | —      | Sim to Real, reel card        | Full frame of phone photo `IMG_7297` (was a 1200 × 1600 crop)         |
| `simtoreal/fiat-egea.jpg`     | 2400 × 1601 | 367 KB   | —      | Sim to Real                   | Pro shot `rv__0183`, re-exported at 2400 wide                         |
| `simtoreal/fiat-race.jpg`     | 2400 × 1601 | 395 KB   | —      | Sim to Real, centre reel card | Pro action shot `rv__0653`; replaced a broadcast screenshot           |
| `simtoreal/rig.jpg`           | 1600 × 2000 | 284 KB   | 136 KB | Sim to Real, Setup, reel card | Phone photo `IMG_7245`, the frame the old 433 × 545 rig.png came from |
| `simtoreal/karting.jpg`       | 1600 × 2000 | 312 KB   | —      | Sim to Real                   | Phone photo `IMG_9751` (HEIC), fills the old empty slot               |
| `partners/tch.png`            | 256 × 75    | 20 KB    | 6 KB   | Partners                      |                                                                       |

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

Both carry Yavuz's YE monogram: a slashed italic Y and E, traced into SVG from
the Gemini concept he picked in November 2026 and recoloured to his choice
(purple Y, navy E). `components/ui/LogoMark.tsx` draws the same paths in the
nav. Change the favicon, the component and the touch icon together.

### Resolution notes

In November 2026 Yavuz supplied the originals, and the three files that were
below the resolution their display size needs — `rig.png` (433 × 545),
`paddock.jpg` (348 × 407) and `fiat-front.png` (828 × 788, a broadcast
screenshot stored as PNG) — were replaced: the rig at full resolution from the
phone photo it had been cut from, the paddock with Yavuz's own portrait from
the professional set, the race crop with a professional action shot. The
karting slot was filled from the same delivery. A few phone photos (rig,
karting, pit pass) and the About portrait may still be upscaled; the prompts
for that live with the originals, not in the repo.

**When hi-res versions arrive:** keep the same filenames and the same crops,
then run `pnpm images`. That step is not optional: the old encodes beside the
file would otherwise keep winning the `<picture>`, and the new photo would
never be seen. `pnpm test` fails until the encodes are rewritten.

### The hero pair

The two hero portraits are one pose shot twice, bare-headed and helmeted, and
the hero stacks them in one box. The heads line up; the bodies under them nearly
do — the collar and the neck differ by a few pixels — and wherever the cursor
circle's edge crossed them that showed as a seam. So the helmeted layer is also
held to a fixed region that ends at a neck line just under the chin bar, the
line the owner drew on a screenshot. Below it only the bare-headed photo ever
shows, at any cursor position or scroll.

The region is measured in these two files' own pixels
(`sections/Hero/helmetRegion.ts`), which is one more reason neither may be
recropped or resized. A replacement pair shot at the same crop still needs the
line checked: `helmetRegion.test.ts` lists the helmet's silhouette, and fails if
any of it falls outside the fully opaque part of the region.

### Logo provenance

`tch.png` is the only logo left, shown in its own colours and never above its
native 256px width. The three team-sponsor logos (gelbura, SPARDOX,
DriveHunter) were removed in November 2026 along with their files; see
`data/partners.ts`.

### Not copied from the handoff

Deliberately excluded: `uploads/Ekran görüntüsü *.png` (a screenshot of a
different website, used as reference only) and `uploads/pasted-*.png`
(intermediate working files). Also excluded are three superseded assets the
README mentioned but neither prototype actually references —
`ChatGPT … 19_02_02.png`, `… 19_06_04.png` and `… 20_24_15.png`.

## Privacy constraints on content

This repository is public and its history will not be rewritten.

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
