/**
 * Turns real circuit geometry from OpenStreetMap into the twelve `path`
 * strings the Track Records map draws:
 *
 *   node docs/assets/generate-track-paths.mjs --fetch   # network: refresh ./circuit-rings.json
 *   node docs/assets/generate-track-paths.mjs           # offline: rewrite trackPaths.ts
 *   node docs/assets/generate-track-paths.mjs --check   # offline: assert the two are in sync
 *
 * Inputs, both committed:
 *
 *   ./circuits.json       HAND-AUTHORED. Per circuit: the pinned OSM ids, the
 *                         start line and the heading of travel across it, the
 *                         ways to exclude, and simplify/fit knobs. Everything
 *                         the algorithm cannot infer, and nothing it can.
 *   ./circuit-rings.json  FETCHED. The pinned relations and ways exactly as
 *                         Overpass returned them — tags, node ids, coordinates.
 *                         Written only by --fetch.
 *
 * Output: src/features/track-records/data/trackPaths.ts — geometry and nothing
 * else. `tracks.ts` stays hand-maintained (lap times, lengths, names) and
 * imports from it, so changing a lap time never means running this script.
 *
 * WHY TWO STAGES. Overpass answers 429 and 504 under ordinary load and returns
 * different data on different days, so `pnpm build` and CI must never touch it.
 * --fetch freezes the raw material into circuit-rings.json once; everything
 * after that is a pure function of the two committed files, which is what
 * makes --check meaningful and lets it run in CI in milliseconds. The ring is
 * assembled offline, not at fetch time, so editing `excludeWays` or a start
 * line never needs the network — and never silently picks up a month of
 * upstream edits along with the change that was intended.
 *
 * THE PIPELINE, per circuit:
 *
 *   1. Collect ways: members of each pinned relation with role "" or "outer",
 *      then filter them by tag (below), then add the pinned ways. A way pinned
 *      by id is taken as authored and is not tag-filtered — Road Atlanta's
 *      racing line is tagged `service=raceway` and Mount Panorama is a public
 *      road, and the author vouched for each id. `excludeWays` applies to all.
 *   2. Build a node graph. A `oneway` way contributes edges in its direction of
 *      travel only, so the walk cannot run a one-way racing line backwards.
 *   3. Find the edge nearest the pinned start line, and set off along it in
 *      the direction that agrees with the pinned heading. That is the
 *      "reverse if the bearing at the start disagrees by more than 90°" rule,
 *      applied before walking instead of after — and never by signed area,
 *      which is meaningless on Suzuka's figure-eight.
 *   4. Walk. At a genuine junction take the continuation with the smallest
 *      bearing change — a race track goes straight on, a pit lane peels off —
 *      and log the decision with its way ids so it can be reviewed.
 *   5. The walk must arrive back at the node it left. A dead end, or a revisit
 *      of any other node, fails loudly with way ids and coordinates. Closure
 *      is never fudged: a fudged closure is a silently wrong circuit.
 *   6. Rotate so the ring starts exactly on the start line (the projection of
 *      the pinned coordinate onto the start edge). The site then needs no
 *      start-line offset anywhere: getPointAtLength(0) *is* the line, and the
 *      progress dash, trail, dot, S/F tick and sectors are all unchanged.
 *   7. Simplify with Ramer–Douglas–Peucker in true metres, iteratively with an
 *      explicit stack (a densely mapped ring runs to thousands of points, and
 *      recursion depth is O(n) worst case). The default tolerance is 1 m, not
 *      the 5 m first planned: these circuits are mapped with a few hundred
 *      nodes a lap, and 5 m left 35–64 points and a faceted polygon at every
 *      hairpin. Over `maxPoints`, the tolerance grows ×1.25, up to eight
 *      times; the final value is written into trackPaths.ts. Rotation comes
 *      first: RDP pins its endpoints, so the artificial anchor lands on the
 *      start line — always on a straight — instead of flattening a corner.
 *   8. Fit into the 1000×620 viewBox, north up, aspect preserved, with a
 *      margin wide enough for the S/F tick and its label; round to 0.1 units;
 *      emit `M x y L x y … Z` without repeating the first point (Z closes it).
 *
 * Crossings are not junctions. Suzuka's crossover is a bridge: the two
 * carriageways share no node, so the walk never faces a choice there and the
 * figure-eight comes out as one self-intersecting ring — which is exactly what
 * a single `M … Z` subpath and getPointAtLength() handle.
 *
 * SELF-CHECKS. The generator fails rather than writing a bad path: exactly one
 * `M`, ends in `Z`, no relative commands, every coordinate inside the viewBox,
 * the S/F label unclipped, oneway ways never run backwards, corner numbers
 * (`raceway:corner_number`) never decreasing along the lap, twelve circuits.
 * It also measures each ring and compares it with the authored `length` in
 * tracks.ts — a divergence usually means the walk took a wrong branch.
 *
 * LICENCE. OpenStreetMap data is © OpenStreetMap contributors under the Open
 * Database License 1.0. The drawn circuits are a Produced Work and must say
 * so: the generated file's header, docs/TRACK_RECORDS.md and the Track Records
 * panel itself all carry the credit.
 *
 * Future sector splits are the same mechanism as the start line: add
 * `sectorLines: [{ lat, lon, source }, …]` beside `startLine` in circuits.json,
 * project each onto the ring the way step 6 projects the start line, and emit
 * the resulting fractions. Nothing here needs restructuring for it.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { format, resolveConfig } from 'prettier';

const CIRCUITS = new URL('./circuits.json', import.meta.url);
const RINGS = new URL('./circuit-rings.json', import.meta.url);
const TRACKS = new URL('../../src/features/track-records/data/tracks.ts', import.meta.url);
const OUT = new URL('../../src/features/track-records/data/trackPaths.ts', import.meta.url);

const OVERPASS = 'https://overpass-api.de/api/interpreter';
const USER_AGENT =
  'yavuz-site-track-geometry/1.0 (+docs/assets/generate-track-paths.mjs; circuit outlines for a portfolio site)';

/** Mirrors TRACK_VIEW_WIDTH / TRACK_VIEW_HEIGHT in data/types.ts. */
const VIEW = { width: 1000, height: 620 };
const EXPECTED_CIRCUITS = 12;

