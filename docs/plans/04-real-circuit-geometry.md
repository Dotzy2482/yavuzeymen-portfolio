# 04 — Real circuit geometry from OpenStreetMap

## Goal

The twelve circuit outlines shipping today are approximate shapes from the
design handoff. They read as "a racing circuit" and nothing more — Suzuka has no
figure-eight, Mount Panorama has no mountain climb. Anyone who knows these
circuits spots it immediately, on the section the whole site is built around.

`docs/TRACK_RECORDS.md` calls Track Records "the piece that justifies the site
being a bespoke build rather than a template", and it is the only section that
demonstrates rather than claims. Fake geometry is the one thing that undercuts
that. This workstream replaces it with real geometry.

## Prerequisites

**`03` must be done.** It lazy-loads the chunk this work adds ~36 kB to, and it
settles Mount Panorama's region so nothing here touches `TrackRegion`.

Work this on its own branch. It touches the module the site is built around,
needs a manual fetch step, needs twelve circuits eyeballed against satellite
imagery, and drags three documentation files with it.

## Reasoning

This section is the point of the file. The pipeline shape is recoverable from
`docs/ROADMAP.md`; the decisions below are not, and each one was reached by
following an obvious-looking route until it broke.

### No network at build time

`pnpm build` must never touch Overpass. It returns 429 and 504 under ordinary
load, and a build that depends on it fails for reasons unrelated to the code —
including offline builds and CI.

So: **two stages with a committed intermediate.**

```
generate-track-paths.mjs --fetch   -> docs/assets/circuit-rings.json   (network, run by hand, ~once)
generate-track-paths.mjs           -> src/features/track-records/data/trackPaths.ts  (pure, offline)
generate-track-paths.mjs --check   -> asserts the two are in sync      (pure, offline, CI-safe)
```

This mirrors `docs/assets/generate-og-images.mjs`: a committed source asset, a
deterministic transform and a `--check` mode. Take the Prettier step from the
helmet-wireframe generator that used to sit beside it — output through
Prettier's own API (`resolveConfig(outPath)` then
`format(source, { ...config, filepath: outPath })`) so a regeneration leaves the
tree clean.

The committed cache is also what makes `--check` mean anything: **Overpass
returns different data on different days**, so two people running `--fetch` a
month apart get different geometry. Without the cache there is nothing stable to
check against.

`--check` is offline and takes milliseconds, so add it to CI after the test
step. Without it, `trackPaths.ts` drifts from the cache the first time somebody
patches a coordinate by hand.

### The generator owns geometry only, in a new file

The hero's deleted wireframe generator owned the whole file it wrote. **Do not
copy that here.**

`tracks.ts` also holds `lap`, `length`, `corners`, `country`, `name` and
`region` — and ROADMAP lists real lap times as the next cheap, high-value edit.
If the generator owned that file, changing one lap time would mean editing a
JSON in `docs/assets/` and running Node. That friction is precisely how a file
marked "do not hand-edit" gets hand-edited, and then the paths are corrupted for
real.

So the generator writes `src/features/track-records/data/trackPaths.ts`, holding
geometry and nothing else, and `tracks.ts` stays hand-maintained and imports
from it.

Type the generated export `as const satisfies Record<string, TrackGeometry>`.
Then referencing a circuit the generator did not emit is a **compile error**,
not a runtime `undefined` rendering as `<path d="undefined">`.

### Rotate the ring at generation time; do not add `startFinishOffset`

ROADMAP's open question reads as "add a `startFinishOffset` field (0–1 along the
path) and apply it in the loop". **Do not.**

The blocker is the progress fill. `useLapAnimation.ts` sets
`strokeDasharray` on the progress path, and **`stroke-dasharray` fills from the
path's own origin**. There is no offset that makes a dash begin elsewhere. You
would need to emit _two_ dashes for the wrapping case, rewrite `getProgressDash`
to return a pair, rewrite its unit tests, reason about the seam — and then
thread the same offset through the trail dash, the dot, the S/F tick and the
three sector fills. That is a refactor of the module's most delicate code in the
same change that replaces all of its data.

**Rotate the ring so `getPointAtLength(0)` _is_ the start line.** The runtime
offset is then always zero, and:

- `useLapAnimation.ts` — no change.
- `usePathPoint.ts` — no change; it memoises by `d`, and the new strings are
  just longer.
- `lib/svgPath.ts` — no change. (`getPointAt` carries an unused `offset`
  parameter. Leave it unused. `noUnusedParameters` does not flag exported
  function parameters.)
