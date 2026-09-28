# Roadmap

## Done

**Foundations**

- Design tokens extracted from the handoff style guide into
  `styles/tokens.css` — ~60 CSS custom properties covering surfaces, the
  white-alpha ladder, both accents, track-map colours, type, spacing, radius,
  shadows and layout measures, with mobile overrides in one media query.
- Tailwind v4 theme bridge plus the custom utilities the design needs
  (`.num`, `.stretch-*`, `.container-section`).
- Fonts wired up: Archivo variable, Instrument Serif, Martian Mono.

**Primitives**

- App-wide hooks: `useInView`, `useMediaQuery`, `usePrefersReducedMotion`,
  `useRafLoop`.
- UI primitives: `Button`, `Tag`, `MonoLabel`, `SectionHeading`, `StatValue`,
  `Divider`, `PhotoCard`.
- Motion vocabulary: `Marquee`, `Pinned`, `CountUp` — every one honouring
  `prefers-reduced-motion`. (`Reveal`, `Stagger`, `ParallaxLayer` and a
  scroll-progress hook were built and then removed unused; the design's scroll
  language is scrub-linked, not entrance animations.)
- `lib/format.ts` with Turkish number formatting.

**Sections — all nine plus the hero**

- Nav (top bar, desktop side columns, full-screen mobile menu).
- Hero: ambient background, portrait, headline, info cards, sponsor marquee,
  CTA. Two photos of the same frame are stacked — bare-headed and helmeted —
  and a soft-edged circle reveals the helmeted one under the cursor; below `md`
  the pinned scroll irises it shut instead. (The fitted helmet cut-out and its
  wireframe scan band this replaced are gone.)
- About, Career (scroll-filled timeline), Achievements, Sim to Real (pinned
  horizontal gallery), Content (counters + card fan), Setup, Partners,
  Contact + footer.

**Track Records**

- Full module: region tabs, track list and mobile chips, animated panel,
  chronometer, sector bars, transport controls, driver plate.
- Circuit data generated from the handoff rather than transcribed.
- 34 unit tests covering lap-time round-tripping, dash geometry, sector fill
  and path integrity.

**Assets**

- 14 image assets in place; AVIF logo converted with a PNG fallback.

**The last third** — [workstream 01](plans/01-awaken-the-last-third.md)

- Sections 07 Setup, 08 Partners and 09 Contact scrub. `StretchScrub` publishes
  a scroll-linked Archivo width axis as a custom property, which
  `.stretch-scrub` reads on exactly one element; `SectionHeading` opts in
  through a `stretch` prop. Setup's row underlines and Contact's finish line
  fill on the same scroll.
- Setup's five placeholder rows moved into the dashed-slot vocabulary Partners
  and Sim to Real already use, so the gap reads as reserved rather than
  forgotten. The copy is unchanged and stays `sr-only`.

**Social card and scroll-spy** — [workstream 02](plans/02-social-card-and-scroll-spy.md)

- A shared link now carries a real card. `docs/assets/og-card.html` composes
  1200×630 from the site's own vocabulary — the hero's ambient wash and racing
  lines, the helmet wireframe, Signal Cyan, and copy quoted from
  `data/profile.ts` — and `docs/assets/generate-og-images.mjs` rasterises it,
  plus a 180×180 `apple-touch-icon.png` off `favicon.svg`, through headless
  Chrome. `twitter:card` is `summary_large_image` at last.
- `useActiveSection` gives the nav a scroll-spy, in both the desktop PAGES
  column and the overlay menu, marked with `aria-current="location"` and not
  colour alone. It watches a band across the middle of the viewport and lights
  only the four sections `NAV_ITEMS` lists, so the six it does not list leave
  the nav honestly dark rather than pointing at the wrong place. Eleven unit
  tests; the comments in `App.tsx` and `constants.ts` that claimed all this
  before it existed are now true.

**Weight and wiring** — [workstream 03](plans/03-weight-and-wiring.md)