/**
 * The S/F group TrackMap draws around the start point, in viewBox units —
 * mirrors src/features/track-records/lib/startLine.ts. An 8×36 tick turned
 * across the direction of travel, and a 22px mono `S/F` label anchored 16
 * ahead and 22 to the side of the track facing away from the driver plate,
 * growing away from the track. The label's box is estimated generously (three
 * glyphs of a wide mono face, plus ascent), because the only failure worth
 * catching is a clipped one.
 */
const SF_TICK = { halfWidth: 4, halfLength: 18 };
const SF_LABEL = { ahead: 16, aside: 22, width: 3 * 0.7 * 22, height: 0.8 * 22 };
/** The driver plate flips left of the dot past this fraction of the width. */
const PLATE_FLIPS_AT = 0.66;

/** Every corner of the S/F tick and label, relative to the start point. */
function startMarkerCorners([x0, y0], [x1, y1]) {
  const angle = Math.atan2(y1 - y0, x1 - x0);
  const ahead = [Math.cos(angle), Math.sin(angle)];
  const across = [ahead[1], -ahead[0]];
  const corners = [];
  for (const a of [-SF_TICK.halfWidth, SF_TICK.halfWidth]) {
    for (const l of [-SF_TICK.halfLength, SF_TICK.halfLength]) {
      corners.push([a * ahead[0] + l * across[0], a * ahead[1] + l * across[1]]);
    }
  }
  const [first, second] = [across, [-across[0], -across[1]]].map((normal) => ({
    normal,
    x: SF_LABEL.ahead * ahead[0] + SF_LABEL.aside * normal[0],
    y: SF_LABEL.ahead * ahead[1] + SF_LABEL.aside * normal[1],
  }));
  const plateOnRight = x0 <= PLATE_FLIPS_AT * VIEW.width;
  const side =
    Math.abs(first.x - second.x) < 1
      ? first.y <= second.y
        ? first
        : second
      : first.x < second.x === plateOnRight
        ? first
        : second;
  const dx = side.normal[0] >= -1e-9 ? SF_LABEL.width : -SF_LABEL.width;
  const dy = side.normal[1] <= 1e-9 ? -SF_LABEL.height : SF_LABEL.height;
  corners.push([side.x, side.y], [side.x + dx, side.y], [side.x, side.y + dy]);
  corners.push([side.x + dx, side.y + dy]);
  return corners;
}

/** The Web Mercator sphere (EPSG:3857 uses the WGS84 semi-major axis). */
const EARTH_RADIUS = 6378137;
/** Mean Earth radius, for haversine lengths. */
const MEAN_RADIUS = 6371008.8;

/** Tags kept in the cache: what the pipeline reads, plus names for review. */
const KEEP_TAGS = [
  'highway',
  'name',
  'name:en',
  'oneway',
  'junction',
  'raceway',
  'raceway:corner_number',
  'service',
  'area',
  'access',
  'bridge',
  'layer',
  'tunnel',
];

