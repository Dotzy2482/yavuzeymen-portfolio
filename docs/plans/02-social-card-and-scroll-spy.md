# 02 — Social card and nav scroll-spy

## Goal

Two visible gaps that need no input from anyone.

A shared link currently renders as title + description with no image:
`index.html` deliberately omits `og:image` because no correctly-shaped asset
exists, which forces `twitter:card` down to `summary`. `apple-touch-icon.png` is
missing too, and that one cannot be an SVG.

And the nav does not highlight the active section — while both
`src/app/App.tsx` and `src/lib/constants.ts` carry comments asserting that it
does. Either the behaviour arrives or the comments go; this plan brings the
behaviour.

## Prerequisites

None. Independent of `01`.

## Reasoning

### The social image can be built from the site, not waited on

`docs/ROADMAP.md` files this under "wants a dedicated 1200x630 asset and none of
the existing photography is that shape". True of the photography — but the site
has a complete visual system of its own: the wordmark, Signal Cyan, the helmet
cutout, a circuit outline, Track Black. Composing those at 1200×630 is a design
job the repo already has the vocabulary for, and it needs nothing from Yavuz.

**Author it as a static page under `docs/assets/`, then rasterise it.** That
keeps the source editable and versioned rather than shipping an opaque PNG whose
origin nobody can reconstruct — the same reasoning that puts
`helmet-wireframe.svg` next to its generator.

Two routes to the raster:

- **Browser pane screenshot at 1200×630.** No dependency. This is the route to
  take if this workstream lands before `03`.
- **`sharp`, one line.** Available only once `03` has added it as a
  devDependency. Cleaner and repeatable, so prefer it if `03` is already in.

**The source must be fully static** — no `requestAnimationFrame`, no
`ResizeObserver`-driven layout. The Browser pane does not fire frame callbacks
unless the pane is actually displayed, so anything animated screenshots in its
pre-animation state. Compose with plain CSS and inline SVG and this cannot bite.

`apple-touch-icon.png` at 180×180 comes from the same pass, off
`public/favicon.svg`.

### The nav's four items are a curated, out-of-order subset

This is the wrinkle that makes scroll-spy non-trivial here, and it is not
visible without reading `src/lib/constants.ts`.

`SECTION_IDS` lists ten sections in document order. `NAV_ITEMS` lists **four**,
and not in that order: Home, On Track, Sim to Real, Career — whereas the
document runs hero, about, career, achievements, track-records, sim-to-real,
content, setup, partners, contact. So Career is second in the document and
fourth in the nav.

Two consequences the implementation must decide, not stumble into:

1. **Six of ten sections have no nav entry.** Scrolling through About,
   Achievements, Content, Setup, Partners or Contact leaves no item to light.
   Highlighting the nearest preceding nav-listed section would light "Career"
   while the reader is in Achievements and "Sim to Real" while they are in
   Contact — confidently wrong. **Highlight only on an exact match, and show
   nothing in between.** An honest gap beats a misleading highlight, and it also
   keeps the indicator meaningful when it is present.
2. **Do not reorder `NAV_ITEMS` to match the document.** The doc comment says
   the four are curated by design. Order is a design decision; the spy adapts to
   it, not the other way round.

### Use `useInView`, not a scroll listener

`src/hooks/useInView.ts` already wraps `IntersectionObserver` and is used by
Career and the track-records loop gate. A scroll handler recomputing offsets is
the thing it exists to avoid.

The active section is derived state that changes a handful of times per page,
not per frame — so unlike everything in `01`, this one **is** allowed to be
React state. The per-frame rule in `docs/ARCHITECTURE.md` is about values that
change every frame; this is not one.

Watch for the ambiguity when two observed sections are on screen at once: pick
the one nearest the top of the viewport and make that rule explicit in the code,
rather than letting observer callback order decide.

### The comments are the acceptance criterion

Both `src/app/App.tsx` and `src/lib/constants.ts` claim the nav highlights
against section order. Once the behaviour exists the comments become true — but
check them word by word against what was actually built, and correct the wording
if the highlight ended up narrower than they imply (it will: exact match only).

## Steps

### 1. Compose the social card

New: `docs/assets/og-card.html` (or `.svg`) — 1200×630, static, built from
`src/styles/tokens.css` values and the existing wordmark, helmet and circuit
vocabulary. It is a source asset, so it lives beside the other source assets and
is never imported or bundled.

### 2. Rasterise

Produce `public/og-image.png` at 1200×630 and `public/apple-touch-icon.png` at
180×180. Record the command used in a comment at the top of the source file, so
the next person regenerates rather than guesses.

### 3. Wire the head

`index.html`: add `og:image` (with `og:image:width`, `og:image:height` and
`og:image:alt`), upgrade `twitter:card` to `summary_large_image`, add
`twitter:title` / `twitter:description` / `twitter:image`, and add the
`apple-touch-icon` link. Replace the existing inline comment explaining the
absence with one naming the source file.

`og:url` and a canonical link stay absent until a final domain exists — that
part of the comment is still true.

While here: the `description` meta is English inside a `lang="tr"` document.
Worth a look, but changing it is a copy decision — flag it, do not silently
rewrite it.

### 4. Scroll-spy

`src/sections/Nav/Nav.tsx`, and `src/sections/Nav/MobileMenu.tsx` if the same
indicator belongs there.

Observe the four `NAV_ITEMS` targets, hold the active id in state, and mark the
matching link — cyan, matching the site's existing active-state language, plus
`aria-current="location"` so the state is not colour-only.

### 5. Reconcile the comments

`src/app/App.tsx` and `src/lib/constants.ts` — make the wording match what was
built.

## Done when

- `pnpm build && pnpm lint && pnpm test && pnpm format:check` all pass, with the
  real output reported.
- `public/og-image.png` is exactly 1200×630 and `public/apple-touch-icon.png`
  exactly 180×180.
- The card previews correctly in a validator (Facebook Sharing Debugger, or any
  local OG preview tool) against a built `dist/`.
- Scrolling the page lights exactly one nav item when a nav-listed section is in
  view, and none when it is not — verified for all four, in both directions.
- The active item carries `aria-current`, not just a colour.
- The comments in `App.tsx` and `constants.ts` describe the behaviour that now
  exists.

## Out of scope

- `og:url` and a canonical link — they need a final domain.
- A `site.webmanifest`, `robots.txt`, or JSON-LD `Person` data. Reasonable next
  steps, but each is its own decision.
- Rewriting the English `description` meta.
- Reordering or extending `NAV_ITEMS`.
- Any change to section 01–09 layout.

## Progress

- [ ] 1. `docs/assets/og-card.*` composed
- [ ] 2. `public/og-image.png` + `public/apple-touch-icon.png` rasterised
- [ ] 3. `index.html` head wired
- [ ] 4. Scroll-spy in `Nav.tsx`
- [ ] 5. Comments in `App.tsx` and `constants.ts` reconciled
- [ ] 6. Card validated against a built `dist/`
