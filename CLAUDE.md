# CLAUDE.md

Instructions for any Claude session working in this repository. Read this
before touching code.

## What this is

A single-page portfolio site for **Yavuz Eymen**, a sim racing driver who has
crossed over to real-track racing — built from a finished Claude Design
handoff, with an animated circuit-map section as its centrepiece.

## Commands

| Command          | What it does                                     |
| ---------------- | ------------------------------------------------ |
| `pnpm dev`       | Vite dev server on :5173                         |
| `pnpm build`     | `tsc -b` then production build — must stay green |
| `pnpm typecheck` | Types only, no emit                              |
| `pnpm lint`      | ESLint (React Compiler rules are **errors**)     |
| `pnpm test`      | Vitest, single run                               |
| `pnpm format`    | Prettier write (also sorts Tailwind classes)     |
| `pnpm images`    | Encode new or changed rasters to AVIF + WebP     |

Before claiming work is done, run `pnpm build && pnpm lint && pnpm test` and
report the actual output. Prettier reorders Tailwind classes on `format`; that
is expected, not a conflict to undo.

## Architecture rules

**Feature boundaries are real.** `src/features/track-records/` is reachable
**only** through `src/features/track-records/index.ts`. Never import from
`features/track-records/components/…`, `…/hooks/…`, `…/data/…` or `…/lib/…`
outside the feature. The index exports `<TrackRecords />` plus a few types;
that is the whole public surface. Inside the feature, import freely. And only
`sections/TrackRecords` imports it, lazily, behind a placeholder that holds the
section's height — a static import anywhere else silently folds the module and
its path data back into the main chunk.

**Rasters go through `<Picture>`.** It derives the AVIF and WebP sources from
the original's path, so after adding or replacing an image under
`public/images/`, run `pnpm images`. A test fails on a missing, stale or
wrongly sized encode rather than letting a browser fetch a 404. The
`<picture>` is `display: contents`, so its `<source>` elements must stay
`hidden` — otherwise they become items of the parent flex or grid, which is
how Setup's photo once fell into a second row. A test holds that too.

**Colour, spacing, type and radius come from `src/styles/tokens.css`.** Never
hardcode a hex value, a font stack or a shadow in a component. Add or edit the
token, expose it through the `@theme inline` block in `globals.css`, then use
the generated utility (`bg-surface`, `text-accent-primary`, `tracking-mono-lg`)
or `var(--token)` where Tailwind cannot reach (inline SVG attributes, `style`
props). One-off arbitrary values for _layout_ numbers taken from the design
(`px-[72px]`, `text-[34px]`) are fine; one-off _colours_ are not.

**Animation goes through `motion`.** Use `motion/react` components, or the
wrappers in `src/components/motion/` (`Marquee`, `Pinned`, `CountUp`,
`StretchScrub`). Do not write CSS `@keyframes`. Per-frame work that must not
re-render React goes through `useRafLoop` and writes to the DOM directly — that
is the established pattern in the hero helmet reveal and the lap animation; the
scroll rail does the same with motion values.

**Every animation honours `prefers-reduced-motion`.** Call
`usePrefersReducedMotion()` and render a static, immediately-visible state.
Content must never be left invisible because an animation did not run.

**No `any`.** TypeScript is strict, `noUnusedLocals` and `noUnusedParameters`
are on. Give every component a `Props` interface. If a type is genuinely
unknown, use `unknown` and narrow it.

**Do not pass ref objects through props.** The React Compiler lint rules reject
it. Either keep the ref in the component that renders the node, or use the
`data-*` attribute + single container ref pattern already used by
`useLapAnimation`.

## Do not

- **Do not restructure folders.** The layout under `src/` is fixed. Fill in
  existing files; add new files inside the existing directories. Do not create
  new top-level directories under `src/`.
- **Do not copy HTML or CSS out of the `.dc.html` design files.** They are
  prototypes, not source. Everything is rewritten as React + Tailwind. The
  runtime helpers `image-slot.js` and `support.js` are Claude Design internals
  and must never be ported.
- **Do not hand-edit `src/features/track-records/data/trackPaths.ts`.** The
  circuit outlines are generated from OpenStreetMap by
  `docs/assets/generate-track-paths.mjs`, out of two committed inputs:
  `docs/assets/circuits.json` (hand-authored — pinned OSM ids, start lines,
  exclusions) and `docs/assets/circuit-rings.json` (the pinned ways as fetched;
  never edit it). To fix a circuit, edit `circuits.json` and regenerate:

  ```bash
  node docs/assets/generate-track-paths.mjs          # offline: rewrite trackPaths.ts
  node docs/assets/generate-track-paths.mjs --fetch  # network: refresh the cache first
  ```

  `--check` is offline, runs in CI, and asserts the file matches its inputs.
  `tracks.ts` stays hand-maintained — lap times, lengths and names are edited
  there directly, never through the generator. The map data is ODbL: the
  OpenStreetMap credit under the map is a licence obligation, not decoration.
  See [docs/TRACK_RECORDS.md](docs/TRACK_RECORDS.md).

