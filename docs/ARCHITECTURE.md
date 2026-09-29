# Architecture

## Folder layout

```
src/
  app/                 App shell. App.tsx is the document order of the page;
                       Providers.tsx holds cross-cutting context (MotionConfig).
  sections/            One folder per page section. A section owns its layout
                       and its copy, and nothing else. Barrel: sections/index.ts.
    Nav/               Top bar, desktop side columns, the compact desktop bar
                       that takes over past the hero, the full-screen overlay
                       menu, and the scroll rail that replaces the scrollbar
    Hero/              Portrait + helmet (cursor reveal) + headline + marquee
    About/ Career/ Achievements/ TrackRecords/ SimToReal/
    Content/ Setup/ Partners/ Contact/
  components/
    ui/                Presentational primitives with no domain knowledge:
                       Button, Tag, MonoLabel, SectionHeading, StatValue,
                       Divider, PhotoCard, Picture, SocialLinks
    motion/            The animation vocabulary: Marquee, Pinned, CountUp,
                       StretchScrub
  features/
    track-records/     Self-contained module behind a single index.ts.
                       See docs/TRACK_RECORDS.md.
  hooks/               App-wide hooks: useInView, useMediaQuery, useRafLoop,
                       usePrefersReducedMotion, useActiveSection
  lib/                 cn (class joiner), format (tr-TR number formatting),
                       constants (section order, breakpoints, timing)
  data/                Hand-maintained static content, one file per section
  styles/              tokens.css (source of truth), globals.css (Tailwind bridge),
                       fonts.css (@font-face for the self-hosted faces in
                       public/fonts/)
  types/               Types shared by more than one area
  test/                Vitest setup

docs/
  assets/              Source assets for generated code, and the generators
                       that consume them — including encode-images.mjs, which
                       writes the AVIF/WebP beside every raster in public/.
                       Nothing here is imported by the app or shipped in the
                       bundle.
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

Everything behind it can be rewritten without touching a single consumer — as
it was when real circuit geometry replaced the handoff's sketches, a change no
file outside the module noticed. `sections/TrackRecords/`
holds only the section chrome (anchor, heading, spacing) and renders the
module.

The boundary is also the page's one code split. The section imports the index
with `lazy()`, so the module is its own chunk and the main bundle paints the
hero without it; the anchor and heading stay eager, because the nav's
scroll-spy looks sections up by id once, on mount. A placeholder mirroring the
module's frame holds its height while the chunk is in flight, and an error
boundary keeps a failed chunk request to this one section. The split only
holds while nothing else imports a value from the index — see
[TRACK_RECORDS.md](TRACK_RECORDS.md#public-api).

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
  The one exception is `SocialLinks`, which reads `socialLinks` itself so the
  three places that list the channels cannot drift apart.
- **`sections/` is the only layer that knows both.** It reads `@/data` and
  composes primitives.
- **`features/track-records/` owns its own data** (`features/track-records/data/`)
  because that data is meaningless outside the module. It may read `@/data` for
  shared facts — it reads `profile.name` for the driver plate — but the reverse
  never happens. Its circuit outlines, `data/trackPaths.ts`, are the one
  generated file in it: `docs/assets/generate-track-paths.mjs` writes them from
  OpenStreetMap, and [TRACK_RECORDS.md](TRACK_RECORDS.md) says how.

`lib/constants.ts` holds `SECTION_IDS`, the document order that `app/App.tsx`
renders in and the nav highlights against. Changing the page order means
changing both. `SECTION_IDS` is declared `satisfies readonly SectionId[]`, so a
typo fails the build rather than silently producing a dead anchor.

## The design token system

Tokens are **CSS custom properties**, not a JavaScript config object.

**`src/styles/tokens.css`** declares some seventy variables on `:root`:
surfaces, the white-alpha ladder used for hairlines and secondary text, the two
accents, track-map colours, font stacks, Archivo width-axis steps, spacing,
radius, shadows, motion timing and layout measures. A `max-width: 47.9375rem`
media query rewrites the layout measures for mobile, so `--gutter` and
`--section-pt` change in one place and every section follows.

The font stacks name faces that are **self-hosted**: `src/styles/fonts.css`
declares them over the files in `public/fonts/` — `latin` and `latin-ext` of
each, the Turkish ş ğ İ being in the second — and `index.html` preloads the
three `latin` files the hero needs at first paint. The page makes no
third-party request. Archivo's file carries its full `wdth 62–125` axis, which
the `.stretch-*` utilities and `StretchScrub` both depend on.

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

| Utility                                  | Why it exists                                                                           |
| ---------------------------------------- | --------------------------------------------------------------------------------------- |
| `.num`                                   | Tabular, slashed-zero mono figures — stops the chronometer jittering as digits change   |
| `.stretch-ui` / `-wide` / `-display`     | Archivo's `wdth` variable axis; Tailwind ships no font-stretch utility                  |
| `.stretch-scrub`                         | The same axis, read live from `--axis-wdth` so scroll can drive it (see `StretchScrub`) |
| `.container-section` / `.container-wide` | The recurring section shell (max width, responsive gutter, 150px top padding)           |

**The rule for contributors:** a colour or a typeface never appears literally
in a component. Layout numbers lifted straight from the design (`px-[72px]`,
`text-[34px]`, `min-h-[190px]`) are fine as arbitrary values — they are
one-offs, not a system. Colours are always a system.

## Motion architecture

`components/motion/` is a vocabulary layer, so sections compose animations
rather than re-deriving them:

| Wrapper        | Job                                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------------------- |
| `Marquee`      | Seamless infinite strip — repeats children until they cover its box, then scrolls by exactly one copy         |
| `Pinned`       | A sticky 100vh stage inside a tall wrapper; hands scroll progress to a render prop as a `MotionValue`         |
| `CountUp`      | Animates a number and writes it straight to the DOM node                                                      |
| `StretchScrub` | Publishes a scroll-linked `--axis-wdth`, which `.stretch-scrub` reads — widening Archivo as a heading arrives |

Two performance rules run through all of it:

1. **Scroll-linked values stay as `MotionValue`s.** `Pinned` hands out a
   `MotionValue`, consumers pipe it through `useTransform`, and nothing
   re-renders per frame. A hook that turned scroll into React state used to live
   in `hooks/` and was removed — every consumer wanted the `MotionValue`.
2. **Per-frame DOM work bypasses React entirely.** `useRafLoop` runs the
   callback; the callback mutates `style` and attributes directly. This is what
   drives the hero helmet reveal and the whole lap animation.

The hero's helmet reveal is worth one note. `useHelmetReveal` deliberately owns
no `useRafLoop` of its own: it returns an `update(delta, amount)` that
`HeroPortrait` calls from the loop it already runs, so the layer's transform and
its mask are written on the same frame. Tuning lives in
`sections/Hero/helmetReveal.ts`.

The reveal itself is two photographs of the same frame — Yavuz bare-headed, and
the identical pose helmeted — stacked in the same box, with the top one masked
down to a soft-edged circle. Because both photos are the same 1323x1189 crop,
alignment is a layout fact rather than a per-frame calculation; the effect never
does more than move a gradient. The bodies below the neck do not quite match,
so a second, static mask — the region above the neck line, drawn in the photos'
own coordinates in `sections/Hero/helmetRegion.ts` — sits on the helmet image
inside the circle, and the helmet never shows below the chin bar. That is what replaced an earlier build that
fitted a separate helmet cut-out onto the head with trigonometry every frame.

Every wrapper checks `usePrefersReducedMotion()` and degrades to a static,
visible state. On a site this animation-heavy the opt-out is a requirement, not
a nicety.

### The nav chrome

`sections/Nav/Nav.tsx` owns everything that navigates, inside one
`<nav aria-label="Ana menü">`, and runs the page's one scroll-spy
(`useActiveSection`), handing the result to every list that highlights it.

- **Over the hero**, the top bar (wordmark + a 44 × 44 hamburger) and, on
  desktop, the PAGES / FOLLOW ON columns. On desktop all of it is `absolute`
  and scrolls away with the hero, as the design has it.
- **On mobile** the top bar is `fixed`. Once the page leaves its very top a
  surface fades in under it — `bg-bg/85` with a backdrop blur and a hairline —
  so the wordmark always reads on the bar's own background rather than on the
  copy, photos and counters scrolling under it.
- **On desktop past the hero**, `DesktopBar.tsx`: a fixed 64px bar with the
  wordmark, the four `NAV_ITEMS` (folded into the hamburger below `lg`, where
  they do not fit) and the red Business Enquiries CTA. It is shown by
  `useSectionPassed('hero', 64)` in `useNavChrome.ts` — an
  IntersectionObserver on the hero with the bar's height taken off the top of
  its root — so it arrives as the hero's own CTA leaves. While hidden it is
  `inert` and, once it has slid away, `visibility: hidden`: nothing in it can
  take focus. Its 40px side padding clears the lap rail by 16px, and the
  rail's readout sits over the bar's right end, above its hairline.
- **The overlay menu** (`MobileMenu.tsx`) is a real modal — focus trap,
  Escape, focus returned on close — and carries the CTA too, which is the only
  place a phone offers it before Contact. Its list is centred with `my-auto` in
  a scrolling dialog, so a phone on its side can still reach every link.

Stacking: nav chrome 30, scroll rail 40, overlay menu 50, skip link 60. Both
bars slide or fade over `DURATION.base`, and switch instantly under
`prefers-reduced-motion`.

### The scroll rail

The native page scrollbar is hidden in `globals.css` (`scrollbar-width: none`
on `html`, plus `html::-webkit-scrollbar` for older Safari); the document is
still the scroller, so wheel, keys, touch and anchor links are untouched.
`sections/Nav/ScrollRail.tsx`, rendered by `Nav` outside its landmark, draws
the replacement. With a mouse at `md` and up it is a lap rail on the right
edge: a hairline track, a cyan fill down to a car-dot head, a notch at each
section start that lights once passed, and a `04 / 09` readout at the top.
Dragging it scrubs the page (`scrollTo` with `behavior: 'instant'`, under
pointer capture); a click jumps, snapping to a notch within 8px, and a plate
previews the section it will land in. Notch positions are measured from the
DOM — each section's document top over the scroll range — and re-measured by a
`ResizeObserver` on `<body>` plus window resize, so the pinned sections are
drawn at their real length. `useScroll().scrollY` drives the head through a
critically damped spring set with `animate()`, bypassed while dragging; the
fill, head and lit notches are motion values, and React re-renders only when
the current section, the plate's target or the geometry changes. Under
`prefers-reduced-motion` the head maps to scroll directly and clicks jump
without gliding. Below `md`, or on a touch screen of any width, it is a
two-pixel `pointer-events-none` progress line instead. It is `aria-hidden` and
unfocusable throughout: a pointer affordance duplicating native scrolling, not
a widget. The geometry is pure and tested in `railGeometry.ts`.

### One caveat worth knowing

Tailwind v4 compiles `-translate-x-1/2` to the standalone `translate` CSS
property, which **composes with** `transform` instead of being overridden by
it. Setting both — a Tailwind translate class and an inline
`transform: translate(-50%, 0)` — shifts the element a full width instead of
half. Anything positioned imperatively must own its transform completely and
must not also carry Tailwind translate utilities.

## Testing

Vitest + jsdom, with Testing Library available. The track-records module has
the most: its maths (lap-time formatting and parsing, dash geometry, sector
fill, the start line), a data-integrity suite asserting every circuit path is a
single closed subpath with a unique id, and component and hook tests that drive
the picker, the transport and the lap loop the way a visitor would. Beside it: the nav's scroll-spy, the scroll
rail's geometry (notch placement, pointer mapping, snapping), the nav chrome
(when the desktop bar counts the hero as passed, that it is inert until then,
and the menu's CTA), `Picture`'s derived sources and hidden `<source>`
elements, the hero's helmet region, and `docs/assets/encode-images.test.mjs`, which runs
`pnpm images --check` so that an original with missing, stale or wrongly sized
encodes fails the suite. That one is plain `.mjs` outside `src/` on purpose —
it reads the file system, and the app's TypeScript program has no Node types.

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
order: lint, format check, typecheck, **test**, the circuit outlines' `--check`,
build. The test step was missing
for a long time, so the suite only ever ran on contributors' machines — if it
disappears again, the suite stops being enforced by anything. A second job
checks out the full history and runs gitleaks over each run's new commits —
a pull request's commit range, or what a push brought in. It needs
`pull-requests: read` to list a PR's commits, and without that permission it fails with a 403 that says
nothing about whether a secret is present.

`workflow_dispatch` is enabled, so a run can be requested for any ref when an
automatic one does not report.
