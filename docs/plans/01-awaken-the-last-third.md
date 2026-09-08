# 01 — Awaken the last third

## Goal

The page dies after Sim to Real. Hero, Career, Track Records, Sim to Real and
Content are all richly animated; sections 07 Setup, 08 Partners and 09 Contact
have no motion at all, and the transition out of the pinned gallery into Setup
is a hard stop. This workstream gives the last third a scroll language of its
own, built from a device the site is already paying for and not using: Archivo's
variable width axis.

It also converts Setup's five placeholder rows from dim grey text into the
dashed-slot vocabulary the site already uses twice, so the gap reads as
deliberate rather than unfinished.

## Prerequisites

None.

## Reasoning

### The width axis is already downloaded

`index.html` requests `Archivo:wdth,wght@62..125,100..900`. The site uses three
points on that continuous axis — `--stretch-ui` 115%, `--stretch-wide` 120%,
`--stretch-display` 125%. Scrub-linking the axis to scroll therefore costs
**zero new bytes and zero new dependencies**: the font file is already on the
page. That is the argument for the device, and it should lead its doc comment.

### Why this is not an entrance reveal

`src/components/motion/index.ts` records that `Reveal`, `Stagger` and
`ParallaxLayer` were built and deleted, because the design's scroll language is
scrub-linked rather than time-based. Every treatment below holds to the test
that follows from it: **is the rendered value a pure function of scroll
position, and does it run backwards on scroll-up?** `Career.tsx` is the
reference implementation — `useScroll` on a container ref, `useTransform` to a
size, and `useInView({ once: false })` so scrolling back up genuinely reverses
the state.

A related property makes this device unusually safe against the "content must
never be left invisible" rule: at **every** point in its range the text is fully
rendered and legible. The worst failure is condensed type, not absent type.
Nothing here starts at `opacity: 0`.

### Reduced motion resolves to today's design

At `wdth: 125` the static fallback is exactly what the site looks like now. The
reduced-motion path is not a degraded version of the effect — it is the current
design, unchanged. Same for every scrub below: full underline, dashes at offset
0, finish line at 100% width.

### `font-variation-settings` inherits, and beats `font-stretch`

Two consequences that decide the architecture:

- It **inherits**, so setting it on `SectionHeading`'s outer `div` would also
  hit the mono meta label and the lead paragraph. Publish a CSS **custom
  property** on the wrapper instead — a variable on an ancestor is inert until
  something reads it — and put the utility that reads it on exactly one element.
- It **overrides `font-stretch`** for the axes it names. So `stretch-display`
  and the new scrub utility cannot both sit on an element and produce a
  predictable result. One wins by design, not by accident: swap the class, never
  stack it.

Do the interpolation in **JS**, not `calc()` inside `font-variation-settings`.
The `calc()` form is more token-native and has a pleasant failure mode, but it
is exactly the sort of thing that works in three engines and not the fourth.
Note it in the doc comment as the alternative; do not ship it.

### Why no `ScrubFill` primitive

Three call sites want "a bar whose extent tracks scroll", which normally earns
an abstraction. They want it three different ways: Career must animate `height`
because `shadow-glow-line` distorts under a transform, Setup's underline is
happiest on `scaleX`, and Contact's finish line wants `width` for the same glow
reason. Parameterising over that is more code than the single `useTransform` it
would replace — and this repo has already deleted three primitives for exactly
that reason. **One `useTransform` per call site, no new shared file.**

`StretchScrub` earns its file by the opposite test: three call sites, and
non-obvious handling of the axis units, the custom property and reduced motion
that would otherwise be re-derived at each one.

### Setup's placeholder should join the vocabulary the site already has

The five rows read `MODEL — YER TUTUCU` at `--text-tertiary`. Dim grey text
reads as forgotten, because that is what dim grey text means.

The site already has a deliberate empty-slot language, used twice: Partners'
`border-dashed` "Your brand here" cells, and Sim to Real's dashed karting slot.
Setup is the third empty thing on the page and the only one not speaking it.
Moving it into that language turns "we forgot to fill this in" into "this slot
is reserved" — the read the other two already get, using an existing token
(`--border-dashed`) and no new copy.

Confirmed with the user: **no real hardware list is coming in the near term**,
which raises the value of making the gap look intentional.

The row must still render correctly in both states, because ROADMAP's plan is to
flip `placeholder` to `false` one row at a time. Size the dashed slot to roughly
the width a real model name will occupy so filling a row does not jolt the
layout.

