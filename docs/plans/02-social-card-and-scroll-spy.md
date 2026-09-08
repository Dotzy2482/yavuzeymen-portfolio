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

- [x] 1. `docs/assets/og-card.*` composed
- [x] 2. `public/og-image.png` + `public/apple-touch-icon.png` rasterised
- [x] 3. `index.html` head wired
- [x] 4. Scroll-spy in `Nav.tsx`
- [x] 5. Comments in `App.tsx` and `constants.ts` reconciled
- [x] 6. Card validated against a built `dist/`

### What the steps turned into

**A generator, not a recorded command.** Step 2 asked for the command in a
comment. It became `docs/assets/generate-og-images.mjs`, because the repo
already has that shape in `generate-helmet-wireframe.mjs` and a script can be
run where a comment can only be read. It writes both PNGs and takes `--check`,
which asserts they exist and carry exactly the dimensions `index.html`
advertises. `--check` deliberately does **not** compare bytes: a screenshot is
not reproducible across Chrome versions or font-cache states, so byte equality
would fail on machines where nothing is wrong. It is not wired into CI, because
the helmet generator's `--check` is not either.

Headless Chrome, per the plan's first route — `sharp` is still `03`'s to add.
Two flags earned their place the hard way: `--disable-lcd-text`, because
subpixel antialiasing bakes red/blue fringes into a raster that feeds then
rescale, and `--force-device-scale-factor=1`, because a HiDPI machine otherwise
silently doubles every dimension.

**`og:image` is root-relative.** Absolute is preferable and impossible: there is
no domain. Every major crawler resolves it against the page URL, so it works
today, and it should become absolute at the same moment `og:url` and a canonical
link arrive — which is the same wait.

