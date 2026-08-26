# Architecture

## Folder layout

```
src/
  app/                 App shell. App.tsx is the document order of the page;
                       Providers.tsx holds cross-cutting context (MotionConfig).
  sections/            One folder per page section. A section owns its layout
                       and its copy, and nothing else. Barrel: sections/index.ts.
    Nav/               Top bar, desktop side columns, full-screen mobile menu
    Hero/              Portrait + helmet (scan reveal) + headline + marquee
    About/ Career/ Achievements/ TrackRecords/ SimToReal/
    Content/ Setup/ Partners/ Contact/
  components/
    ui/                Presentational primitives with no domain knowledge:
                       Button, Tag, MonoLabel, SectionHeading, StatValue,
                       Divider, PhotoCard
    motion/            The animation vocabulary: Marquee, Pinned, CountUp
  features/
    track-records/     Self-contained module behind a single index.ts.
                       See docs/TRACK_RECORDS.md.
  hooks/               App-wide hooks: useInView, useMediaQuery, useRafLoop,
                       usePrefersReducedMotion
  lib/                 cn (class joiner), format (tr-TR number formatting),
                       constants (section order, breakpoints, timing)
  data/                Hand-maintained static content, one file per section
  styles/              tokens.css (source of truth), globals.css (Tailwind bridge)
  types/               Types shared by more than one area
  test/                Vitest setup

docs/
  assets/              Source assets for generated code, and the generators
                       that consume them. Nothing here is imported by the app
                       or shipped in the bundle.
```

Two rules keep this honest:

- **A directory's name is its responsibility.** If a file does not fit that
  responsibility, it is in the wrong place — do not widen the definition to
  accommodate it.
- **Barrels are the import surface.** Import from `@/components/ui`, not
  `@/components/ui/Button`. The exception is inside a feature, where files
  import each other directly.

## Why Vite and not Next.js

The site has no server-side concerns:

- **No routes.** One document, anchor-scrolled. A router would be dead weight.
- **No data fetching.** Every value is a typed constant in `src/data/`. There
  is no CMS and no API. A live social-stats fetch would need a server-side
  token, which a static site has nowhere to keep.
- **No SSR requirement.** The SEO surface is one page and a handful of
  headings. Meanwhile the entire visual identity is scroll-linked and
  `requestAnimationFrame`-driven, so the interesting work happens after
  hydration either way. SSR would buy a class of hydration bugs in exchange for
  very little.
- **Deployment is a static bundle**, hostable anywhere.

Vite gives fast HMR and a small config surface. If the site ever grows a blog
or a race-results archive, Next.js becomes a fair reconsideration — but that
would be a routing and content-model decision, not a rendering one.

## Why feature-based splitting for exactly one feature

Most of the page is static: a heading, some copy, a grid, a hover state. Those
live in `sections/` and share `components/ui`. Splitting them into "features"
would be ceremony.

Track Records is different in kind, not degree. It has SVG path geometry, a
frame loop, playback transport, selection state, and per-frame DOM writes that
deliberately bypass React. That is a subsystem, and subsystems earn a boundary:

```
features/track-records/index.ts   ← the only file the app may import
```

Everything behind it can be rewritten — and it will be, when real circuit
geometry lands — without touching a single consumer. `sections/TrackRecords/`
holds only the section chrome (anchor, heading, spacing) and renders the
module.

The test for adding a second feature folder: _does it own state and behaviour
that the rest of the page must not reach into?_ If not, it is a section.

## Data flow

One direction, no exceptions:

```
src/data/*.ts                  typed constants, hand-maintained
      │
      ▼
src/sections/*                 read data, decide layout, pass plain props
      │
      ▼
src/components/{ui,motion}     presentational, no imports from data/
```

- **`data/` never imports from `sections/` or `components/`.** It is leaf data.
- **`components/ui` and `components/motion` never import from `data/`.** They
  receive everything as props, which is what makes them reusable and testable.
- **`sections/` is the only layer that knows both.** It reads `@/data` and
  composes primitives.
- **`features/track-records/` owns its own data** (`features/track-records/data/`)
  because that data is meaningless outside the module. It may read `@/data` for
  shared facts — it reads `profile.name` for the driver plate — but the reverse
  never happens.

`lib/constants.ts` holds `SECTION_IDS`, the document order that `app/App.tsx`
renders in and the nav highlights against. Changing the page order means
changing both. `SECTION_IDS` is declared `satisfies readonly SectionId[]`, so a
typo fails the build rather than silently producing a dead anchor.

## The design token system

Tokens are **CSS custom properties**, not a JavaScript config object.