/** How far to look along a way when measuring a bearing at a junction. */
const BEARING_LOOKAHEAD_M = 25;
/** A start line further than this from every kept way is a wrong coordinate. */
const START_LINE_MAX_OFFSET_M = 30;
/** Above this, the measured ring and the authored length disagree loudly. */
const LENGTH_WARN_RATIO = 0.03;

class GeneratorError extends Error {}
const fail = (message) => {
  throw new GeneratorError(message);
};

// ---------------------------------------------------------------------------
// Geometry

/** Web Mercator: x = R·λ, y = R·ln(tan(π/4 + φ/2)). Conformal, so bearings hold. */
function mercator(lon, lat) {
  const λ = (lon * Math.PI) / 180;
  const φ = (lat * Math.PI) / 180;
  return [EARTH_RADIUS * λ, EARTH_RADIUS * Math.log(Math.tan(Math.PI / 4 + φ / 2))];
}

function haversine([lon1, lat1], [lon2, lat2]) {
  const toRad = Math.PI / 180;
  const dφ = (lat2 - lat1) * toRad;
  const dλ = (lon2 - lon1) * toRad;
  const s =
    Math.sin(dφ / 2) ** 2 + Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dλ / 2) ** 2;
  return 2 * MEAN_RADIUS * Math.asin(Math.min(1, Math.sqrt(s)));
}

/** Compass bearing from a to b in projected space: 0 = north, clockwise, degrees. */
function bearing([ax, ay], [bx, by]) {
  return ((Math.atan2(bx - ax, by - ay) * 180) / Math.PI + 360) % 360;
}

/** Smallest absolute difference between two bearings, 0–180. */
function turn(a, b) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/** Closest point to p on segment ab, with its parameter t in [0, 1]. */
function projectOntoSegment([px, py], [ax, ay], [bx, by]) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  const x = ax + t * dx;
  const y = ay + t * dy;
  return { t, point: [x, y], distance: Math.hypot(px - x, py - y) };
}

/**
 * Ramer–Douglas–Peucker over a closed ring, iteratively with an explicit stack.
 * `points[0]` is the start line and is kept as the anchor at both ends; the
 * returned indices are into `points` and never repeat the anchor.
 */
function simplifyRing(points, tolerance) {
  const open = [...points, points[0]];
  const keep = new Uint8Array(open.length);
  keep[0] = 1;
  keep[open.length - 1] = 1;
  const stack = [[0, open.length - 1]];
  while (stack.length > 0) {
    const [first, last] = stack.pop();
    let worst = -1;
    let worstDistance = tolerance;
    for (let i = first + 1; i < last; i++) {
      const { distance } = projectOntoSegment(open[i], open[first], open[last]);
      if (distance > worstDistance) {
        worst = i;
        worstDistance = distance;
      }
    }
    if (worst !== -1) {
      keep[worst] = 1;
      stack.push([first, worst], [worst, last]);
    }
  }
  const indices = [];
  for (let i = 0; i < open.length - 1; i++) if (keep[i]) indices.push(i);
  return indices;
}

// ---------------------------------------------------------------------------
// Ring assembly

function onewayDirection(tags) {
  const value = tags.oneway;
  if (value === 'yes' || value === 'true' || value === '1') return 1;
  if (value === '-1' || value === 'reverse') return -1;
  return 0;
}

/**
 * Why a relation member is not part of the racing line, or null if it is.
 * Applied only to ways collected through a relation: membership there is a
 * contributor's judgement, while a way pinned by id is the author's.
 */
function rejectReason(tags) {
  if (tags.service !== undefined) return `service=${tags.service}`;
  if (tags.area === 'yes') return 'area=yes';
  if (tags.raceway === 'pitlane' || tags.raceway === 'pit_lane') return `raceway=${tags.raceway}`;
  if (tags.access === 'no') return 'access=no';
  if (tags.highway === 'service') return 'highway=service';
  return null;
}

function collectWays(circuit, cached) {
  const byId = new Map(cached.ways.map((way) => [way.id, way]));
  const excluded = new Map(circuit.excludeWays.map((entry) => [entry.id, entry.why]));
  const kept = new Map();
  const log = [];

  for (const relation of cached.relations) {
    for (const member of relation.members) {
      if (member.role !== '' && member.role !== 'outer') {
        log.push(`skip w${member.way} (relation ${relation.id} role "${member.role}")`);
        continue;
      }
      const way = byId.get(member.way) ?? fail(`${circuit.id}: w${member.way} missing from cache`);
      const reason = rejectReason(way.tags);
      if (reason) {
        log.push(`skip w${way.id} (${reason})`);
        continue;
      }
      kept.set(way.id, way);
    }
  }
  for (const id of circuit.osm.ways) {
    kept.set(id, byId.get(id) ?? fail(`${circuit.id}: pinned w${id} missing from cache`));
  }
  for (const [id, why] of excluded) {
    if (!kept.has(id) && !byId.has(id)) {
      fail(`${circuit.id}: excludeWays names w${id}, which the cache does not contain`);
    }
    if (kept.delete(id)) log.push(`exclude w${id} (${why})`);
  }
  return { ways: [...kept.values()], log };
}

