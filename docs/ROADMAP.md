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
- Circuit data generated from the handoff rather than transcribed; the
  outlines have since been replaced by real geometry (workstream 04, below).
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

**Real circuit geometry** — [workstream 04](plans/04-real-circuit-geometry.md)

- The twelve outlines are the real circuits, drawn from OpenStreetMap —
  Suzuka's figure-eight, Mount Panorama's mountain, Watkins Glen's Boot — each
  running its real direction of travel and starting on its real start/finish
  line. `docs/assets/generate-track-paths.mjs` walks the OSM ways pinned in
  `circuits.json` into rings from a committed cache, `circuit-rings.json`, so no
  build touches Overpass; `--check`, in CI, asserts the generated
  `trackPaths.ts` matches its inputs. Every measured ring agrees with the
  length the panel shows to within 1.5%.
- The start/finish question is answered by rotating each ring at generation
  time, not by a `startFinishOffset` field, so the lap loop did not change.
- The map credits OpenStreetMap on the page, as the ODbL requires.

**Beyond the plans**

- The native page scrollbar is gone. `sections/Nav/ScrollRail` draws a lap rail
  down the right edge instead — a hairline track, a Signal Cyan fill, the Track
  Records car dot as its head and a notch per section — that can be dragged and
  clicked with a mouse, and is a two-pixel progress line on touch screens.
- Component and hook tests for the interactive parts of Track Records:
  selection, transport, the path-point cache and the lap loop itself on a
  hand-cranked frame clock. They found that the chronometer never showed the
  personal best — the lap wrapped with `% 1`, so no frame was drawn at the line
  — which is fixed.
- The transport buttons are named by the words they show (WCAG 2.5.3), and a
  running lap stops if reduced motion is switched on mid-visit.
- Vitest 4, with the coverage plugin moved alongside it.

## Planned work

None. All four workstreams in [plans/](plans/) have landed; their files stay for
the reasoning they record. What is left is either blocked on material from
Yavuz (below) or deliberately unscheduled.

## Blocked on material we do not have

No plan unblocks these — each is waiting on a person or a file.

- **Real lap times, lengths and corner counts** from the iRacing profile,
  replacing the handoff's placeholder numbers. Cheap, high-value, and it makes
  the section's numbers as true as its geometry.
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

- **A per-track `displayDurationMs`.** Left open by workstream 04 on purpose.
  With real geometry the circuits run from 3.6 to 6.2 km, and every lap still
  takes 12 s on screen, so a long lap reads no longer than a short one. It
  changes the timing invariant [TRACK_RECORDS.md](TRACK_RECORDS.md) is built
  around, so it is its own change with its own doc update.
- **Real sector splits.** The bars are even thirds of path length. The
  mechanism is the start line's — pin two more coordinates beside `startLine`
  in `docs/assets/circuits.json` and emit their fractions — but it changes
  `getSectorFill` and the three unit tests that hardcode thirds.
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
