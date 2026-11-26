# 07 — Make it run smoothly

## Goal

The owner's words: "çok bir şey değiştirmeden… sıkıntılı olan yerler güzel
çalışsın, kasmasın" — without changing much, make the places that struggle
run well, without stutter. The first complaint, the Content fan, was five full
clips decoding at once and was fixed in 06 with previews. This workstream
measured the whole page and fixed what the numbers showed, with the rule that
nothing on screen looks or behaves differently: every animation, its timing,
its reduced-motion path and the design stay as they were.

## Reasoning

### How it was measured

The desktop app's browser pane fires no `requestAnimationFrame` callbacks, so
everything here comes from headless Chrome driven over the DevTools protocol:
`docs/assets/measure-frames.mjs`, against `pnpm build && pnpm preview`. The CPU
is throttled 4× after load so that what a fast desktop hides shows up. Each
scenario records frame deltas from an rAF loop in the page, main-thread time
from `Performance.getMetrics`, and a trace for paints and long tasks; a CPU
profile and a count of paints per DOM node were taken alongside to find the
causes.

Two things about the numbers matter for reading them:

- **Headless Chrome runs at the display's refresh rate**, here 165 Hz, so a
  frame is 6.06 ms and every delta is a multiple of it. A median of 12.1 ms
  means the page was making every other frame. **Main-thread work per frame**
  is the number that does not depend on the display, and it is the one that
  decides whether a 60 Hz phone keeps up.
- **Runs vary by 10–20 %** on a machine doing anything else. The before/after
  table below is the median of two runs of each build, alternated.

### What the numbers showed

Before any change, the main thread was busy for about 950 ms of every second
— at the top of the page, in the middle of it, with nothing on screen moving
but the ambient runners. A page that saturated has no room for a scroll, a
video frame or a hover, so whatever else happens drops frames. The causes, in
order of size:

1. **The hero's helmet loop ran on every frame of the whole page.** Its
   `useRafLoop` had no `active` flag beyond reduced motion, and every frame it
   called `getBoundingClientRect` on the stage and `offsetWidth` /
   `offsetHeight` on the helmet layer — after motion had already written
   styles in the same frame, so each read forced a style recalculation. It
   was the largest single item in the CPU profile, under every section.
2. **The ambient loops ran on the main thread, for ever.** The hero's colour
   fields drift with `x`, `y` and `scale` and loop with `repeatType: 'mirror'`;
   the scroll cue sweeps with `x` and a `repeatDelay`; the live pulse and
   Setup's marker pings use `scale`. Motion only hands an animation to the
   browser's compositor for `transform`/`opacity`/`filter`/`clipPath`/
   `backgroundColor`, and never with `mirror` or `repeatDelay`, so every one
   was script, a style recalculation and a repaint on every frame — and the
   fields are radial gradients half the size of the screen.
3. **The hero's drawing repainted every frame of the scroll.** Even as a
   `transform`, Chrome will not composite an animation on an `<svg>` element,
   so the racing-line drawing's slow drift was a main-thread repaint of the
   whole drawing; during a scroll that was most of the paints on the page.
4. **The runners ran where nobody could see them.** A dash offset is never
   compositor work. The hero's runners kept going under every other section,
   and the page ambient's kept going behind the hero's opaque stage, where its
   layer is fully transparent.
5. **The page ambient was one painted layer.** Its two scroll-driven colour
   fields, the masked dot grid and the lines all painted into the fixed layer,
   so every scroll frame that moved a field, and every frame a runner moved,
   repainted the masked grid and both screen-sized gradients with it.
6. **The lap animation forced a layout every frame.** It read the panel's
   `clientWidth` / `clientHeight` after writing the chronometer's text and the
   sector widths, both of which invalidate layout.

### What changed, and why it looks the same

- **The hero's loop runs only while the stage is on screen** (an
  IntersectionObserver in `HeroStage`, one pixel inside each viewport edge so
  that a stage merely touching the edge — where the "About" link leaves it —
  counts as gone). Inside the hero, a frame with the cursor off the page and
  the helmet shut returns before reading any layout: `amount` became a
  function the reveal calls only when it needs it, and the circle's centre
  still drifts home to the head from where the head was last measured, as the
  full update does. The helmet layer's size is read by a `ResizeObserver`
  instead of on every frame; the values are the same `offsetWidth` /
  `offsetHeight`, read where layout is already clean.
- **Every ambient loop that can be composited now is.** Same values, same
  durations, same eases, written so motion can hand them over:
  - `x`/`y`/`scale` became whole `transform` keyframes. Motion builds
    `translateX() translateY() scale()` from them in that order, so
    `'translateX(-4%) translateY(-2%) scale(1)'` is the same transform.
  - `repeatType: 'mirror'` became `'reverse'`. For a symmetric ease such as
    `easeInOut`, playing a leg backwards traces exactly the curve that playing
    it forwards with the keyframes swapped does, which is all `mirror` means.
  - The scroll cue's `repeatDelay: 0.4` became a 2.6 s loop whose last 0.4 s
    holds the end keyframe. The cue sits past the end of its clipped track
    there, invisible, as it did during the delay.
  - The hero drawing's drift moved from the `<svg>` to a `div` wrapper with
    the svg's old box; the svg fills it, so `translateX(%)` means the same.