function buildGraph(ways) {
  const nodes = new Map(); // node id -> { lonlat, xy }
  const edges = new Map(); // node id -> [{ to, way, index, step }]
  const segments = []; // undirected, for the start-line search

  const addEdge = (from, edge) => {
    if (!edges.has(from)) edges.set(from, []);
    edges.get(from).push(edge);
  };

  for (const way of ways) {
    way.nodes.forEach((id, i) => {
      const lonlat = [way.coords[2 * i], way.coords[2 * i + 1]];
      if (!nodes.has(id)) nodes.set(id, { lonlat, xy: mercator(...lonlat) });
    });
    const direction = onewayDirection(way.tags);
    for (let i = 0; i + 1 < way.nodes.length; i++) {
      const a = way.nodes[i];
      const b = way.nodes[i + 1];
      if (a === b) continue;
      if (direction >= 0) addEdge(a, { to: b, way, index: i + 1, step: 1 });
      if (direction <= 0) addEdge(b, { to: a, way, index: i, step: -1 });
      segments.push({ a, b, way, direction });
    }
  }
  return { nodes, edges, segments };
}

/** A point roughly BEARING_LOOKAHEAD_M along `way` from node index `index`, going `step`. */
function lookAhead(graph, way, index, step) {
  const origin = graph.nodes.get(way.nodes[index - step]).xy;
  let i = index;
  let point = graph.nodes.get(way.nodes[i]).xy;
  while (Math.hypot(point[0] - origin[0], point[1] - origin[1]) < BEARING_LOOKAHEAD_M) {
    const next = i + step;
    if (next < 0 || next >= way.nodes.length) break;
    i = next;
    point = graph.nodes.get(way.nodes[i]).xy;
  }
  return point;
}

/** A point roughly BEARING_LOOKAHEAD_M back along the ring walked so far. */
function lookBehind(graph, ring) {
  const here = graph.nodes.get(ring[ring.length - 1]).xy;
  for (let i = ring.length - 2; i >= 0; i--) {
    const point = graph.nodes.get(ring[i]).xy;
    if (Math.hypot(point[0] - here[0], point[1] - here[1]) >= BEARING_LOOKAHEAD_M) return point;
  }
  return graph.nodes.get(ring[0]).xy;
}

function describeNode(graph, id) {
  const [lon, lat] = graph.nodes.get(id).lonlat;
  return `n${id} (${lat.toFixed(6)}, ${lon.toFixed(6)})`;
}