**The English head is flagged, not fixed**, as the plan asked. The note is in
[CONTENT.md](../CONTENT.md#the-document-head-is-english-in-a-langtr-document):
which language a shared link speaks is a positioning decision about who the site
is shared _with_, and it belongs to Yavuz.

**The spy is its own hook, not `useInView`.** `useInView` reports "in view"
immediately under `prefers-reduced-motion` — right for a reveal that must not
hide content, and wrong here, where it would light all four items at once.
Where the page is in itself is navigation state, not decoration.

`useActiveSection` observes a **band across the middle 10% of the viewport**
rather than the whole of it. That is what actually delivers the plan's "show
nothing in between": watching the whole viewport would light Career while the
reader is in Achievements, on the strength of a sliver of Career still showing
at the top.

The band is a **filter, not the answer**. It narrows the candidates to at most
two; which one is decided by measuring them against the viewport's centre line
at the moment the decision is taken. Nearest wins, ties going to the one nearer
the top of the viewport — the plan's own rule for the ambiguity it anticipated,
and geometry rather than observer callback order, which is what that step was
really asking for.

The measurement has to be **fresh**. `entry.boundingClientRect` is where a
section was when _it_ entered the band, and two sections enter at different
scroll positions, so comparing two stored rects compares two different moments.
Measuring at decision time costs one `getBoundingClientRect` per candidate on
intersection changes only — a handful of times per page, never per frame.

Eleven tests cover it, driven through an IntersectionObserver fake faithful
enough to honour `rootMargin`, to report only _changed_ entries, and to answer
`getBoundingClientRect` from the same layout it computes intersections from, so
the two things the hook consults can never disagree. The tests read as scroll
positions rather than observer payloads. The global stubs in `test/setup.ts`
had to be made `configurable` before a test file could replace one.

### Verified

Headless Chrome over CDP, against a built `dist/` served by `pnpm preview` —
the preview pane fires no frame callbacks while it is off screen, so every
IntersectionObserver reading there stays frozen at its initial state. Run once
before the review and again after the tie-break rework; the figures below are
the second run.

A 45-step walk down the page and back up, at **1280×720** and **390×844**, each
with and without `prefers-reduced-motion: reduce` (which is not the same page:
the pins collapse, and the document goes from 10108px to 9202px at 1280). At
every step, the lit item was checked against an independently computed answer —
which sections actually cross the middle band — rather than against the hook.

|                                        | 1280×720      | 390×844       |
| -------------------------------------- | ------------- | ------------- |
| all four lit, scrolling down           | yes           | yes           |
| all four lit, scrolling up             | yes           | yes           |
| more than one lit at once              | never         | never         |
| lit item not in the band               | never         | never         |
| nav section in the band, nothing lit   | never         | never         |
| `aria-current` and cyan disagreeing    | never         | never         |
| dark through the six unlisted sections | 23/45 samples | 22/45 samples |
| horizontal overflow                    | none          | none          |

The overlay menu was checked separately, since it is the only place the
highlight stays visible once the hero has scrolled away: at each of the four
sections, open the menu and read `aria-current` and the computed colour off its
links. Four for four, at 390×844 and at 1280×720, with and without reduced
motion.

Both card assets were validated the way a crawler validates them: fetch the
served page, parse the head, resolve `og:image` and `apple-touch-icon` against
the page URL, fetch each, and read the dimensions back out of the PNG's IHDR
chunk. 1200×630 and 180×180, `image/png`, `summary_large_image`, and
`og:image:width`/`height` agreeing with the raster.

Two harness bugs surfaced first and are worth recording, because both would
have been reported as site bugs. `globals.css` sets `scroll-behavior: smooth`,
so a plain `window.scrollTo(0, y)` _animates_ — the walk never reached the lower
half of the page, and Track Records and Sim to Real looked like they never lit.
`behavior: 'instant'` is mandatory. And the nav's colour transition is 250ms, so
a computed colour read sooner than that is read mid-fade.

### What the review changed

Reviewed on two axes — against `CLAUDE.md`, and against this plan. Both found
real things.

**The tie-break was accidentally right.** It ranked candidates by
`Math.abs(top)` on rects captured whenever each section had entered the band:
stale data, ranked by a sign-dependent rule. It produced the right answer only
because every section on this page is far taller than the band — an assumption
the code asserted in prose and never enforced. Replaced with the fresh, signed
measurement above.

**Reworking it broke the page, and the browser caught it.** The first rewrite
required a candidate to _contain_ the centre line, which reads better and is
wrong: entering the band and reaching the centre are different moments, and
only the first produces a callback. Scrolling back up, Career's bottom edge
dips into the band while Achievements — unlisted, so unobserved — still holds
the centre. Nothing then changes state, no callback arrives, and Career never
lights for the whole of the rest of the way up. Eleven unit tests passed
through this; the scroll walk failed on the up pass at both viewports. That is
the argument for walking the real page in both directions rather than only
down. `lights a section entering the band before it reaches the centre` now
pins it.

**`CLAUDE.md` was stale and is corrected.** Its "Known placeholders" table still
promised the missing `og:image`; that row now records what is actually still
outstanding, which is `og:url` and a canonical link. Both new PNGs are named in
the "Do not" list beside the other generated artefacts, with their regeneration
command.

Two findings were **declined**, with reasons. The active-link decoration is
duplicated between `Nav.tsx` and `MobileMenu.tsx` — two lines and a comment.
Sharing them means a component parameterised over class name, click handler and
item, which is more code than it removes; this repo has already deleted four
primitives on exactly that test, and `01`'s reasoning states it. And the
homegrown card validator stays: the plan offers "Facebook Sharing Debugger, or
any local OG preview tool", and the Debugger needs a public URL that does not
exist yet. What ships does what a crawler does — fetch the page, parse the head,
resolve each asset against the page URL, fetch it, and read the dimensions back
out of the PNG's own IHDR chunk.

### Beyond the letter of the plan

Three additions, all small, none changing what the plan asked for.
`og:image:type` and `twitter:image:alt` sit alongside the tags step 3
enumerates — the first saves a crawler a fetch, the second is the same
not-colour-alone reasoning as `aria-current`. And `.claude/launch.json` gains a
`preview` entry, because "validated against a built `dist/`" needs the built
`dist/` served, and nothing in the repo served it.

### One thing the plan did not anticipate

**On desktop the PAGES column scrolls away with the hero.** It is
`absolute top-[50vh]`, which `Nav.tsx` documents as deliberate — the chrome
belongs to the hero. Measured: at Track Records the column sits at y=-3582.

So the desktop side-column highlight is only ever visible in the first
viewport, where it can only ever read "Home". The indicator that actually pays
for itself on every viewport is the one in the overlay menu — which is reachable
on desktop too, since the hamburger is the only way in there.

Nothing was changed about this. Making the column sticky is a layout decision
about the hero's chrome, not a scroll-spy decision, and this plan puts
"any change to section 01–09 layout" out of scope. Recorded here so the choice
is made deliberately rather than discovered again.