- **Do not hand-edit `public/og-image.png` or `public/apple-touch-icon.png`.**
  Both are rasterised by headless Chrome from sources in the repo — the card
  from `docs/assets/og-card.html`, the icon from `public/favicon.svg`.
  Regenerate them:

  ```bash
  node docs/assets/generate-og-images.mjs
  ```

  `--check` asserts both exist at the dimensions `index.html` advertises. It
  deliberately does not compare bytes: a screenshot is not reproducible across
  Chrome versions or font-cache states.

- **Do not resize either hero portrait, or resize one without the other.**
  `public/images/hero/portrait-cutout.png` and `portrait-helmet.png` are the
  same 1323 × 1189 crop of the same pose, bare-headed and helmeted. The hero
  stacks them in one box and masks the top one to a circle under the cursor,
  held above the neck by a second, static mask drawn in the images' own
  coordinates, so their alignment is the whole effect — it is not corrected at
  runtime and nothing will warn you. Re-encoding is fine; recropping, resizing or replacing
  one alone is not. See [docs/CONTENT.md](docs/CONTENT.md).

- **Do not hardcode contact details.** E-mail, phone and social URLs come from
  `import.meta.env` via `src/data/profile.ts`. This repo is **public** and its
  history will not be rewritten, so anything committed is committed forever.
  `VITE_`-prefixed variables are inlined into the bundle — they are "not in
  git", not "secret".

  Commits are authored as `158623821+Dotzy2482@users.noreply.github.com`, not a
  personal address. The history was rewritten once to make that true, while the
  repository was still private and uncloned; that window is closed, so this is
  now a rule to keep rather than a thing that can be fixed later.

- **Do not commit unreleased media.** `public/images/private/` is git-ignored
  and is the holding area until usage rights are confirmed.

## Known placeholders

Everything below renders correctly but is waiting on real data. Do not "fix"
these by inventing values.

| Where                                   | Placeholder                                                | Waiting on             |
| --------------------------------------- | ---------------------------------------------------------- | ---------------------- |
| `data/setup.ts`                         | All five rows read `MODEL — YER TUTUCU`                    | Yavuz's real hardware  |
| `features/track-records/data/tracks.ts` | Lap times (lengths and corners are real)                   | iRacing profile export |
| `data/profile.ts`                       | Empty e-mail/phone/socials when env is unset               | `.env.local` values    |
| `data/simToReal.ts`                     | `karting` item has `src: null` (dashed slot)               | Karting photo          |
| `data/contentStats.ts`                  | Hand-entered counters and reel captions                    | Instagram insights     |
| Footer links                            | `Gizlilik` / `Şartlar` point at `#`                        | Legal pages            |
| `public/favicon.svg`                    | Placeholder mark, and the source of `apple-touch-icon.png` | Final visual identity  |
| `index.html`                            | No `og:url`, no canonical link                             | A final domain         |

The site must render with an empty `.env` — every variable is optional and
resolves to an empty string.

## Language

Headings and UI labels are **English**; body copy is **Turkish**. Keep that
split exactly as it is — it is a deliberate design decision, not an oversight.
Code, comments and documentation are English.

The document is `lang="tr"`, where CSS `uppercase` maps `i` to `İ`. English
text that gets uppercased carries `lang="en"`; an English or brand name inside
a Turkish title is a `MixedText` run (`src/types`), so "NoGripSimRacing'in"
renders "NOGRIPSIMRACING'İN" and not "NOGRİPSİMRACİNG'İN".

## Multi-session work

Workstreams are planned out in [docs/plans/](docs/plans/), numbered in the
order they must land. All five (`01`–`05`) have landed; their files stay for
the **Reasoning** they record, which the code does not — read the relevant one
before changing the part of the site it built. **Starting a new one:** give it
the next number and the same shape (Reasoning, Steps, Done when, Progress).
**Resuming one:** its Progress list says where the last session stopped. Work
one plan per session.

## Further reading

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — layout, data flow, tokens
- [docs/TRACK_RECORDS.md](docs/TRACK_RECORDS.md) — the animated circuit module
- [docs/CONTENT.md](docs/CONTENT.md) — what is real, what is placeholder
- [docs/ROADMAP.md](docs/ROADMAP.md) — what is done, and what is blocked
- [docs/plans/](docs/plans/) — the five landed workstreams and why they went
  the way they did
