# Track Records

The animated circuit module — section 04 of the page, and the reason the site
exists.

## What it does

Pick a region (Europe / America / Asia-Pacific), pick a circuit from the list, and a
car marker drives the lap around the circuit outline. As it goes:

- the outline fills in cyan behind it, with a short bright trail pinned to the
  marker;
- a chronometer counts up and lands **exactly** on the personal best as the
  marker crosses the start/finish line;
- three sector bars fill in sequence;
- a driver plate follows the marker, flipping to its other side before it would
  run off the panel edge.

## Why it is the centre of the site

Everything else on the page is a claim: a bio paragraph, a timeline, a grid of
results. This section is the only one that _demonstrates_ something. A lap time
in a table is a number; a lap time counting up while a marker traces the actual
circuit is a performance. It is the piece a sponsor or a team manager will
remember, and it is the piece that justifies the site being a bespoke build
rather than a template.

It is also, by a wide margin, the most complex thing here — hence its own
module boundary and its own document.

## Public API

The rest of the app may import **only** from
`src/features/track-records/index.ts`:

```ts
export { TrackRecords } from './components/TrackRecords';
export type { TrackRecordsProps } from './components/TrackRecords';
export type { Track, TrackId, TrackRegion } from './data/types';
```

`sections/TrackRecords/TrackRecords.tsx` renders the section chrome (anchor,
`SectionHeading`, spacing) and drops `<TrackRecords />` inside. It knows
nothing else about the module.

It imports it **lazily** — `lazy(() => import('@/features/track-records'))` —
so the whole module ships as its own chunk, off the critical path. That makes
the section file the only importer, and it has to stay that way: a static
import of any _value_ from the index anywhere else folds the module back into
the main bundle without an error or a warning. Type-only imports are erased
and cost nothing. While the chunk loads, `TrackRecordsPlaceholder` holds the
module's footprint; if the layout here changes, that file's heights want
re-measuring.

## The `Track` type

Defined in `features/track-records/data/types.ts`. Data lives in
`features/track-records/data/tracks.ts` — 12 circuits: 5 Europe, 5 America,
2 Asia-Pacific (`APAC`: Suzuka and Mount Panorama).

| Field     | Type          | Unit / format                                                     | Example                          |
| --------- | ------------- | ----------------------------------------------------------------- | -------------------------------- |
| `id`      | `string`      | 3-letter code, unique                                             | `'NUR'`                          |
| `region`  | `TrackRegion` | `'EUROPE' \| 'AMERICA' \| 'APAC'`                                 | `'EUROPE'`                       |
| `name`    | `string`      | Display name                                                      | `'Nürburgring GP'`               |
| `lap`     | `string`      | **`M:SS.mmm`** — a string, not a number                           | `'1:54.318'`                     |
| `length`  | `string`      | Unit baked into the string                                        | `'5.148 KM'`                     |
| `corners` | `number`      | Count                                                             | `15`                             |
| `country` | `CountryCode` | Key into `COUNTRIES` in `flags.ts`                                | `'DE'`                           |
| `path`    | `string`      | SVG `d` in the 1000×620 viewBox, from `trackPaths.ts` (generated) | `'M578.6 189.4L533.7 235.3 … Z'` |

Two of these are worth explaining:

**`lap` is a string on purpose.** It is authored in display form and it _is_
the display form; `parseLapTime()` converts it to milliseconds when the
chronometer needs a number. Storing milliseconds instead would mean formatting
on every read and would let the list and the panel drift apart. A test asserts
all 12 values round-trip through `parseLapTime` → `formatLapTime` unchanged,
which is exactly the guarantee that keeps the panel and the list agreeing.

**The flag is a CSS gradient, not an image.** `country` resolves through
`COUNTRIES` in `flags.ts` to a gradient and a country name. Twelve flag PNGs
for 20×13 chips would be twelve requests for a few hundred pixels; the
gradients render sharp at any size and cost nothing. They are applied as a
`style` background — data, not a hardcoded design value — and the name is what
makes the chip accessible to anyone who cannot see or does not recognise it.