function walkRing(circuit, graph) {
  const start = mercator(circuit.startLine.lon, circuit.startLine.lat);

  let nearest = null;
  for (const segment of graph.segments) {
    const hit = projectOntoSegment(
      start,
      graph.nodes.get(segment.a).xy,
      graph.nodes.get(segment.b).xy,
    );
    if (!nearest || hit.distance < nearest.hit.distance) nearest = { segment, hit };
  }
  if (!nearest) fail(`${circuit.id}: no ways left to walk`);

  // Projected metres are stretched by 1/cos(φ); report true metres.
  const scale = Math.cos((circuit.startLine.lat * Math.PI) / 180);
  const offset = nearest.hit.distance * scale;
  if (offset > START_LINE_MAX_OFFSET_M) {
    fail(
      `${circuit.id}: the start line is ${offset.toFixed(0)} m from the nearest kept way ` +
        `(w${nearest.segment.way.id}) — wrong coordinate, or its way was excluded`,
    );
  }

  // Set off along the start edge in the direction of the pinned heading.
  const { segment } = nearest;
  const forward = bearing(graph.nodes.get(segment.a).xy, graph.nodes.get(segment.b).xy);
  const alongWay = turn(forward, circuit.startLine.heading) <= 90;
  if ((alongWay && segment.direction < 0) || (!alongWay && segment.direction > 0)) {
    fail(
      `${circuit.id}: the pinned heading ${circuit.startLine.heading}° runs against oneway ` +
        `w${segment.way.id} at the start line — the heading or the way's tagging is wrong`,
    );
  }
  const [from, to] = alongWay ? [segment.a, segment.b] : [segment.b, segment.a];
  const t = alongWay ? nearest.hit.t : 1 - nearest.hit.t;

  const ring = [from, to];
  const ringWays = [segment.way.id];
  const visited = new Set(ring);
  const decisions = [];
  const limit = graph.nodes.size + 1;

  while (ring[ring.length - 1] !== from) {
    if (ring.length > limit) fail(`${circuit.id}: walk did not terminate`);
    const current = ring[ring.length - 1];
    const previous = ring[ring.length - 2];
    const candidates = (graph.edges.get(current) ?? []).filter((edge) => edge.to !== previous);

    if (candidates.length === 0) {
      fail(
        `${circuit.id}: the ring does not close — dead end at ${describeNode(graph, current)} ` +
          `on w${ringWays[ringWays.length - 1]}. Dangling ways need pinning or excluding.`,
      );
    }

    let chosen = candidates[0];
    if (candidates.length > 1) {
      const incoming = bearing(lookBehind(graph, ring), graph.nodes.get(current).xy);
      const here = graph.nodes.get(current).xy;
      const scored = candidates
        .map((edge) => ({
          edge,
          delta: turn(incoming, bearing(here, lookAhead(graph, edge.way, edge.index, edge.step))),
        }))
        .sort((p, q) => p.delta - q.delta || p.edge.way.id - q.edge.way.id);
      chosen = scored[0].edge;
      decisions.push(
        `at ${describeNode(graph, current)}: took w${chosen.way.id} (Δ${scored[0].delta.toFixed(0)}°) over ` +
          scored
            .slice(1)
            .map((s) => `w${s.edge.way.id} (Δ${s.delta.toFixed(0)}°)`)
            .join(', '),
      );
    }

    if (chosen.to !== from && visited.has(chosen.to)) {
      fail(
        `${circuit.id}: the walk came back to ${describeNode(graph, chosen.to)} via w${chosen.way.id} ` +
          `before closing — a junction took a wrong branch. Decisions so far:\n  ${decisions.join('\n  ')}`,
      );
    }
    visited.add(chosen.to);
    ring.push(chosen.to);
    if (ringWays[ringWays.length - 1] !== chosen.way.id) ringWays.push(chosen.way.id);
  }

  // The tail must be the head. By construction it is; assert it anyway.
  if (ring[0] !== ring[ring.length - 1]) fail(`${circuit.id}: ring is not closed`);
  ring.pop();

  return { ring, ringWays, decisions, t, startOffset: offset };
}

/** Corner numbers must never decrease along the lap from the start line. */
function checkCornerOrder(circuit, ringWays, waysById) {
  const numbers = [];
  for (const id of ringWays) {
    const raw = waysById.get(id).tags['raceway:corner_number'];
    if (raw === undefined) continue;
    const n = Number.parseInt(raw, 10);
    if (Number.isFinite(n) && numbers[numbers.length - 1] !== n) numbers.push(n);
  }
  for (let i = 1; i < numbers.length; i++) {
    if (numbers[i] < numbers[i - 1]) {
      fail(
        `${circuit.id}: corner numbers run ${numbers.join(' → ')} along the walk — the circuit ` +
          'is being drawn against its direction of travel, or a branch was taken wrongly',
      );
    }
  }
  return numbers;
}

// ---------------------------------------------------------------------------
// Per-circuit generation

function authoredLengths(tracksSource) {
  const lengths = new Map();
  const pattern = /id:\s*'(\w+)'[\s\S]*?length:\s*'([\d.]+)\s*KM'/g;
  for (const [, id, km] of tracksSource.matchAll(pattern)) lengths.set(id, Number(km) * 1000);
  return lengths;
}

function formatNumber(value) {
  const rounded = Math.round(value * 10) / 10;
  return String(Object.is(rounded, -0) ? 0 : rounded);
}

/**
 * One circuit, cached ways in, path and diagnostics out. Exported — like
 * loadInputs and generateAll — so a throwaway script can render or inspect a
 * circuit without re-implementing the walk; running this file is what writes.
 */