- **The runners hold while they cannot be seen**, through `useLoop`, a motion
  value animated with `animate()` that stops and picks up where it left off.
  A runner's dash pattern repeats every loop length, so running from wherever
  it stopped to one loop further is indistinguishable from running from zero.
  The hero's hold while the stage is off screen; the page ambient's while its
  presence is zero.
- **The page ambient's fields and lines got their own compositor layers**
  (`will-change-transform`). Their transforms only ever translate, so the
  layers are rasterised once at scale 1 and never resampled. A scroll frame
  now moves layers; a runner frame repaints the lines.
- **The lap animation reads the panel size first**, before any write.

### What was looked at and left alone

- **The Content fan** was already on previews. Its playing frame is now mostly
  the page ambient's runner repaint and the video layers; its worst frames
  went down with everything else. Promoting the cards to layers was not
  tried: a card grows from 0.70 to 1.0 as it travels to the centre, and a
  layer rasterised at the smaller scale would be soft at the larger one.
- **The hero's mobile scroll-scrub** repaints the helmet layer's mask every
  frame. That repaint is the effect; nothing cheaper draws it.
- **Motion's own scroll measurement** (every `useScroll` re-measures its
  target on each scroll event) is the largest script item left during a
  scroll, about a quarter of a millisecond a frame at 4×. It is the library's
  work and was not worth replacing.
- **First visit.** A cold, cache-disabled scroll showed no long tasks; the
  Track Records chunk and the images arrive without a hitch. Images decode off
  the main thread already, so `decoding` hints would change nothing measured.
- **Bundle and fonts.** The main chunk is 410 kB (133 kB gzipped), mostly
  React and motion; Track Records is its own 40 kB chunk. Fonts are
  self-hosted with the hero's three preloaded. Nothing to gain here for
  smoothness.

## Steps

1. Build the harness and measure the baseline at 4× throttling: full-page
   scrolls at 1440×900 and 390×844, the hero idle and under the cursor, the
   fan playing, idle frames under Career, Track Records, Setup and About.
2. Profile and count paints per node to find what runs every frame.
3. Stop the hero's loop off screen; drop its per-frame layout reads.
4. Hand every compositable ambient loop to the compositor.
5. Hold the runners while unseen; give the page ambient's moving parts layers.
6. Read before writing in the lap animation.
7. Re-measure both builds, alternated, three runs each; check screenshots.

## Done when

`pnpm build`, `pnpm lint`, `pnpm test`, `pnpm images --check` and the track
generator's `--check` pass; frame times are measurably better where they were
bad; screenshots show nothing changed; a PR is open.

## Results

Base `ee9edb6` → this branch, headless Chrome at 165 Hz (a frame is 6.06 ms), median of two alternated runs of each build. Work per frame is main-thread time per delivered frame and is the number to compare.

| Scenario (4× CPU)        | Work/frame ms     | Median ms   | p95 ms       | Frames >33 ms | Script ms/s |
| ------------------------ | ----------------- | ----------- | ------------ | ------------- | ----------- |
| Scroll, 1440×900         | 10.53 → **8.87**  | 12.05 → 6.1 | 18.2 → 18.2  | 1 → 2.5       | 270 → 250   |
| Hero, idle               | 6.88 → **4.79**   | 6.1 → 6.1   | 12.15 → 6.2  | 0 → 0         | 151 → 86.5  |
| Hero, cursor reveal      | 8.07 → **5.75**   | 6.1 → 6.1   | 12.2 → 9.15  | 1 → 1         | 163.5 → 123 |
| Content fan playing      | 9.6 → **8.24**    | 12.1 → 12.1 | 12.2 → 12.2  | 0.5 → 0.5     | 126.5 → 58  |
| Idle under Career        | 8.31 → **6.01**   | 6.15 → 6.1  | 12.2 → 12.1  | 0 → 0         | 144 → 78    |
| Idle, Track Records lap  | 12.44 → **10.71** | 12.1 → 12.1 | 18.2 → 12.25 | 0 → 0         | 155.5 → 105 |
| Idle under Setup         | 8.2 → **6.28**    | 6.1 → 6.1   | 12.2 → 12.1  | 0 → 0         | 142.5 → 67  |
| Scroll, 390×844 mobile   | 10.41 → **8.19**  | 12.1 → 6.1  | 18.2 → 18.15 | 0 → 0         | 235 → 237   |
| Mobile, idle under About | 7.55 → **5.32**   | 6.1 → 6.1   | 12.2 → 6.2   | 0 → 0         | 140 → 73    |

## Progress

- [x] 1 — harness and baseline
- [x] 2 — profile and paint counts
- [x] 3 — hero loop on screen only, no idle layout reads
- [x] 4 — compositor loops
- [x] 5 — runners hold unseen; page ambient layers
- [x] 6 — lap animation reads first
- [x] 7 — re-measured, screenshots compared
