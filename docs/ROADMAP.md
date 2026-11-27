# Roadmap

## Done

**Foundations**

- Design tokens extracted from the handoff style guide into
  `styles/tokens.css` — some seventy CSS custom properties covering surfaces, the
  white-alpha ladder, both accents, track-map colours, type, spacing, radius,
  shadows and layout measures, with mobile overrides in one media query.
- Tailwind v4 theme bridge plus the custom utilities the design needs
  (`.num`, `.stretch-*`, `.container-section`).
- Fonts wired up: Archivo variable, Instrument Serif, Martian Mono.

**Primitives**

- App-wide hooks: `useInView`, `useMediaQuery`, `usePrefersReducedMotion`,
  `useRafLoop`, and later `useActiveSection` (02).
- UI primitives: `Button`, `Tag`, `MonoLabel`, `SectionHeading`, `StatValue`,
  `Divider`, `PhotoCard`, and later `Picture` (03) and `SocialLinks`.
- Motion vocabulary: `Marquee`, `Pinned`, `CountUp`, and later `StretchScrub`
  (01) — every one honouring
  `prefers-reduced-motion`. (`Reveal`, `Stagger`, `ParallaxLayer` and a
  scroll-progress hook were built and then removed unused; the design's scroll
  language is scrub-linked, not entrance animations.)
- `lib/format.ts` with Turkish number formatting.

**Sections — all nine plus the hero**

- Nav (top bar, desktop side columns, full-screen mobile menu; a desktop bar
  past the hero since 05).
- Hero: ambient background, portrait, headline, info cards, sponsor marquee (later a still bar),
  CTA. Two photos of the same frame are stacked — bare-headed and helmeted —
  and a soft-edged circle reveals the helmeted one under the cursor; below `md`
  the pinned scroll irises it shut instead. Since 05 the reveal stops at the
  neck, where the two bodies do not quite line up. (The fitted helmet cut-out and its
  wireframe scan band this replaced are gone.)
- About, Career (scroll-filled timeline), Achievements, Sim to Real (a photo
  grid with in-frame parallax, since the pinned horizontal gallery was
  retired), Content (counters + card fan), Setup, Partners, Contact + footer.

**Track Records**

- Full module: region tabs, track list and mobile chips, animated panel led by
  the personal best with a lap-replay clock beside it (05), sector bars,
  transport controls, driver plate.
- Circuit data generated from the handoff rather than transcribed; the
  outlines have since been replaced by real geometry (workstream 04, below).
- Unit tests covering lap-time round-tripping, dash geometry, sector fill and
  path integrity.

**Assets**