export function generateCircuit(circuit, cached, defaults) {
  const knobs = { ...defaults, ...circuit.simplify };
  const { ways, log } = collectWays(circuit, cached);
  const graph = buildGraph(ways);
  const { ring, ringWays, decisions, t, startOffset } = walkRing(circuit, graph);
  const waysById = new Map(ways.map((way) => [way.id, way]));
  const corners = checkCornerOrder(circuit, ringWays, waysById);

  // Rotate: the first vertex is the start line itself, projected onto the
  // start edge; the ring then runs on round to the start edge's tail.
  const lonlat = ring.map((id) => graph.nodes.get(id).lonlat);
  const [a, b] = [lonlat[0], lonlat[1]];
  const startLonLat = [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])];
  const rotated = [startLonLat, ...lonlat.slice(1), lonlat[0]];
  if (t < 1e-9) rotated.pop(); // the line sits exactly on a node: do not duplicate it
  if (t > 1 - 1e-9) rotated.splice(1, 1);

  let measured = 0;
  for (let i = 0; i < rotated.length; i++) {
    measured += haversine(rotated[i], rotated[(i + 1) % rotated.length]);
  }

  // True local metres: Mercator scaled back by cos(φ) at the start line, which
  // is isotropic at a point and distorts a 5 km circuit by well under 0.1%.
  const scale = Math.cos((circuit.startLine.lat * Math.PI) / 180);
  const metres = rotated.map((p) => mercator(...p).map((v) => v * scale));

  let tolerance = knobs.toleranceM;
  let indices = simplifyRing(metres, tolerance);
  for (let attempt = 0; indices.length > knobs.maxPoints && attempt < 8; attempt++) {
    tolerance *= 1.25;
    indices = simplifyRing(metres, tolerance);
  }
  if (indices.length > knobs.maxPoints) {
    fail(
      `${circuit.id}: ${indices.length} points at ${tolerance.toFixed(2)} m, over ${knobs.maxPoints}`,
    );
  }
  if (indices.length < knobs.minPoints) {
    fail(
      `${circuit.id}: only ${indices.length} points at ${tolerance.toFixed(2)} m — under ` +
        `${knobs.minPoints}, the outline would read as faceted; lower toleranceM`,
    );
  }
  const simplified = indices.map((i) => metres[i]);

  // Fit: north up, aspect preserved, centred, y flipped for SVG.
  const xs = simplified.map((p) => p[0]);
  const ys = simplified.map((p) => p[1]);
  const [minX, maxX, minY, maxY] = [
    Math.min(...xs),
    Math.max(...xs),
    Math.min(...ys),
    Math.max(...ys),
  ];
  const margin = knobs.margin;
  const fit = Math.min(
    (VIEW.width - 2 * margin) / (maxX - minX),
    (VIEW.height - 2 * margin) / (maxY - minY),
  );
  const offsetX = (VIEW.width - (maxX - minX) * fit) / 2;
  const offsetY = (VIEW.height - (maxY - minY) * fit) / 2;
  const points = [];
  for (const [x, y] of simplified) {
    const point = [
      formatNumber(offsetX + (x - minX) * fit),
      formatNumber(offsetY + (maxY - y) * fit),
    ];
    const last = points[points.length - 1];
    if (!last || last[0] !== point[0] || last[1] !== point[1]) points.push(point);
  }
  while (points.length > 1 && points[points.length - 1].join() === points[0].join()) points.pop();

  const path =
    `M${points[0][0]} ${points[0][1]}` +
    points
      .slice(1)
      .map(([x, y]) => `L${x} ${y}`)
      .join('') +
    'Z';

  selfCheck(circuit.id, path, points);

  return {
    id: circuit.id,
    path,
    points: points.length,
    rawPoints: rotated.length,
    tolerance,
    measured,
    corners,
    ringWays,
    decisions,
    log,
    startOffset,
  };
}

function selfCheck(id, path, points) {
  if ((path.match(/M/g) ?? []).length !== 1) fail(`${id}: path must contain exactly one M`);
  if (!path.endsWith('Z')) fail(`${id}: path must end in Z`);
  if (/[mlcshqtvaz]/.test(path)) fail(`${id}: path must not contain relative commands`);
  if (!/^M[\d.]+ [\d.]+(L[\d.]+ [\d.]+)+Z$/.test(path)) fail(`${id}: path is not a plain polyline`);
  for (const [xs, ys] of points) {
    const [x, y] = [Number(xs), Number(ys)];
    if (!(x >= 0 && x <= VIEW.width && y >= 0 && y <= VIEW.height)) {
      fail(`${id}: point (${xs}, ${ys}) is outside the ${VIEW.width}×${VIEW.height} viewBox`);
    }
  }
  const start = points[0].map(Number);
  const clipped = startMarkerCorners(start, points[1].map(Number)).some(([dx, dy]) => {
    const [x, y] = [start[0] + dx, start[1] + dy];
    return x < 0 || x > VIEW.width || y < 0 || y > VIEW.height;
  });
  if (clipped) {
    fail(
      `${id}: the S/F tick or label at (${start.join(', ')}) would be clipped — raise simplify.margin`,
    );
  }
}