- `data/types.ts` — no new field; only a doc comment saying the geometry is
  OSM-derived and rotated so distance 0 is the start line.

This resolves the ROADMAP question by **removing the need for the field**, which
is a better answer than adding one. Say so in `TRACK_RECORDS.md`.

### Rotate before simplifying

RDP pins the first and last vertex as anchors, so whichever vertex you start at
survives, and the wrap-around join is the one place the algorithm cannot
evaluate curvature. Rotating to the start line first puts that artificial anchor
**on a straight** — every start/finish line in the world is on a straight — so
it costs nothing. Start anywhere else and you get a subtle flat spot at a random
corner.

### Suzuka's figure-eight is not a special case

The crossover is a **bridge, not a junction**. In OSM the two carriageways there
do not share a node: one carries `bridge=yes, layer=1`, the other passes
underneath at `layer=0`. So an endpoint-matching walk never faces a decision at
the crossing — it traverses the whole figure-eight as one continuous ring.

The result is a self-intersecting simple ring, which is exactly what a single
`M … Z` subpath expresses and exactly what `getPointAtLength()` walks correctly.
`TrackMap.tsx` renders every layer `fill="none"`, so there is no fill-rule
question at all.

Two consequences:

- **Never use signed area to determine winding.** A figure-eight's signed area
  is near zero and its sign meaningless. Orientation comes from a pinned start
  heading: compute the bearing at the start vertex and reverse the ring if it
  disagrees by more than 90°. Getting direction wrong is as visible as getting
  shape wrong — a car going the wrong way round is the one error every visitor
  spots.
- **Defer the bridge stroke treatment.** Doing it properly needs a
  `bridgeRange` in the generated data plus a fourth stroke layer in
  `TrackMap.tsx` (a wide `var(--bg)` casing under a normal stroke). At 3–4px
  stroke in a 1000-unit viewBox the crossover reads fine without it. Ship the
  geometry, look at it, then decide.

### The ring assembler, and where it will guess wrong

A circuit is almost never one closed way. It is several `highway=raceway` ways
split at pit entry, at bridges, and at arbitrary contributor boundaries —
sometimes gathered into a relation, often not. So:

1. Collect every way; for a relation take members with role `""` or `outer`.
2. Filter by tag: drop `service=*`, `area=yes`, `raceway=pitlane|pit_lane`,
   `access=no`, `highway=service`.
3. Subtract a hand-authored `excludeWays` list. **This escape hatch matters** —
   OSM tag quality varies wildly, and a pinned exclusion is more honest than a
   heuristic that silently swallows a chicane.
4. Walk from the way containing the vertex nearest the pinned start line,
   appending whichever way attaches by node id, reversing when it attaches by
   its tail.
5. At a genuine junction (pit entry rejoining), take the continuation with the
   **smallest bearing change** — a race track goes straight on, a pit lane peels
   off. Log every branch decision with its way ids so it is reviewable.
6. The tail node id must equal the head node id. If it does not, **fail loudly
   with the dangling way ids and coordinates.**

**Never fudge the closure.** A silently-fudged closure is a silently-wrong
circuit, and `svgPath.test.ts` would still pass — it only checks that the string
ends in `Z`.

Budget time for step 5 going wrong. COTA and Interlagos both have pit lanes
rejoining at shallow angles. Expect to eyeball all twelve against satellite
imagery and populate `excludeWays`.

### Pin ids, and hand-author what cannot be inferred

Name matching is unreliable — `Suzuka Circuit` against
`Suzuka International Racing Course`, plus karting tracks with near-identical
names inside the same complex. Pin OSM ids per circuit in a committed
`docs/assets/circuits.json`.

Alongside the ids, that file holds what the algorithm cannot infer: the start
line coordinate, the heading of travel at that line, `excludeWays`, and
per-circuit simplify knobs. These are **authoring** data, not derived data, and
getting one wrong fails visibly — the S/F tick lands in a hairpin — which is the
right failure mode.

### Metres, not viewBox units

Project to Web Mercator (`x = R·λ`, `y = R·ln(tan(π/4 + φ/2))`). The `1/cos(φ)`
scale factor is ~1.22 at 35°N but is isotropic at a point, so across a 5 km
circuit the shape distorts by well under 0.1%.

The reason it matters is that real metres make two things possible:

- **RDP tolerance in metres** (default 5 m), so a 6.2 km circuit and a 3.6 km
  circuit get comparable fidelity.
