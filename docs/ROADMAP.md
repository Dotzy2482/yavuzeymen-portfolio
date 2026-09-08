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
- Hero: ambient background, portrait + helmet with per-frame fit, headline,
  info cards, sponsor marquee, CTA. A diagonal scan band sweeps the helmet and
  swaps the photo for its wireframe inside the band; scroll-scrub reveal on
  mobile. (The desktop hover-fade this replaced is gone.)
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

## Planned work

Four workstreams, each with a full plan in [plans/](plans/). The plan carries
the reasoning; this list is only the map. Read the plan before starting one, and
work one per session.

1. **[Awaken the last third](plans/01-awaken-the-last-third.md)** — sections 07,
   08 and 09 have no motion, so the page dies after Sim to Real. Adds a
   scroll-linked variable-width type device built on the Archivo axis the site
   already loads, and moves Setup's placeholder rows into the dashed-slot
   vocabulary the design already uses twice.
2. **[Social card and scroll-spy](plans/02-social-card-and-scroll-spy.md)** —
   `og:image` and `apple-touch-icon` are missing, so a shared link degrades to
   title + description; the card can be composed from the site's own vocabulary
   rather than waiting on photography. And the nav does not highlight the active
   section, though `App.tsx` and `constants.ts` both claim it does.
3. **[Weight and wiring](plans/03-weight-and-wiring.md)** — the image encode
   pass (3.6 MB across 13 files, two of them 1.1 MB photographs stored as PNG),
   self-hosted fonts, the lazy-loaded track-records chunk, plus the small
   corrections: Mount Panorama's region, `Divider`'s unused `animated` prop, the
   `DURATION` / `--duration-*` mismatch.
4. **[Real circuit geometry](plans/04-real-circuit-geometry.md)** — the
   OpenStreetMap pipeline. The outlines shipping today are approximate shapes:
   Suzuka has no figure-eight, Mount Panorama has no mountain climb, on the
   section the whole site is built around. The largest outstanding piece of
   work. **Depends on 3.**

Deliberately left open inside 4, to be decided once real geometry exists: a
per-track `displayDurationMs` (the circuits will differ a lot in length, and the
global 12 s would make a long one read wrong), and real sector splits (the bars
are even thirds of path length today).

## Blocked on material we do not have

No plan unblocks these — each is waiting on a person or a file, and none of the
four workstreams above depends on any of them.

- **Real lap times, lengths and corner counts** from the iRacing profile,
  replacing the handoff's placeholder numbers. Cheap, high-value, and it makes
  the section honest even before the geometry lands.
- **Setup hardware list** — five strings from Yavuz; flip each row's
  `placeholder` to `false` as it is filled.
- **Contact environment values** — e-mail and the three social URLs in
  `.env.local`, so the CTA and the link rows point somewhere.
- **Hi-res photography**, same crops and filenames. `rig.png`, `paddock.jpg`
  and `fiat-front.png` are the three that visibly need it. See
  [CONTENT.md](CONTENT.md).
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
