# 03 — Weight and wiring

## Goal

Three performance items `docs/ROADMAP.md` files under "Later", plus the small
corrections found while auditing the codebase. None of them changes how the site
looks; all of them change what it costs or what it claims.

`04` depends on this landing first, for two reasons named below.

## Prerequisites

None. But **`04` must not start until this is done.**

## Reasoning

### Why `04` waits on this

Two hard links, both worth stating so nobody reorders them:

1. **Real circuit geometry adds ~36 kB of path data** (12 circuits × ~250
   points) to the track-records chunk, against ~5 kB today. That chunk is
   already the heaviest part of the bundle and sits below the fold. Lazy-loading
   it after the data grows means shipping the regression first and fixing it
   second; doing it here means `04` lands on a chunk that is already deferred.
2. **Mount Panorama's region is settled here**, so `04` never has to touch
   `TrackRegion`. Bundling a region change with a full data replacement doubles
   the review surface of the riskiest workstream.

### The encode step needs a dependency, and that is the decision

`docs/ROADMAP.md` is explicit that the image pipeline "needs an encode step and
therefore a dependency" — this repo has three runtime dependencies and treats
adding one as a cost worth naming.

The cost is acceptable here because it is a **devDependency**: `sharp` runs at
author time, emits files into `public/`, and ships nothing to the browser. The
runtime dependency count stays at three. Make that argument in the commit
message, because "we added a dependency" is otherwise the kind of thing that
gets challenged later with no record of why.

**The output pattern already exists.** `tch.avif` + `tch.png` behind a
`<picture>` in `src/data/partners.ts` is the established shape — the pipeline
generalises it rather than inventing anything.

### Two constraints on the encode that are easy to miss

- **`portrait-cutout.png`'s dimensions are load-bearing.** `docs/CONTENT.md`
  records that the hero helmet-fit maths depends on exactly 1323×1189. Re-encode
  it, never resize it. Same discipline everywhere: every raster declares
  intrinsic `width`/`height`, and the hero marquee and the Sim to Real gallery
  both measure from those.
- **`portrait-cutout.png` needs alpha; `fiat-front.png` does not.**
  `fiat-front.png` is a 1.1 MB photograph stored as PNG for no reason and is the
  single biggest easy win. The portrait is PNG legitimately — AVIF/WebP with
  alpha is the win there, not JPEG.

### Fonts: three render-blocking families

`index.html` loads Archivo (variable, two axes), Instrument Serif and Martian
Mono from Google Fonts in one blocking stylesheet, with `preconnect` but no
`preload` and no subsetting. That is the largest single lever on first paint.

Self-hosting also removes a third-party request from a site that otherwise makes
none, which is worth something on a page whose ROADMAP says analytics would be
"privacy-preserving and cookieless, or not at all".

**Keep the full `wdth` axis range when subsetting.** `01` builds a scroll device
on `wdth 62..125`; a subset that narrows the axis would silently clamp it. If
`01` has already landed, verify the effect still works after this change — this
is the one cross-workstream interaction in the plan.

### The small corrections are corrections, not features

Each is something the repo currently gets wrong or claims falsely:

- **Mount Panorama is filed under `ASIA`.** Australia is Oceania. The counts, as
  measured: 5 EUROPE, 5 AMERICA, 2 ASIA — so moving Mount Panorama out leaves
  Asia with exactly one circuit, which is the trade-off ROADMAP names. Three
  ways out: introduce `OCEANIA`, rename the tab to something the circuit
  honestly fits, or leave it and drop the claim. Whichever, `svgPath.test.ts`
  line 93 asserts the exact region set
  (`new Set(['EUROPE', 'AMERICA', 'ASIA'])`), and `TrackRegion`, `TRACK_REGIONS`
  and the tab row all have to agree with it.
- **`Divider`'s `animated` prop is never passed anywhere.** It is a whole
  `whileInView` branch of dead code — and an entrance reveal, which is the
  language the repo deliberately removed. Delete the prop and the branch.
- **`DURATION` in `src/lib/constants.ts` disagrees with the `--duration-*`
  tokens** in `src/styles/tokens.css` (0.15/0.32/0.7 against 150/250/400ms).
  There is a `TODO: reconcile` on it. Pick one source of truth and make the
  other reference it.

## Steps

### 1. Lazy-load the track-records chunk

`src/app/App.tsx` — there is already a `TODO` on this at the top of the file.
`React.lazy` + `Suspense`, with a fallback that reserves the section's height so
nothing below it jumps. Remove the TODO once done.

**Baseline, measured 2026-09-08:** one JS chunk,
`dist/assets/index-*.js` at 464.61 kB (156.21 kB gzip), plus 37.51 kB of CSS
(8.19 kB gzip). 514 modules. Record the after numbers against these.

### 2. Image pipeline

Add `sharp` as a devDependency and a `pnpm images` script. Emit AVIF + WebP
beside each existing raster, keeping the originals as the `<picture>` fallback.
Update `src/data/partners.ts`, `src/data/simToReal.ts` and the sections that
render images directly, following the existing `tch` pattern.

Re-encode at native dimensions only. Record the before/after total.

### 3. Self-host the fonts

Move the three families into `public/fonts/`, replace the Google Fonts
stylesheet with local `@font-face` declarations, and `preload` the faces that
render above the fold. Keep `font-display: swap`. Keep the full `wdth 62..125`
axis range.

### 4. Small corrections

- Mount Panorama's region, in `src/features/track-records/data/tracks.ts` and
  whatever `TrackRegion`, the tab row and `svgPath.test.ts` need to agree.
- Delete `Divider`'s `animated` prop and its `whileInView` branch.
- Reconcile `DURATION` with the duration tokens, and remove the `TODO`.

Separate commits — these have nothing to do with each other or with the
performance work.

## Done when

- `pnpm build && pnpm lint && pnpm test && pnpm format:check` all pass, with the
  real output reported.
- The track-records module is in its own chunk, loaded on demand, and the
  section reserves its height so nothing below it shifts while it loads. Before
  and after chunk sizes reported.
- Total image weight reported before and after. `portrait-cutout.png` is still
  exactly 1323×1189 and the hero helmet still fits correctly.
- No request to `fonts.googleapis.com` or `fonts.gstatic.com` in the network
  panel of a built `dist/`.
- Archivo still resolves across the full `wdth 62..125` range. If `01` has
  landed, its scroll device still works.
- `grep -r "animated" src/components/ui/` returns nothing.
- `DURATION` and `--duration-*` agree, and the `TODO` comments in
  `src/lib/constants.ts` and `src/app/App.tsx` are gone.
- Every region tab still lists at least one circuit.

## Out of scope

- Real sector splits — ROADMAP is right that they want real geometry first.
- Any change to circuit `path` strings. That is `04`.
- Component tests for selection and playback. Worth doing, unrelated to weight.
- Analytics.
- Legal page copy.

## Progress

- [ ] 1. Track-records chunk lazy-loaded, sizes recorded
- [ ] 2. `sharp` devDependency + `pnpm images` + AVIF/WebP emitted
- [ ] 3. Image weight before/after recorded
- [ ] 4. Fonts self-hosted, axis range verified
- [ ] 5. Mount Panorama's region corrected
- [ ] 6. `Divider.animated` deleted
- [ ] 7. `DURATION` reconciled with the duration tokens