**`path` is the one field nobody types.** `tracks.ts` reads it from
`trackPaths.ts`, which is generated from OpenStreetMap — see
[Real geometry](#real-geometry-the-openstreetmap-pipeline) below. Everything
else in `tracks.ts` is hand-maintained, so changing a lap time never means
running a script.

Module-level constants, also in `types.ts`:

| Constant                       | Value            | Meaning                                     |
| ------------------------------ | ---------------- | ------------------------------------------- |
| `TRACK_VIEW_WIDTH` / `_HEIGHT` | 1000×620         | The coordinate space every path is drawn in |
| `TRACK_VIEWBOX`                | `'0 0 1000 620'` | Applied to the `<svg>`                      |
| `LAP_DURATION_MS`              | 12000            | On-screen lap duration at 1× (see below)    |
| `TRAIL_LENGTH`                 | 70               | Bright trail length, in path units          |

## The critical rule: real lap time ≠ on-screen duration

**These are two independent concepts and must never be conflated.**

- **Real lap time** is the driver's personal best — `track.lap`, e.g.
  `'1:54.318'`. This is what the chronometer displays.
- **On-screen duration** is how long the marker takes to travel the circuit —
  `LAP_DURATION_MS / speed`, i.e. 12 seconds at 1× and 6 seconds at 2×. It is
  the same for every circuit.

The two are related by exactly one line, in `useLapAnimation`:

```ts
// The marker advances on screen time…
fraction.current = (fraction.current + (delta * speed) / LAP_DURATION_MS) % 1;

// …while the chronometer scales the real lap time by the marker's position.
chrono.textContent = formatLapTime(fraction * parseLapTime(track.lap));
```

So the displayed time is `fraction × lapMs`. At `fraction = 1` the marker is
back on the line and the chronometer reads the personal best, to the
millisecond — no matter how long the real lap actually is.

**Why it has to work this way:** lap times across the twelve circuits range
from about 1:22 to over 2:00, and the real target is endurance circuits where a
lap can run to eight minutes. Nobody watches a dot crawl for eight minutes. If
the marker moved in real time the section would be unwatchable; if the
chronometer ran at screen speed it would show a number that is simply false.
Decoupling them keeps the animation watchable **and** the number true.

**If you change this**, keep the invariant: _the chronometer must read exactly
`track.lap` at the moment the marker crosses the line._ The round-trip test in
`lib/formatLapTime.test.ts` protects half of it; the other half is this
formula.

A future improvement is a per-track `displayDurationMs`, so a short technical
circuit and a long endurance circuit can differ on screen. The scaffold's
original type had that field, and it is a good idea — the design's prototype
simply hardcoded one global value, so that is what shipped.

## Animation architecture

```
 track.path (SVG d string)
        │
        ▼
 <path data-lap="base">                     rendered once per selection
        │
        │ getTotalLength()                  measured once per path, cached
        │ getPointAtLength(distance)        called once per frame
        ▼
 useRafLoop  ──►  direct DOM writes         never React state
        │
        ├─ progress path   stroke-dasharray = "distance total"
        ├─ trail path      dasharray + dashoffset, pinned to the marker
        ├─ car marker      transform="translate(x,y)"
        ├─ chronometer     textContent = formatLapTime(fraction × lapMs)
        ├─ sector bars ×3  style.width = fill%
        └─ driver plate    transform, in panel pixels, with edge flip
```

**Why `getPointAtLength` and not keyframes.** The marker has to follow an
arbitrary circuit shape. Hand-authoring keyframes per circuit would be twelve
sets of hand-tuned data that drift the moment a path changes. The browser's own
path geometry gives an exact point for any distance along the curve, for free
— and it kept working, untouched, when the handoff's sketches were replaced
with real circuit geometry.

**Why direct DOM writes.** One frame touches the progress dash, the trail, the
marker transform, the chronometer text, three sector widths and the plate
transform. Routing that through React state would re-render the subtree sixty
times a second to change values React does not need to know about. The loop
mutates the nodes and React never re-renders.

**How the loop finds its nodes.** Components tag their elements with
`data-lap="base|progress|trail|dot|start-finish|chrono|label|map"` and
`data-lap-sector="0|1|2"`. `useLapAnimation` receives one container ref,
resolves all of them once with `querySelector`, and caches the result until
`basePath.isConnected` goes false (i.e. React swapped the subtree).

This is deliberate, not a shortcut. The obvious alternative — building a bag of
ref objects and threading it down through props — puts mutable values in the
render path, which React's compiler lint rules reject outright ("cannot access
refs during render"). Callback refs stored in a `useMemo` hit the same wall
once the compiler taints them. The `data-*` approach keeps refs out of the
component API entirely, and as a bonus `CarMarker`, `LapTimer` and `SectorBar`
take no props at all.

**Visibility gating.** The loop only runs while the section is on screen, via
`useInView({ once: false })`. There is no reason to burn frames on a panel
three screens away.

## Path requirements

Every `path` is a **polyline**: `M x y`, then `L x y` for each vertex, then
`Z`, with coordinates rounded to 0.1 units. It **must** be:

1. **A single continuous subpath.** Exactly one `M`. The marker is positioned
   by `getPointAtLength()`, which walks one subpath; a path split into pieces
   makes the marker teleport between them, and the progress dash fills in the
   wrong order.
2. **Closed, without repeating its first point.** It ends in `Z`, which draws
   the closing segment itself; repeating the first vertex before `Z` would add
   a zero-length segment at the start line.
3. **Started on the start/finish line, running in the direction of travel.**
   The first vertex _is_ the line, so `getPointAtLength(0)` is where the S/F
   tick goes and where the chronometer reads `0:00.000`, and the path runs the
   way the cars do. Nothing downstream applies an offset, so nothing
   downstream can get one wrong.
4. **In the 1000×620 viewBox, north up, aspect preserved,** inside a 48-unit
   margin so the S/F tick and its label are never clipped at an edge. A long
   thin circuit letterboxes; it is never stretched.

**Relative commands (`m`, `l`, `c`) are never emitted** — the single-`M` test
greps for move commands, and relative authoring invites accidental subpath
splits. Polylines rather than curves: at 87–152 vertices a lap with
`stroke-linejoin="round"` they read smooth, and they keep `getPointAtLength()`
exact and cheap.

The generator refuses to write a path that breaks any of this, and the
data-integrity test in `lib/svgPath.test.ts` re-checks (1) and (2) for all
twelve circuits.

> **Do not hand-edit these strings, and do not inline them in `tracks.ts`.**
> They are generated into `trackPaths.ts` from committed inputs, so a patch is
> overwritten by the next regeneration — and fails `--check`, in CI, until it
> is. Change `docs/assets/circuits.json` and regenerate instead.

## Hooks

| Hook                | Responsibility                                                                                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `useTrackSelection` | Which region is filtered and which circuit is selected. Switching region always lands on that region's first circuit, so the panel is never empty.                 |
| `usePlayback`       | _Intent_ only: playing or paused, 1× or 2×. Starts paused under `prefers-reduced-motion` — the design auto-plays, but "reduce motion" means nothing moves unasked. |
| `useLapAnimation`   | The frame loop. Owns the lap fraction, resolves the DOM nodes, and performs every per-frame write.                                                                 |
| `usePathPoint`      | Path geometry access with the total length memoised per `d` string — `getTotalLength()` is not free and only changes when the circuit changes.                     |

`usePlayback` and `useLapAnimation` are separate on purpose: intent versus
execution. The controls can be tested without a running `requestAnimationFrame`,
and the loop has no opinion about what the buttons do.

## Components

| Component          | Notes                                                                                |
| ------------------ | ------------------------------------------------------------------------------------ |
| `TrackRecords`     | Orchestrator. Region tabs, the container ref, and the responsive grid.               |
| `TrackList`        | Desktop rows and the mobile chip scroller — same data, media-query choice.           |
| `TrackListItem`    | One desktop row: index, flag chip, name, best lap.                                   |
| `TrackPanel`       | The right-hand panel; reorders the chronometer above the name on mobile.             |
| `TrackMap`         | The SVG: base outline, progress, trail, S/F tick across the straight, marker, plate. |
| `CarMarker`        | Bright core inside a cyan halo. No props — moved by attribute.                       |
| `DriverLabel`      | HTML overlay plus leader line. Never rotates; flips side past 66% of panel width.    |
| `LapTimer`         | The chronometer. Renders `0:00.000`; the loop writes the rest.                       |
| `SectorBar`        | S1/S2/S3 bars.                                                                       |
| `PlaybackControls` | PAUSE/PLAY and 1X/2X.                                                                |

## Real geometry: the OpenStreetMap pipeline

The outlines are the real circuits, in the full configuration each lap is set
on — Suzuka's figure-eight with its crossover, Mount Panorama's run up the
mountain and down Conrod Straight, Watkins Glen's Boot, the Nürburgring's
Mercedes-Arena. They come from OpenStreetMap, through
`docs/assets/generate-track-paths.mjs`, and every one runs in its real
direction of travel. The module around them did not change: the type, the loop
and the components only ever depended on "one continuous closed path in this
viewBox".

### Two stages, and no network at build time

```
generate-track-paths.mjs --fetch  → docs/assets/circuit-rings.json   network; by hand, rarely
generate-track-paths.mjs          → data/trackPaths.ts               offline; deterministic
generate-track-paths.mjs --check  → asserts the two are in sync      offline; milliseconds; in CI
```

Overpass answers 429 and 504 under ordinary load, and returns different data on
different days, so `pnpm build` never touches it. `--fetch` freezes the pinned
OSM ways into `circuit-rings.json` — tags, node ids and coordinates, exactly as
returned — and everything after that is a pure function of two committed files.
That cache is also what gives `--check` something stable to check against, and
CI runs it after the tests, so a hand-patched `trackPaths.ts` fails the build.

The generator writes **geometry and nothing else**, into its own file.
`tracks.ts` stays hand-maintained and imports `trackPaths`; the export is typed
`as const satisfies Record<string, TrackGeometry>`, so naming a circuit the
generator did not emit is a compile error rather than `d="undefined"`.

### What is authored, and what is derived

`docs/assets/circuits.json` holds what the algorithm cannot infer, per circuit:

- **`osm`** — the pinned ids. Ten circuits pin the OSM relation that gathers
  their racing line. Road Atlanta has none, and Mount Panorama is a public
  road, so both pin their ways one by one.
- **`startLine`** — the timing line's coordinate, the compass heading of travel
  across it, and a `source` saying where it came from. Nine are OSM nodes
  tagged as the start/finish or finish line (the finish, where both are mapped:
  it is the line a lap is timed across). Watkins Glen, Road Atlanta and Suzuka
  have none mapped and are authored on the pit straight.
- **`excludeWays`** — ways the walk must never take, each with its reason. Only
  the Red Bull Ring needs any.
- **`simplify`** — per-circuit overrides of the tolerance, point limits and
  margin. None are overridden today.

Everything else — which ways form the lap, their order and direction, the
rotation, the point count — is derived, and logged when the generator runs.

### How a ring is built

1. **Collect ways.** Relation members with role `""` or `outer`, filtered by
   tag (`service=*`, `area=yes`, `raceway=pitlane`, `access=no`,
   `highway=service` are dropped), plus any ways pinned by id, which are taken
   as authored. Then `excludeWays` is subtracted.
2. **Walk a node graph** from the edge nearest the start line, setting off in
   the direction of the pinned heading. A `oneway` way only offers its
   direction of travel, so a heading that disagrees with the tagging fails
   loudly rather than drawing the circuit backwards. At a junction the smallest
   bearing change wins — a race track goes straight on, a pit lane peels off —
   and the decision is logged with its way ids.
3. **Close, or fail.** The walk must come back to the node it left. A dead end
   or an early revisit stops the generator with the dangling way ids and
   coordinates; a closure is never fudged. Suzuka's crossover is a bridge — the
   two carriageways share no node — so the walk never faces a choice there, and
   the figure-eight comes out as one self-intersecting ring.
4. **Rotate** so the first vertex is the start line itself, projected onto the
   track.
5. **Simplify** with Ramer–Douglas–Peucker in true metres (1 m tolerance, so a
   3.6 km and a 6.2 km circuit get the same fidelity), after rotating, so the
   algorithm's fixed anchor sits on a straight rather than flattening a corner.
6. **Fit** into the viewBox — Web Mercator, north up, aspect preserved, a
   48-unit margin — and emit the polyline.
7. **Check.** The generator refuses to write a path with more than one `M`, no
   closing `Z`, a relative command, a vertex outside the viewBox or a clipped
   S/F label, and refuses a lap whose `raceway:corner_number` tags run
   backwards (Suzuka's run 1 → 18, Interlagos's 1 → 15). It also measures every
   ring against the `length` in `tracks.ts` and warns past 3%; all twelve agree
   within 1.5%, so a warning means the walk took a wrong branch.

### Fixing or adding a circuit

1. Pin ids in `circuits.json`: the circuit's OSM relation if it has a good one,
   its ways otherwise. Ids, never names — `Suzuka Circuit` against
   `Suzuka International Racing Course`, with karting tracks of near-identical
   names inside the same complex.
2. Author `startLine`: a tagged node on the pit straight if OSM has one, the pit
   straight between the last corner and Turn 1 otherwise, and say which in
   `source`.
3. `node docs/assets/generate-track-paths.mjs --fetch` if the cache does not
   hold the ids yet; plain `node docs/assets/generate-track-paths.mjs`
   otherwise.
4. Read the output: the branch decisions, the corner order, measured against
   authored length. Then **look at it** against satellite imagery, direction
   included — the self-checks catch broken paths, not wrong ones. Add
   `excludeWays` until the walk takes the right line.

Re-run `--fetch` only to pick up OSM edits on purpose, and review the diff of
`circuit-rings.json` when you do: the data changes from day to day.

### Why the start line is not a field

The obvious design is a `startFinishOffset` (0–1 along the path) applied in the
loop. It does not survive contact with the progress fill: `stroke-dasharray`
fills from the path's own origin, and no offset makes a dash start elsewhere. It
would take two dashes for the wrapping case, a `getProgressDash` that returns a
pair, rewritten unit tests, and the same offset threaded through the trail, the
dot, the S/F tick and all three sector fills — a refactor of the module's most
delicate code.

So the generator **rotates the ring** until its first vertex is the start line.
The runtime offset is then always zero, and `useLapAnimation`, `usePathPoint`
and `lib/svgPath.ts` did not change at all. (`getPointAt` still carries an
`offset` parameter from the scaffold; it stays unused.)

### The S/F tick crosses the straight it is on

The design drew every start on a level straight heading right, so an upright
tick and a label 16 units ahead and 22 above were always right. Real straights
point anywhere — Zandvoort's and Watkins Glen's run up the map, and an upright
tick lies _along_ them. `lib/startLine.ts` reads the direction of travel off
the path's first segment (which runs down the straight, by construction) and
`TrackMap` turns the tick across it. The label keeps the design's offset,
turned with the straight, on the side of the track facing away from the
driver plate — at rest the dot sits on the line and the plate beside it would
otherwise cover the label — and grows away from the track so it never lands on
the line it names. On a level straight heading right it reproduces the design
exactly.

It is pure string maths on `d`, so it renders on the first frame and in jsdom;
the loop still only translates the S/F group, and did not change. The generator
mirrors the same placement when it checks that no label is clipped, and a unit
test checks all twelve from the component's side.

### Licence

OpenStreetMap data is © OpenStreetMap contributors, under the
[Open Database License](https://www.openstreetmap.org/copyright). A map drawn
from it is a Produced Work and must credit it, so the credit is in three
places: the header of `trackPaths.ts`, this document, and — the one that
matters — **visibly on the page**, as a line under the map in `TrackPanel`
linking to the OSM copyright page. Removing that line is a licence breach, not
a design tweak.

## Also worth knowing

- **Sectors are even thirds of path length**, not real timing-loop splits. The
  handoff has no sector data and the design draws them as thirds. Real splits
  are the start line's mechanism again — pin two more coordinates beside
  `startLine` in `circuits.json` and emit their fractions — but they change
  `getSectorFill` and the three unit tests that hardcode thirds.
- **The trail is 70 path units on every circuit.** Real outlines run from about
  1,300 units (Road Atlanta, tall and letterboxed) to 2,850 (the Red Bull Ring),
  so the trail covers 2.5–5.3% of a lap — but it is the same length on screen
  everywhere and reads as a short comet on all twelve, so it was left alone.
- **Tall circuits draw small on a phone.** North up with the aspect preserved
  means Watkins Glen, Road Atlanta, Laguna Seca and Mount Panorama letterbox in
  the 1000×620 box. That is correct, and deliberately not "fixed" by stretching
  or by turning maps away from north.
- **Suzuka's crossover has no bridge treatment.** The figure-eight is one
  self-intersecting ring, and at a 3–4 unit stroke the crossing reads without a
  casing layer.
- **The third region is `APAC`, not `ASIA`.** The design filed Mount Panorama
  under Asia, and Australia is not in Asia. Giving it an Oceania tab of its own
  would have left Asia with Suzuka alone, so the tab was renamed to something
  both circuits honestly fit. It reads `APAC` because `ASIA-PACIFIC` wraps onto
  two lines in the tab row at 390px wide.