// ---------------------------------------------------------------------------
// Output

async function render(results, cache) {
  const bases = [...new Set(Object.values(cache.circuits).map((c) => c.osmBase.slice(0, 10)))];
  const rows = results.map(
    (r) =>
      ` * | ${r.id}  | ${String(r.points).padStart(6)} | ${r.tolerance.toFixed(2).padStart(7)} m ` +
      `| ${(r.measured / 1000).toFixed(3)} km |`,
  );
  const entries = results.map((r) => `  ${r.id}: { path: '${r.path}' },`);

  const source = `/**
 * Circuit outlines — GENERATED, do not edit. Regenerate with:
 *
 *   node docs/assets/generate-track-paths.mjs
 *
 * Map data © OpenStreetMap contributors, available under the Open Database
 * License 1.0 (https://www.openstreetmap.org/copyright). OSM data as of
 * ${bases.join(', ')}.
 *
 * Inputs:    docs/assets/circuits.json      (pinned OSM ids, start lines, knobs)
 *            docs/assets/circuit-rings.json (the pinned ways, as fetched)
 * Generator: docs/assets/generate-track-paths.mjs
 *
 * Each path is one closed polyline in the ${VIEW.width}×${VIEW.height} viewBox, north up,
 * running in the circuit's direction of travel, and rotated so its first point
 * is the start/finish line — getPointAtLength(0) is the line itself.
 *
 * Final RDP tolerance per circuit, in metres, so the output is reproducible
 * from the committed inputs alone:
 *
 * | Id   | Points | Tolerance | Measured |
 * | ---- | ------ | --------- | -------- |
${rows.join('\n')}
 */

import type { TrackGeometry } from './types';

export const trackPaths = {
${entries.join('\n')}
} as const satisfies Record<string, TrackGeometry>;
`;

  const outPath = fileURLToPath(OUT);
  const config = await resolveConfig(outPath);
  return format(source, { ...config, filepath: outPath });
}

// ---------------------------------------------------------------------------
// Fetch

async function overpass(query) {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(OVERPASS, {
      method: 'POST',
      headers: { 'User-Agent': USER_AGENT, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ data: query }),
    });
    if (response.ok) return response.json();
    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable || attempt >= 6) {
      throw new Error(
        `Overpass answered ${response.status}: ${(await response.text()).slice(0, 300)}`,
      );
    }
    const wait = 5000 * 2 ** attempt;
    console.log(`  Overpass ${response.status}; retrying in ${wait / 1000}s`);
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
}

async function fetchCircuit(circuit) {
  const { relations, ways } = circuit.osm;
  const parts = ['[out:json][timeout:120];'];
  if (relations.length > 0) parts.push(`rel(id:${relations.join(',')})->.r;.r out body;`);
  const wayQueries = [];
  if (relations.length > 0) wayQueries.push('way(r.r);');
  if (ways.length > 0) wayQueries.push(`way(id:${ways.join(',')});`);
  parts.push(`(${wayQueries.join('')});out geom;`);

  const data = await overpass(parts.join(''));
  const found = {
    relations: data.elements
      .filter((e) => e.type === 'relation')
      .map((e) => ({
        id: e.id,
        members: e.members
          .filter((m) => m.type === 'way')
          .map((m) => ({ way: m.ref, role: m.role })),
      })),
    ways: data.elements
      .filter((e) => e.type === 'way')
      .map((e) => ({
        id: e.id,
        tags: Object.fromEntries(
          Object.entries(e.tags ?? {}).filter(([k]) => KEEP_TAGS.includes(k)),
        ),
        nodes: e.nodes,
        coords: e.geometry.flatMap((g) => [g.lon, g.lat]),
      }))
      .sort((p, q) => p.id - q.id),
  };
  for (const id of relations) {
    if (!found.relations.some((r) => r.id === id))
      throw new Error(`${circuit.id}: relation ${id} not found`);
  }
  for (const id of ways) {
    if (!found.ways.some((w) => w.id === id)) throw new Error(`${circuit.id}: way ${id} not found`);
  }
  return {
    pinned: { relations: [...relations], ways: [...ways] },
    osmBase: data.osm3s.timestamp_osm_base,
    ...found,
  };
}