- Every image is served as AVIF, with WebP and then the original behind it in a
  `<picture>`. `pnpm images` encodes whatever is new or changed at the
  original's exact pixel size, through `sharp` as a devDependency; `<Picture>`
  derives both sources from the original's path. A browser that takes AVIF now
  downloads 484 KB of images for the page instead of 4.50 MB, and the two hero
  portraits cost 153 KB instead of 2.29 MB. A test fails if any raster's
  encodes are missing, stale or the wrong size — which is what makes dropping
  hi-res photography in under the old filename safe.
- Archivo, Instrument Serif and Martian Mono are self-hosted from
  `public/fonts/`, `latin` + `latin-ext` for the Turkish copy, with the three
  faces the hero needs preloaded. The page makes no third-party request, and
  Archivo keeps its full `wdth 62–125` axis, so 01's scrub still sweeps it.
- The track-records module is its own chunk, loaded lazily behind a
  placeholder that holds its footprint and an error boundary that keeps a
  failed load to that one section. Main chunk 399.82 → 383.20 kB; the module
  is 18.40 kB on its own.
- Mount Panorama's tab is `APAC` — renamed rather than split, so neither
  circuit is mis-filed and no tab is left with one. `Divider`'s dead `animated`
  branch is gone. The duration scale has one source: `--duration-*` in
  tokens.css, read by CSS through `duration-*` utilities and mirrored by
  `DURATION` under a test.

## Planned work

One workstream, with a full plan in [plans/](plans/). The plan carries the
reasoning; this list is only the map. Read the plan before starting it.

Numbered to match the plan filenames, so `01`–`03` are missing rather than
renumbered.

4. **[Real circuit geometry](plans/04-real-circuit-geometry.md)** — the
   OpenStreetMap pipeline. The outlines shipping today are approximate shapes:
   Suzuka has no figure-eight, Mount Panorama has no mountain climb, on the
   section the whole site is built around. The largest outstanding piece of
   work. Its prerequisite, 03, has landed: the chunk its path data will grow is
   already lazy, and `TrackRegion` is settled.

Deliberately left open inside 4, to be decided once real geometry exists: a
per-track `displayDurationMs` (the circuits will differ a lot in length, and the
global 12 s would make a long one read wrong), and real sector splits (the bars
are even thirds of path length today).

## Blocked on material we do not have

No plan unblocks these — each is waiting on a person or a file, and the
workstream above does not depend on any of them.

- **Real lap times, lengths and corner counts** from the iRacing profile,
  replacing the handoff's placeholder numbers. Cheap, high-value, and it makes
  the section honest even before the geometry lands.
- **Setup hardware list** — five strings from Yavuz; flip each row's
  `placeholder` to `false` as it is filled.
- **Contact environment values** — e-mail and the three social URLs in
  `.env.local`, so the CTA and the link rows point somewhere.
- **Hi-res photography**, same crops and filenames, followed by `pnpm images`.
  `rig.png`, `paddock.jpg` and `fiat-front.png` are the three that visibly need
  it. See [CONTENT.md](CONTENT.md).
- **Karting photo** for the empty Sim to Real slot.
- **Instagram figures** refreshed from the account with a visible "as of" date,
  since they are hand-entered snapshots.
- **Legal page copy.** `Gizlilik` and `Şartlar` link to `#`.

## Unscheduled

- **Component tests for the interactive parts.** Selection behaviour and
  playback intent are testable without a frame loop; that is exactly why
  `usePlayback` and `useLapAnimation` are separate hooks.
- **Analytics**, if it is ever wanted — privacy-preserving and cookieless, or
  not at all.

## Explicitly not planned

- **A CMS or an API.** Content is hand-maintained typed constants. A live
  social-stats fetch would need a server-side token, which a static site has
  nowhere to keep.
- **A light theme.** The site is dark-only by design; a theme provider for one
  theme is dead weight.
- **A contact form.** It would need a backend or a third-party endpoint. The
  mailto CTA is the design's answer.
- **Server-side rendering.** See [ARCHITECTURE.md](ARCHITECTURE.md) for why
  Vite over Next.js.