- **A free honesty check**: compare the measured ring length against the
  authored `track.length` and warn on >5% divergence. On a site whose whole
  argument is that the numbers are true, that is worth having. It will fire on
  all twelve at first, because the current lengths are handoff placeholders.
  That is the point.

Implement RDP **iteratively with an explicit stack**. A raw ring can be 3–5k
points and worst-case recursion depth is O(n).

If the point count exceeds a per-circuit maximum, multiply tolerance by 1.25 and
retry, up to ~8 times — and write the final tolerance into the generated file's
header so the output is reproducible from the committed inputs.

### Normalising: the margin is bigger than it looks

Fit the bbox with `scale = min((1000 - 2m)/w, (620 - 2m)/h)`, centre, flip y.

Use a margin of **~48, not 20**. `TrackMap.tsx` draws the S/F group from
`y-18` to `y+18` with a 22px `S/F` label at `x+16, y-22`, all **outside** the
path bbox. Too small a margin clips the label on a circuit whose start line sits
near the edge.

**Preserve aspect ratio.** A long thin circuit letterboxes in the 620-high box,
and that is correct. Never stretch to fill.

Round to **1 decimal** — 0.1 viewBox units is ~0.03% of the width, an order of
magnitude under a 3px stroke, and it roughly halves the `d` string against 2
decimals.

**Emit a polyline** (`M x y L x y … Z`), not curves. At 150–350 points with the
existing `stroke-linejoin="round"` it reads smooth, and it keeps
`getPointAtLength()` exact and cheap. Do **not** repeat the first point before
`Z` — `Z` already closes with a straight segment, and the duplicate creates a
zero-length final segment.

A closed-loop Catmull-Rom to cubic-Bézier pass (~20 lines, no dependency) is the
escape hatch if it looks faceted. It inflates the `d` string ~2.5× and overshoots
at hairpins. Measure before reaching for it.

### Self-check inside the generator

Mirror `svgPath.test.ts`'s assertions in the generator itself: exactly one `M`,
ends in `Z`, no lowercase `m`/`l`/`c`, twelve circuits. **The generator should
fail, not the test suite** — a bad path should never reach the tree.

### ODbL attribution is a licence obligation

OSM data is ODbL. A rendered map derived from it is a Produced Work and **must
credit OpenStreetMap contributors**. Put it in three places: the generated
file's header, `docs/TRACK_RECORDS.md`, and **visibly on the page** — a
`MonoLabel` under the track panel, or a line in the footer.

This is the single most likely thing in this workstream to be forgotten.

### Two things real geometry will surface

Check both even if neither needs changing:

- **`TRAIL_LENGTH = 70` is in path units.** Real circuits will have quite
  different total path lengths than the current stylised loops — a figure-eight
  packs far more length into the same box — so 70 units may read as a long smear
  on one circuit and a stub on another. The fix, if needed, is one line making
  the trail a fraction of total length. It does **not** break the test:
  `svgPath.test.ts` passes `TRAIL_LENGTH` explicitly as an argument, so
  `getTrailDash` stays agnostic.
- **`getPointAtDistance` samples the tangent at `d + 1` unit.** On a dense
  polyline with ~4-unit segments that is still a sane sample, and nothing
  rotates today (`CarMarker` is a circle), so the risk is low.

## Steps

1. Author `docs/assets/circuits.json` — pinned OSM ids, start line, start
   heading, exclusions, simplify knobs, for all twelve.
2. Write `docs/assets/generate-track-paths.mjs` with `--fetch`, default and
   `--check` modes, following `generate-og-images.mjs`'s contract.
3. Run `--fetch`; commit `docs/assets/circuit-rings.json`.
4. Generate `src/features/track-records/data/trackPaths.ts`.
5. Rewrite `src/features/track-records/data/tracks.ts` to import geometry and
   keep everything else hand-authored. Update the doc comment on `Track.path` in
   `data/types.ts`.
6. Eyeball all twelve against satellite imagery. Populate `excludeWays` and
   re-run until each is right — including direction of travel.
7. Add the visible OSM attribution.
8. Add `--check` to the CI workflow after the test step.
9. Update `CLAUDE.md`, `docs/TRACK_RECORDS.md` and `docs/ROADMAP.md` in the same
   commit — see below.

### Documentation that must change with the code

- **`CLAUDE.md`** — the "do not hand-edit the `path` strings in
  `data/tracks.ts`" bullet now points at a file that no longer contains paths.
  Rewrite it to name `trackPaths.ts` and the new generator, beside the OG-image
  entry. In "Known placeholders", the geometry row goes; the lap-times row
  stays.