- Every image the design references is in place; since 03 each raster is
  served as AVIF and WebP ahead of the original. See [CONTENT.md](CONTENT.md).

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
- The Track Records marker brakes for corners. Each circuit gets a speed
  profile from its own outline (corner speed from curvature, then braking and
  acceleration passes), so the car slows into a hairpin and accelerates down
  the straight, while the chronometer still lands on the personal best at the
  line. Modelled against plausible GT3 laps, all twelve then came within 6%. See
  [TRACK_RECORDS.md](TRACK_RECORDS.md#the-marker-brakes-for-corners).
- The Content reel fan was rebuilt. The cards are rounded (the one exception to
  the site's square corners, since they are phone screens) and step down an
  arc with only 10px of overlap. The fan deals itself out on a damped scroll
  scrub, and a hovered card lifts on a spring and turns square to the reader,
  without covering the centre card's view count any more. Below 1024px tablets
  get the phone's carousel.
- Sim to Real no longer pins the page. The 240vh pinned gallery held the page
  still for more than two screens while the photos slid sideways, which read
  as the page seizing up. It is now a grid that reads left to right: three
  portraits over the FIAT Egea wide shot, the race crop and the karting slot.
  Each photo drifts inside its frame against the scroll, every column at its
  own pace, so the grid has depth and the scroll stays the reader's.
- Track Records shows Yavuz's real iRacing personal bests: fourteen circuits,
  each with his fastest lap in any car and session and the car named in the
  panel. Nine circuits he had never driven left with their placeholder times;
  Spa, the Nordschleife, Monza, Barcelona, Le Mans, Road America, Sebring,
  VIR, Indianapolis, Fuji and Okayama arrived, their outlines fetched through
  the generator's new `--changed --api` mode while Overpass was down. See
  [TRACK_RECORDS.md](TRACK_RECORDS.md#real-lap-times).
- Only Yavuz's own partner is shown. gelbura, SPARDOX and DriveHunter sponsor
  his team, not him, so they left the hero strip and the Partners grid, logo
  files and all. Partners is now one feature card for Team Curve Hunters, logo
  in colour, with a "become a partner" line in place of the dashed slots.
- The hero's scrolling logo strip is a still bar: Kick status on the left —
  "LIVE ON KICK" with the viewer count while Yavuz is streaming, polled from
  the browser every two minutes — the Business Enquiries button in the middle
  and a scroll cue on the right. The KICK social link gets a red dot while
  live. `Marquee` is no longer used anywhere.
- The Content reel cards play Yavuz's own footage: five 7-second muted loops
  (540 × 960 H.264, 0.6–1.5 MB each) cut from his phone videos with ffmpeg —
  the Egea through the cones, the TOSFED sim rig, the paddock, his home rig
  and telemetry, and a kart onboard. Each loads nothing until its card is on
  screen and pauses when it leaves; under reduced motion it is its poster.
- The Content fan is a playlist of nine cards in five slots: four Instagram
  reels Yavuz picked (his iRacing work with a facecam), each linking to the
  reel with no view count, between five clips of his own footage. The centre
  plays once at full size, then every card travels one slot left; ← → buttons
  under the fan step it by hand. Side cards
  loop 270 × 480 previews. The counters are the signed-in reading of all 346
  reels: 5M+ views, 797,000 on the best, nine past 100K. See
  [plans/06](plans/06-real-material.md).
- The page below the hero has an ambient background (`app/PageAmbient`): the
  hero's colour fields and racing lines, fixed behind the sections, moving
  with the scroll and fading in only as the hero leaves.
- Setup shows his own rig at home with numbered markers on the wheel,
  pedals, displays and PC, matching the numbers on the rows; the list grew to
  his displays, PC parts and sim.
- The Sim to Real gallery and Setup moved to Yavuz's full-resolution
  originals, the karting slot is filled, and the About portrait is an upscale.
- The YE monogram (a slashed italic Y and E, traced from the concept he
  picked) is the favicon and the nav mark; the name moved to the hero.
- Setup lists his real wheel and pedals, and the contact CTA and social row
  (Kick added) point at his accounts through `.env.local`.

**Critique fixes** — [workstream 05](plans/05-critique-fixes.md)

- A design critique of the live build, measured in headless Chrome, and the
  fixes it called for. `<Picture>`'s `<source>` elements no longer become
  flex and grid items. They had pushed Setup's photo into a second row (the
  section is 445px shorter now) and put uneven gaps into the hero marquee.
- The nav stays reachable. On phones the fixed bar gets a surface once the
  page scrolls, so the wordmark no longer lands on content. On desktop a
  compact bar appears once the hero has gone, with the four links, the
  scroll-spy's marker (visible at last past the hero) and Business Enquiries.
  The overlay menu offers the CTA too, and the menu button is 44 × 44.
- Track Records leads with the personal best. The running clock stays as a
  secondary "Lap replay" readout, and below 1024px the list stacks above the
  panel instead of squeezing it.
- Meaning-bearing labels are 11px or larger; English and brand names inside
  Turkish titles keep their undotted I; phones get the role line under the
  headline, stacked Achievements chips and bigger contact targets.
- The helmet reveal is held above the neck, so the two photos' mismatched
  shoulders never show.

**Performance** — [workstream 07](plans/07-performance.md)

- Measured before anything changed, in headless Chrome at 4× CPU
  throttling (`docs/assets/measure-frames.mjs`): with nothing moving, the
  main thread was busy about 950 ms of every second.
- The hero's helmet loop runs only while the hero is on screen and reads no
  layout while idle; the ambient loops (colour fields, the drawing's drift,
  the scroll cue, the Kick pulse, Setup's pings) run on the compositor; the
  cyan runners hold while they cannot be seen; the lap animation reads
  before it writes.
- Follow-up: the page ambient's promoted layers were undone. Measured in a
  real Chrome window they cost the GPU more than they saved, and the page
  scrolled worse than before the plan (188 frames per full scroll against
  214; 211.5 with the fix).
- Main-thread work per frame fell 15–30 % across the page and scrolling went
  from every other frame to every frame, with nothing on screen changed —
  checked by pixel-diffing screenshots of both builds.
- The social card is re-encoded losslessly by `generate-og-images.mjs`:
  280 → 196 KB, the same pixels.

## Planned work

None. All seven workstreams in [plans/](plans/) have landed; their files stay for
the reasoning they record. What is left is either blocked on material or a
decision from Yavuz (below), or deliberately unscheduled.

## Blocked on material we do not have

No plan unblocks these — each is waiting on a person or a file.

- **A phone number**, if one is ever wanted on the page: `VITE_CONTACT_PHONE`
  is the one contact value still empty. (Real lap times, the Setup list, the
  e-mail and the four social URLs all arrived in November 2026.)
- **Upscaled phone photos**, optional: the rig, karting and pit-pass shots and
  the About portrait could be sharper. (The low-res gallery files and the
  empty karting slot were resolved in November 2026; see
  [CONTENT.md](CONTENT.md).)
- **Instagram figures** refreshed from the account with a visible "as of" date,
  since they are hand-entered snapshots.
- **Legal page copy.** `Gizlilik` and `Şartlar` link to `#`.
- **A final domain**, for `og:url`, a canonical link and a `robots.txt` /
  sitemap worth having.
- **Two decisions for Yavuz**, flagged in [CONTENT.md](CONTENT.md): whether the
  document head speaks English or Turkish, and how often the iRacing and
  Instagram figures get refreshed.
- **Private vulnerability reporting** is off in the repository settings, so the
  flow [SECURITY.md](../SECURITY.md) describes does not work until the owner
  switches it on (Settings → Code security).

## Unscheduled

- **A per-track `displayDurationMs`.** Left open by workstream 04 on purpose.
  With real geometry the circuits run from 3.6 to 6.2 km, and every lap still
  takes 12 s on screen, so a long lap reads no longer than a short one. It
  changes the timing invariant [TRACK_RECORDS.md](TRACK_RECORDS.md) is built
  around, so it is its own change with its own doc update.
- **Analytics**, if it is ever wanted — privacy-preserving and cookieless, or
  not at all.
- **A web manifest and JSON-LD** (`Person`) — cheap, but only worth it once
  there is a domain to point them at.

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