async function writeCache(circuits) {
  const cache = {
    about:
      'Written by generate-track-paths.mjs --fetch; do not edit. The OSM relations and ways ' +
      'pinned in circuits.json, as Overpass returned them. coords are [lon0, lat0, lon1, lat1, …], ' +
      'one pair per entry in nodes.',
    license:
      'Map data © OpenStreetMap contributors, available under the Open Database License 1.0 — ' +
      'https://www.openstreetmap.org/copyright',
    circuits: {},
  };
  for (const [i, circuit] of circuits.entries()) {
    if (i > 0) await new Promise((resolve) => setTimeout(resolve, 4000));
    console.log(`fetching ${circuit.id}`);
    cache.circuits[circuit.id] = await fetchCircuit(circuit);
  }
  const path = fileURLToPath(RINGS);
  const config = await resolveConfig(path);
  await writeFile(path, await format(JSON.stringify(cache), { ...config, filepath: path }), 'utf8');
  console.log('wrote docs/assets/circuit-rings.json');
}

// ---------------------------------------------------------------------------
// Main

export async function loadInputs() {
  const circuitsFile = JSON.parse(await readFile(CIRCUITS, 'utf8'));
  const cache = JSON.parse(await readFile(RINGS, 'utf8'));
  return { circuitsFile, cache };
}

export function generateAll(circuitsFile, cache) {
  const { defaults, circuits } = circuitsFile;
  if (circuits.length !== EXPECTED_CIRCUITS) {
    fail(`expected ${EXPECTED_CIRCUITS} circuits in circuits.json, found ${circuits.length}`);
  }
  const ids = new Set(circuits.map((c) => c.id));
  if (ids.size !== circuits.length) fail('circuit ids in circuits.json are not unique');

  return circuits.map((circuit) => {
    const cached = cache.circuits[circuit.id];
    if (!cached) fail(`${circuit.id}: not in circuit-rings.json — run with --fetch`);
    const same = (p, q) => p.length === q.length && p.every((v, i) => v === q[i]);
    if (
      !same(cached.pinned.relations, circuit.osm.relations) ||
      !same(cached.pinned.ways, circuit.osm.ways)
    ) {
      fail(
        `${circuit.id}: circuits.json pins ids the cache was not fetched for — run with --fetch`,
      );
    }
    return generateCircuit(circuit, cached, defaults);
  });
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const check = args.has('--check');

  if (args.has('--fetch')) {
    const circuitsFile = JSON.parse(await readFile(CIRCUITS, 'utf8'));
    await writeCache(circuitsFile.circuits);
  }

  const { circuitsFile, cache } = await loadInputs();
  const results = generateAll(circuitsFile, cache);
  const lengths = authoredLengths(await readFile(TRACKS, 'utf8'));

  const warnings = [];
  for (const r of results) {
    const authored = lengths.get(r.id);
    const ratio = authored ? (r.measured - authored) / authored : Number.NaN;
    if (!check) {
      console.log(`\n${r.id}: ${r.ringWays.length} ways, ${r.rawPoints} → ${r.points} points`);
      for (const line of [...r.log, ...r.decisions]) console.log(`  ${line}`);
      if (r.corners.length > 0) console.log(`  corners in order: ${r.corners.join(' ')}`);
    }
    if (!(Math.abs(ratio) <= LENGTH_WARN_RATIO)) {
      warnings.push(
        `${r.id}: measured ${(r.measured / 1000).toFixed(3)} km against authored ` +
          `${authored ? (authored / 1000).toFixed(3) : '?'} km (${(ratio * 100).toFixed(1)}%)`,
      );
    }
  }

  console.log('\n id   points  tolerance  measured   authored   start-line offset');
  for (const r of results) {
    const authored = lengths.get(r.id);
    console.log(
      ` ${r.id}  ${String(r.points).padStart(6)}  ${r.tolerance.toFixed(2).padStart(7)} m  ` +
        `${(r.measured / 1000).toFixed(3)} km  ${authored ? (authored / 1000).toFixed(3) : '    ?'} km  ` +
        `${r.startOffset.toFixed(1)} m`,
    );
  }
  for (const warning of warnings) console.warn(`warning: ${warning}`);

  const formatted = await render(results, cache);
  if (check) {
    const current = await readFile(OUT, 'utf8').catch(() => null);
    if (current !== formatted) {
      console.error('\ntrackPaths.ts is out of sync with circuits.json / circuit-rings.json.');
      console.error('Run: node docs/assets/generate-track-paths.mjs');
      process.exit(1);
    }
    console.log('\ntrackPaths.ts is in sync.');
  } else {
    await writeFile(OUT, formatted, 'utf8');
    console.log(
      `\nwrote src/features/track-records/data/trackPaths.ts (${formatted.length} bytes)`,
    );
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error) => {
    console.error(error instanceof GeneratorError ? `error: ${error.message}` : error);
    process.exit(1);
  });
}