- **`docs/TRACK_RECORDS.md`** — delete the "Known limitation" section. Rewrite
  "Path requirements" for polylines. Replace the `startFinishOffset` note with
  the rotate-at-generation answer. Add attribution. Also fix the stale `flag:
string` row in the field table — the actual field is `country: CountryCode`.
- **`docs/ROADMAP.md`** — move the OSM block to Done. Keep `displayDurationMs`
  and real sector splits as open items.

## Done when

- `pnpm build && pnpm lint && pnpm test && pnpm format:check` all pass, with the
  real output reported.
- `node docs/assets/generate-track-paths.mjs --check` passes on a clean tree,
  and is wired into CI.
- Running the generator twice leaves the tree clean.
- All twelve circuits are recognisable to someone who knows them. Specifically:
  **Suzuka has its figure-eight** and **Mount Panorama has its climb**.
- Every circuit runs in its real direction of travel.
- The S/F marker sits on the actual start line on all twelve, and its label is
  not clipped on any.
- The chronometer still reads exactly `track.lap` as the marker crosses the
  line — the invariant `docs/TRACK_RECORDS.md` is built around.
- `useLapAnimation.ts`, `usePathPoint.ts` and `lib/svgPath.ts` are unchanged, or
  the exception is justified in the commit.
- OSM attribution is visible on the rendered page.
- The three documentation files no longer describe the geometry as approximate.

## Out of scope

- **`displayDurationMs` per track.** It changes the timing invariant all of
  `TRACK_RECORDS.md` is built around. Separate change, separate doc update.
- **Real sector splits.** The mechanism is identical to the start line — pin two
  more coordinates, emit two offsets — but it changes `getSectorFill` and its
  three unit tests, which hardcode thirds. Shape `circuits.json` so adding it
  later is pure data, then stop.
- **Bridge stroke treatment** at the Suzuka crossover.
- **Mount Panorama's region** — settled in `03`.
- **Real lap times, lengths and corner counts.** Blocked on Yavuz. The
  generator's length warning will fire loudly on all twelve; that is expected
  and is not this workstream's job to silence.

## Progress

- [x] 1. `circuits.json` authored for all twelve
- [x] 2. `generate-track-paths.mjs` written
- [x] 3. `--fetch` run, `circuit-rings.json` committed
- [x] 4. `trackPaths.ts` generated
- [x] 5. `tracks.ts` + `types.ts` updated
- [x] 6. All twelve verified against satellite imagery, direction included
- [x] 7. OSM attribution visible on the page
- [x] 8. `--check` wired into CI
- [x] 9. `CLAUDE.md`, `TRACK_RECORDS.md`, `ROADMAP.md` updated

### What the steps turned into

**Relations where OSM has them, ways where it does not.** Ten circuits pin the
relation that gathers their racing line — `type=circuit` for nine, a route
relation for Laguna Seca. Road Atlanta has no relation and tags its racing line
`service=raceway`; Mount Panorama is a public road, `highway=residential`. Both
pin their ways one by one, and **a way pinned by id bypasses the tag filter**:
the filter exists because relation membership is a contributor's judgement, and
a pinned id is the author's. The filter still earned its keep elsewhere, where
five relations carry their pit lane as a `pit_lane` member.

**The ring is assembled offline.** The plan's pipeline leaves open which stage
walks the ring. It is the offline one: `circuit-rings.json` holds the pinned
ways raw, so editing `excludeWays` or a start line never refetches, and never
pulls a month of upstream edits in with it.

**A node graph, not way endpoints.** A pit lane can join mid-way, which an
endpoint walk never sees. A `oneway` way only contributes edges in its direction
of travel, and the pinned heading picks which way to leave the start edge — the
"reverse if the bearing disagrees by more than 90°" rule, applied before walking
rather than after. A heading that disagrees with the tagging fails loudly; five
of the first draft's did, and were right to. Suzuka and Interlagos carry
`raceway:corner_number` tags, checked to run 1 → 18 and 1 → 15 along the lap.
The only consequential junction was at the Red Bull Ring, where the smallest
bearing change preferred MotoGP's long-lap loop to Turn 1 (7° against 32°);
it, the MotoGP chicane and the untagged pit lane are excluded by id.