**Do not invent a status word.** `MODEL — YER TUTUCU` stays as it is in
`data/setup.ts`; changing presentation is not inventing a value, but adding copy
would be. Note also that row labels are English (`STEERING WHEEL`) while the
placeholder string is Turkish, so any new word would have to pick a side. The
dashed slot says it without text.

### The Tailwind v4 transform trap applies here

`-translate-x-1/2` and friends compile to the standalone `translate` property,
which **composes with** `transform` rather than overriding it. Any element whose
transform is driven by motion must carry no translate or scale utility.
`origin-left` is `transform-origin` and is safe. Put a comment on each such
element saying so.

### Verified against the installed packages

- `motion` v13 applies `MotionValue`s bound to CSS custom properties via
  `element.style.setProperty` on its own frame loop — no React re-render. So
  binding a motion value to `--axis-wdth` in a `style` prop is the correct
  mechanism.
- TypeScript needs one cast: `@types/react`'s `CSSProperties` has no index
  signature, so the style object literal needs `as MotionStyle` — the named type
  imported from `motion/react`, never `any`.

Both should be re-confirmed by the build passing rather than trusted on sight.

## Steps

### 1. Axis tokens

`src/styles/tokens.css`, next to the existing `--stretch-*` block.

`font-stretch` takes `125%`; `font-variation-settings` takes `125`. The two
syntaxes cannot share a token, so add the raw axis numbers alongside, with a
comment saying why the duplication is real and not an oversight.

Add `--axis-wdth-entry`, `--axis-wdth-display`, `--axis-wght-display`, plus the
live `--axis-wdth` / `--axis-wght` channel defaulting to the display values — so
the utility is correct with no wrapper above it at all.

Use **88**, not 62, for the entry value. At 72px uppercase black, `wdth: 62`
stops reading as stretched Archivo and starts reading as a different typeface.
88 to 125 is a ~30% swing, which is plenty.

### 2. The `stretch-scrub` utility

`src/styles/globals.css`, beside the existing `stretch-ui` / `stretch-wide` /
`stretch-display` block. Reads the two live channel variables through
`font-variation-settings`. No `@theme inline` entry — the existing `stretch-*`
utilities are not theme values either.

### 3. `StretchScrub`

New: `src/components/motion/StretchScrub.tsx`. Exported from
`src/components/motion/index.ts`.

Props: `children`, `from`, `to`, `offset`, `className`. Internals are
`useScroll({ target: ref, offset })` then `useTransform`, on a `motion.div` that
publishes `--axis-wdth`. Under `usePrefersReducedMotion()` it renders a plain
`div` and never subscribes to scroll.

**Quantise the transform** — round to integer axis units. Integer steps are
visually indistinguishable at these sizes and collapse ~60 distinct values into
~37, which lets the browser skip style recalc on repeats. This matters because
changing `wdth` is a **reflow**, not a compositor-only property: advance widths
change, so the heading re-lays out and `SectionHeading`'s flex row re-solves
every frame.

That reflow is acceptable here — the subtree is four flex children and one text
run, and the hairline visibly shortening as the type widens is _the effect_, not
a side-effect. Two rules keep it that way: never stack a letter-spacing scrub on
the same element, and give the hairline `span` a `min-w-*` floor so a short
mobile heading cannot crush it to zero and snap.

Extend the barrel's existing doc comment to say why this primitive earns its
place where the three deleted ones did not.

### 4. `SectionHeading` gains a `stretch` prop

`src/components/ui/SectionHeading.tsx`: `stretch?: 'display' | 'scrub'`,
defaulting to `'display'`, swapping one class on the `Tag`. No motion import, no
scroll knowledge — the ui primitive stays presentational.

While there, add `[font-variation-settings:normal]` to the serif `em` accent.
Instrument Serif is static and ignores the axes today, so this is belt and
braces against a future variable serif inheriting a `wdth` meant for Archivo.

This is a public API change to a ui primitive; call it out in the commit.

### 5. Setup (07)

`src/sections/Setup/Setup.tsx`, plus a new `src/sections/Setup/SpecRow.tsx` (a
new file inside an existing directory).

- `SpecRow` renders the dashed slot when `item.placeholder`, and today's plain
  value when it is `false`. Reuses `MonoLabel` and `--border-dashed`.
- One `useScroll` on the rows container in `Setup.tsx`; each row derives its own
  0–1 window with `useTransform(p, [i / n, (i + 1) / n], [0, 1])` and drives a
  cyan overlay on its existing `border-b` hairline. This is Career's sequential
  fill rotated 90° — vocabulary reuse, not invention.
- Reduced motion: every row's scale is 1, statically.
- Apply `stretch="scrub"` to this section's `SectionHeading`.