**`src/styles/tokens.css`** declares roughly sixty variables on `:root`:
surfaces, the white-alpha ladder used for hairlines and secondary text, the two
accents, track-map colours, font stacks, Archivo width-axis steps, spacing,
radius, shadows, motion timing and layout measures. A `max-width: 47.9375rem`
media query rewrites the layout measures for mobile, so `--gutter` and
`--section-pt` change in one place and every section follows.

**`src/styles/globals.css`** bridges them into Tailwind v4:

```css
@theme inline {
  --color-surface: var(--surface);
  --font-mono: var(--font-mono);
  --tracking-mono-lg: 0.2em;
}
```

`inline` is the important word: the generated utility emits `var(--surface)`
rather than copying the hex value, so re-theming is a single-file edit and the
same variables stay readable from raw CSS and from inline SVG attributes.

The same file defines the few utilities Tailwind has no equivalent for:

| Utility                                  | Why it exists                                                                         |
| ---------------------------------------- | ------------------------------------------------------------------------------------- |
| `.num`                                   | Tabular, slashed-zero mono figures — stops the chronometer jittering as digits change |
| `.stretch-ui` / `-wide` / `-display`     | Archivo's `wdth` variable axis; Tailwind ships no font-stretch utility                |
| `.container-section` / `.container-wide` | The recurring section shell (max width, responsive gutter, 150px top padding)         |

**The rule for contributors:** a colour or a typeface never appears literally
in a component. Layout numbers lifted straight from the design (`px-[72px]`,
`text-[34px]`, `min-h-[190px]`) are fine as arbitrary values — they are
one-offs, not a system. Colours are always a system.

## Motion architecture

`components/motion/` is a vocabulary layer, so sections compose animations
rather than re-deriving them:

| Wrapper   | Job                                                                                                   |
| --------- | ----------------------------------------------------------------------------------------------------- |
| `Marquee` | Seamless infinite strip — repeats children until they cover its box, then scrolls by exactly one copy |
| `Pinned`  | A sticky 100vh stage inside a tall wrapper; hands scroll progress to a render prop as a `MotionValue` |
| `CountUp` | Animates a number and writes it straight to the DOM node                                              |

Two performance rules run through all of it:

1. **Scroll-linked values stay as `MotionValue`s.** `Pinned` hands out a
   `MotionValue`, consumers pipe it through `useTransform`, and nothing
   re-renders per frame. A hook that turned scroll into React state used to live
   in `hooks/` and was removed — every consumer wanted the `MotionValue`.
2. **Per-frame DOM work bypasses React entirely.** `useRafLoop` runs the
   callback; the callback mutates `style` and attributes directly. This is what
   drives the hero helmet fit, the helmet scan reveal and the whole lap
   animation.

The hero's scan reveal is worth one note, because it is the only effect that
shares a loop. `useHelmetScan` deliberately owns no `useRafLoop` of its own: it
returns an `update(elapsed, damp)` that `HeroPortrait` calls from the loop it
already runs for the helmet fit, so the fit and all three masked layers advance
on the same frame. Tuning lives in `sections/Hero/helmetScan.ts`.

Every wrapper checks `usePrefersReducedMotion()` and degrades to a static,
visible state. On a site this animation-heavy the opt-out is a requirement, not
a nicety.

### One caveat worth knowing

Tailwind v4 compiles `-translate-x-1/2` to the standalone `translate` CSS
property, which **composes with** `transform` instead of being overridden by
it. Setting both — a Tailwind translate class and an inline
`transform: translate(-50%, 0)` — shifts the element a full width instead of
half. Anything positioned imperatively must own its transform completely and
must not also carry Tailwind translate utilities.

## Testing

Vitest + jsdom, with Testing Library available. Current coverage is the
track-records maths: lap-time formatting and parsing, dash geometry, sector
fill, and a data-integrity suite asserting every circuit path is a single
closed subpath with a unique id.

jsdom implements none of `SVGGeometryElement`, so `lib/svgPath.ts`
feature-detects `getTotalLength` / `getPointAtLength` and degrades to zero
values rather than throwing. Keep that guard when extending it.

## Quality gates

`pnpm build` runs `tsc -b` first, so type errors fail the build. ESLint
includes the React Compiler rule set at **error** severity — notably "cannot
access refs during render", which is what pushed `useLapAnimation` to the
`data-*` attribute pattern instead of threading ref objects through props.
Prettier owns formatting and sorts Tailwind classes; do not fight its output.

CI runs the same gates on every push to `main` and every pull request, in this
order: lint, format check, typecheck, **test**, build. The test step was missing
for a long time, so the suite only ever ran on contributors' machines — if it
disappears again, the 34 tests stop being enforced by anything. A second job
runs gitleaks over the full history; it needs `pull-requests: read` to scan a
PR's commit range, and without that permission it fails with a 403 that says
nothing about whether a secret is present.

`workflow_dispatch` is enabled, so a run can be requested for any ref when an
automatic one does not report.
