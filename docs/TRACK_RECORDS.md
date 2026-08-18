# Track Records

The animated circuit module — section 04 of the page, and the reason the site
exists.

## What it does

Pick a region (Europe / America / Asia), pick a circuit from the list, and a
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

## The `Track` type

Defined in `features/track-records/data/types.ts`. Data lives in
`features/track-records/data/tracks.ts` — 12 circuits: 5 Europe, 5 America,
2 Asia.

| Field     | Type          | Unit / format                           | Example                                                            |
| --------- | ------------- | --------------------------------------- | ------------------------------------------------------------------ |
| `id`      | `string`      | 3-letter code, unique                   | `'NUR'`                                                            |
| `region`  | `TrackRegion` | `'EUROPE' \| 'AMERICA' \| 'ASIA'`       | `'EUROPE'`                                                         |
| `name`    | `string`      | Display name                            | `'Nürburgring GP'`                                                 |
| `lap`     | `string`      | **`M:SS.mmm`** — a string, not a number | `'1:54.318'`                                                       |
| `length`  | `string`      | Unit baked into the string              | `'5.148 KM'`                                                       |
| `corners` | `number`      | Count                                   | `15`                                                               |
| `flag`    | `string`      | A CSS `background` value, not an image  | `'linear-gradient(180deg,#000 0 33%,#DD0000 33% 66%,#FFCE00 66%)'` |
| `path`    | `string`      | SVG `d`, authored in a 1000×620 viewBox | `'M150 500 L640 500 C700 500 … 150 500 Z'`                         |

Two of these are worth explaining:

**`lap` is a string on purpose.** It is authored in display form and it _is_
the display form; `parseLapTime()` converts it to milliseconds when the
chronometer needs a number. Storing milliseconds instead would mean formatting
on every read and would let the list and the panel drift apart. A test asserts
all 12 values round-trip through `parseLapTime` → `formatLapTime` unchanged,
which is exactly the guarantee that keeps the panel and the list agreeing.

**`flag` is a CSS gradient, not an image.** Twelve flag PNGs for 20×13 chips
would be twelve requests for a few hundred pixels. The gradients render sharp
at any size and cost nothing. They are applied as
`style={{ background: track.flag }}` — data, not a hardcoded design value.

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
path geometry gives an exact point for any distance along the curve, for free,
and it keeps working when the paths are replaced with real circuit geometry.

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

Every `path` string **must** be:

1. **A single continuous subpath.** Exactly one `M` command, no `m`. The marker
   is positioned by `getPointAtLength()`, which walks one subpath; a path split
   into pieces makes the marker teleport between them, and the progress dash
   fills in the wrong order.
2. **Closed.** Ends with `Z`, and the geometric start and end coincide, so the
   lap loops seamlessly.
3. **Authored in the 1000×620 viewBox.** Coordinates outside it are clipped;
   the driver plate's pixel mapping assumes this space.

Only `M`, `L`, `C` and `Z` are used today. Other absolute commands are fine.
**Relative commands (`m`, `l`, `c`) are not** — the single-`M` test greps for
move commands, and relative authoring invites accidental subpath splits.

The data-integrity test in `lib/svgPath.test.ts` enforces (1) and (2) for all
twelve circuits. Run `pnpm test` after any change to the path data.

> **Do not hand-edit these strings.** They were generated from the design
> handoff's `tracks.js` by a script, precisely so nobody transcribes a
> 400-character path by hand. Regenerate rather than patch.

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

| Component          | Notes                                                                             |
| ------------------ | --------------------------------------------------------------------------------- |
| `TrackRecords`     | Orchestrator. Region tabs, the container ref, and the responsive grid.            |
| `TrackList`        | Desktop rows and the mobile chip scroller — same data, media-query choice.        |
| `TrackListItem`    | One desktop row: index, flag chip, name, best lap.                                |
| `TrackPanel`       | The right-hand panel; reorders the chronometer above the name on mobile.          |
| `TrackMap`         | The SVG: base outline, progress, trail, start/finish tick, marker, plate overlay. |
| `CarMarker`        | Bright core inside a cyan halo. No props — moved by attribute.                    |
| `DriverLabel`      | HTML overlay plus leader line. Never rotates; flips side past 66% of panel width. |
| `LapTimer`         | The chronometer. Renders `0:00.000`; the loop writes the rest.                    |
| `SectorBar`        | S1/S2/S3 bars.                                                                    |
| `PlaybackControls` | PAUSE/PLAY and 1X/2X.                                                             |

## Known limitation: the circuit shapes are not real

**The `path` geometry in `tracks.ts` does not represent the actual circuits.**
These are approximate, stylised loops generated by Claude Design to carry the
layout — they read as "a racing circuit" at a glance and nothing more.

Concretely:

- **Suzuka has no figure-eight.** Its defining feature — the crossover where the
  track passes over itself — is absent. The shape is a plain loop.
- **Mount Panorama has no mountain climb.** The long ascent through the Esses
  and the drop down Conrod Straight, the thing that makes the circuit famous,
  is not in the geometry.
- Corner counts, lengths and lap times are placeholder values that do not
  correspond to the drawn shapes.

Anyone who knows these circuits will notice immediately, which makes this the
most visible piece of unfinished work on the site.

**The fix** is to replace the paths with real geometry derived from
OpenStreetMap via the Overpass API: query the circuit way, project the
coordinates, simplify to a reasonable point count, normalise into the 1000×620
viewBox, and emit a single closed subpath per circuit. The module needs no
other change — the type, the loop and the components all keep working, because
they only ever depended on "one continuous closed path in this viewBox".

This is tracked as the next major piece of work in
[ROADMAP.md](ROADMAP.md).

## Also worth knowing

- **Sectors are even thirds of path length**, not real timing-loop splits. The
  handoff has no sector data and the design draws them as thirds. Real splits
  would need a `sectors` field and matching distances along the path.
- **Start/finish is simply the path's first point** (`getPointAtLength(0)`).
  There is no start-line offset, so on real geometry the S/F marker will land
  wherever the OSM way happens to begin — a `startFinishOffset` field will
  likely be needed then.
- **Mount Panorama is filed under `ASIA`.** Australia is Oceania; this comes
  straight from the design and leaves the Asia tab with two circuits. Worth
  revisiting alongside the real data.