Leave the rig photo alone. Any scrubbed crop or parallax on it re-introduces the
deleted `ParallaxLayer` in spirit.

### 6. Partners (08)

`src/sections/Partners/Partners.tsx`, plus a new
`src/sections/Partners/OpenSlot.tsx`.

The two dashed cells are the only **pitch** on the page and currently the
stillest element in the section. Replace the CSS `border-dashed` with an
absolutely-positioned inline `svg` `rect` whose `strokeDashoffset` is
scrub-linked to the grid's scroll progress, so the dashes crawl. It reads as
track marking. Use `vector-effect="non-scaling-stroke"` and
`stroke="var(--border-dashed)"`, and keep the existing hover-to-cyan by swapping
the stroke on `group-hover`.

Reduced motion: a fixed offset of 0 — a static dashed outline, i.e. today.

Apply `stretch="scrub"` to this section's `SectionHeading`.

### 7. Contact (09)

`src/sections/Contact/Contact.tsx` only.

- The `h2` does not go through `SectionHeading` (there is a comment saying so
  deliberately), so wrap it in `StretchScrub` and swap `stretch-display` for
  `stretch-scrub` directly. 140px of Archivo Black widening as the visitor
  reaches the end of the page is the payoff that justifies building the device.
- Overlay a cyan `motion.div` on the `footer`'s existing
  `border-t border-hairline-mid`, its `width` tracking scroll through the
  section, so the page's last rule draws itself. This mirrors Career's vertical
  fill horizontally — the page opens and closes on the same gesture. Animate
  `width`, not `scaleX`, so `shadow-glow-line` does not distort.

**The gotcha:** `useScroll` ranges on the last element of the document go
degenerate easily. This section is `min-h-[92vh] md:min-h-screen`, so roughly
one viewport; `['start start', 'end end']` gives almost no travel and on a short
viewport can collapse to zero, leaving the fill stuck at 0 forever. Use
`['start end', 'end end']` and **verify at 1280×720 and at 390×844**, with and
without the mobile URL bar. This is the one place in this workstream where
getting it wrong leaves something visibly broken rather than merely static.

## Done when

- `pnpm build && pnpm lint && pnpm test && pnpm format:check` all pass, with the
  real output reported.
- Sections 07, 08 and 09 each respond to scroll, and each response reverses when
  scrolling back up.
- With `prefers-reduced-motion: reduce` forced on, all three sections render
  their full static state and the page is indistinguishable from today.
- Setup's five rows render as dashed slots; flipping any one row's `placeholder`
  to `false` in `src/data/setup.ts` renders a normal value with no layout shift.
  (Flip it back — the placeholder stays.)
- The Contact finish line reaches full width at the bottom of the page at both
  1280×720 and 390×844.
- No element driven by motion carries a Tailwind translate or scale utility.
- `src/data/setup.ts` is unchanged.

## Out of scope

- Any new copy or status word in Setup.
- Motion on About (01) or Achievements (03) — this workstream is the last third.
- Applying `stretch="scrub"` to sections 01–06. Applied everywhere it stops
  being a device and becomes a tic; three call sites is the point.
- The rig photo, the logo images, the footer's `href="#"` legal links.

## Progress

- [x] 1. Axis tokens in `tokens.css`
- [x] 2. `stretch-scrub` utility in `globals.css`
- [x] 3. `StretchScrub` primitive + barrel export
- [x] 4. `SectionHeading` `stretch` prop
- [x] 5. Setup: `SpecRow`, dashed placeholder, row scrub
- [x] 6. Partners: `OpenSlot` crawling dashes
- [x] 7. Contact: width scrub + finish line
- [x] 8. Verified at both viewports, and with reduced motion forced

Verified in the browser at 1280×720 and at 390×844 (a same-origin iframe;
the pane's own device emulation pins the viewport width). All three scrubs
run forwards and reverse on scroll-up at both sizes, the Contact finish line
reaches 100% of the footer rule at both, and it still does when the viewport
height changes mid-page (844 → 760 → 844, the mobile URL bar). With
`prefers-reduced-motion: reduce` forced, `StretchScrub` renders a plain div
and publishes no axis, all three headings sit at `wdth 125`, every Setup row
is at scale 1, the dashes are at offset 0 and the finish line is full width.

One measurement worth recording: at 390 the page has pre-existing horizontal
overflow (`ACHIEVEMENTS` at 32px, and the track-list flag chips), which on a
classic scrollbar steals 15px of viewport height and leaves the finish line
at 98%. Overlay scrollbars — every phone — are unaffected, and nothing in
this workstream contributes to that overflow. It belongs to whoever fixes
the 01–06 sections.