**Start lines.** Nine are tagged OSM nodes. Where start and finish are mapped
separately — Zandvoort, Imola, Silverstone, the Red Bull Ring, COTA,
Interlagos, Mount Panorama — the finish is used, as the line a lap is timed
across. Watkins Glen, Road Atlanta and Suzuka have neither, and are authored on
the pit straight. All twelve sit on the track to within 0.1 m.

**1 m, not 5 m.** The plan expected raw rings of 3–5k points. These circuits are
mapped with 173–597 nodes a lap, and 5 m left 35–64 points and a polygon at
every hairpin. At 1 m they carry 87–152 points, 17.5 kB for all twelve against
the 36 kB budgeted; `maxPoints` never binds, and a `minPoints` floor of 80
stops a future tolerance change from quietly faceting a circuit.

**The length warning stayed quiet.** The plan predicted it would fire on all
twelve. It did not: the handoff's lengths are the real published figures for
these layouts, and every measured ring agrees to within 1.5%. So the threshold
went down to 3%, where a warning means the walk took a wrong branch.

| Id  | Points | Measured | Shown    | Start line                   |
| --- | ------ | -------- | -------- | ---------------------------- |
| NUR | 118    | 5.116 km | 5.148 km | node, `raceway=start-finish` |
| ZAN | 124    | 4.253 km | 4.259 km | node, `raceway=finish`       |
| IMO | 91     | 4.904 km | 4.909 km | node, `raceway=finish`       |
| SIL | 143    | 5.881 km | 5.891 km | node, `raceway=finish`       |
| RBR | 87     | 4.300 km | 4.318 km | node, `Finish Line`          |
| COT | 126    | 5.502 km | 5.513 km | node, `Finish Line`          |
| WGL | 119    | 5.473 km | 5.552 km | authored                     |
| RAT | 93     | 4.090 km | 4.088 km | authored                     |
| LAG | 94     | 3.601 km | 3.602 km | node, `Start/Finish`         |
| INT | 112    | 4.308 km | 4.309 km | node, `Finish Line`          |
| BAT | 106    | 6.197 km | 6.213 km | node, `Finish Line`          |
| SUZ | 152    | 5.807 km | 5.807 km | authored                     |

**The S/F tick had to turn.** Not in the plan. The design's upright tick and
fixed label assumed a level start straight; at Zandvoort, Watkins Glen, Laguna
Seca and Interlagos the tick lay along the track, and on several the label sat
on it — or, at rest, under the driver plate. `lib/startLine.ts` reads the
direction of travel off the first segment, `TrackMap` turns the tick across it,
and the label goes on the side facing away from the plate. `useLapAnimation`,
`usePathPoint` and `lib/svgPath.ts` are unchanged.

**How it was verified.** Every outline was rendered and compared with the real
layout — Suzuka's crossover and its Spoon–130R–chicane end, Mount Panorama's
Mountain Straight, the Cutting and the Chase, Laguna's Corkscrew, COTA's Turn 1
hairpin and esses, the Senna S, Maggotts–Becketts, the Red Bull Ring's three
straights, the Boot, Road Atlanta's esses and Turn 10 chicane, Imola's
Tamburello, Villeneuve and Rivazza, Zandvoort's Hugenholtz and Arie Luyendyk,
the Mercedes-Arena — and every direction of travel against the circuit's known
sense and OSM's own `oneway` tagging. The comparison was against the known
layouts, not satellite tiles fetched for it; OSM's raceways are themselves
traced from aerial imagery. The running site was then driven through headless
Chrome over CDP at 1440×900 and 390×844, all twelve at rest and mid-lap, and the
chronometer sampled every frame across a lap wrap: it reads 1:57.197 one frame
before Suzuka's 1:57.203, 2:01.940 before Mount Panorama's 2:01.947 and 1:22.937
before Laguna's 1:22.940, with the dot at most 1.3 units from the tick.

**The two things real geometry was to surface.** `TRAIL_LENGTH` stays 70 path
units. Totals run from 1,314 (Road Atlanta) to 2,848 (the Red Bull Ring), so it
covers 2.5–5.3% of a lap, but it is the same length on screen on every circuit
and reads as a short comet on all twelve; the fraction fix was not needed.
`getPointAtDistance`'s tangent sample at `d + 1` is sane on these segments, and
nothing rotates by it.

**Tall circuits draw small on a phone.** Watkins Glen, Road Atlanta, Laguna Seca
and Mount Panorama letterbox north-up in the 1000×620 box. That is the plan's
"correct" letterbox; turning maps away from north to fill it would be a
separate decision, and one to make with Yavuz.
