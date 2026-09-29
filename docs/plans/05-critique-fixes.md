# 05 — Fix what the design critique found

## Goal

A design critique of the live build (`9642bc1`, measured in headless Chrome at
1440×900 and 390×844) found one layout regression, one collision that shows on
nearly every phone screen, navigation that vanishes on desktop, a Track Records
section whose biggest number is the least important one, and type too small to
read where it carries meaning. The owner added a fifth item: the hero's helmet
reveal shows a seam at the neck and shoulders.

This workstream fixes those. It does not touch anything waiting on material
from Yavuz — see **Out of scope**.

## Reasoning

### What was measured, not guessed

- **`<Picture>` leaks its `<source>` elements into layout.** It renders
  `<picture class="contents">`, so the picture box disappears and Chrome
  blockifies both `<source>` tags (computed `display: block`) into items of the
  surrounding flex or grid. In Setup's two-column grid the first source takes
  column 2 of row 1 and the photo drops to row 2: its top was 9176 against the
  list's 8731, and the section was 1397px tall. In the hero marquee (`gap: 72px`)
  every raster logo brings two extra gaps, measured 216/72/216/216px. Injecting
  `picture > source { display: none }` gave 8731/8731, a 952px section and
  72/72/72/72. `display: none` on a `<source>` does not affect which source the
  browser picks. This slipped in with 03's AVIF work and no test noticed.
- **The mobile top bar is fixed and transparent**, so "YAVUZ EYMEN" is drawn
  over body copy, cards, photos and the Content counters on nearly every screen
  after the hero.
- **Desktop has no navigation after the hero.** The wordmark, the hamburger and
  the PAGES / FOLLOW ON columns are all `absolute` and scroll away with it. The
  scroll rail is mouse-only and `aria-hidden`. A side effect: 02's scroll-spy
  can only ever light "Home" on desktop, because the column it lights is off
  screen everywhere else.
- **On a phone the first call to action is ~10,900px down.** The hero's
  Business Enquiries button is `hidden md:inline-block` and the menu does not
  offer it.
- **Track Records leads with a stopwatch.** The largest figure in the section
  (38–44px) is the running lap clock — `0:08.044` at a random moment — while the
  personal best the section is named for sits at list size.
- **Small type.** 32 text elements render at 9px on mobile; 71 of 170 on
  desktop are under 12px. Many carry meaning: the About stat labels, the
  Content stat captions, the Setup row names, the hero team card, photo
  captions, `Lap time` and `S1–S3`.
- **Turkish casing on English names.** Career renders "NOGRİPSİMRACİNG'İN" and
  "SİM RACİNG'E" because `text-transform: uppercase` under `lang="tr"` maps
  `i` → `İ`; the footer spells the same brand "NOGRIPSIMRACING". The Nav already
  solves this with `lang="en"` on English labels.
- **Contrast is fine** — zero failures across every text element measured,
  composited against its real background. Nothing here should lower a colour.

### The helmet seam

The two hero photos are the same crop of the same pose, but the bodies do not
line up exactly at the neck and shoulders. Wherever the cursor circle's edge
crosses them the mismatch shows. The owner drew the line: below the neck, just
under the helmet's chin bar, the helmeted photo must never show; only the
helmet itself is revealed. The fix is a second, static mask intersected with
the cursor circle, authored in the images' own 1323 × 1189 coordinate space so
it tracks the images at every size. **Do not crop, resize or re-export either
photo** — CLAUDE.md forbids it, and the alignment is the whole effect.

### Out of scope, deliberately

- **Anything placeholder.** Hiding Setup until its hardware list exists, the
  karting slot, and the Content cards reusing Sim to Real photos are all
  waiting on material. The owner asked for them to stay as they are.
- **The 1280 / 1360 container alternation** that shifts section headings 40px
  left at 04–06. It comes from the design handoff.
- **The helmet covering "LIMIT."** while the cursor rests on the face.
  `Hero.tsx` records it as intended.

## Steps

Four units with no shared files, built in parallel and merged in this order.

**A — Navigation** (`sections/Nav/`)

1. On mobile, give the fixed bar a background once the page has scrolled, so
   the wordmark never sits on content.
2. On desktop, show a compact fixed bar once the hero has left the viewport:
   wordmark, the four `NAV_ITEMS` with the scroll-spy's `aria-current`, and the
   Business Enquiries CTA. It must clear the scroll rail and honour reduced
   motion.
3. Add Business Enquiries to the overlay menu.
4. Make the hamburger at least 44 × 44.

**B — Track Records hierarchy** (`features/track-records/`,
`sections/TrackRecords/TrackRecordsPlaceholder.tsx`, `docs/TRACK_RECORDS.md`)

1. Make the personal best the dominant figure in the panel, and the running
   clock secondary.
2. Raise `Lap time` and `S1–S3` to at least 11px.
3. Keep the placeholder's footprint in step with the panel.

**C — Type and layout** (`components/ui/Picture.tsx`, `data/career.ts`, and
the About, Career, Achievements, Sim to Real, Content, Setup, Contact and Hero
sections)

1. Hide `<picture>`'s `<source>` elements from layout, with a test.
2. Raise meaning-bearing labels to at least 11px on both viewports. Decorative
   kickers and placeholder copy may stay at 9–10px.
3. Mark English and brand words inside Turkish titles `lang="en"`.
4. On mobile, stack Achievements tags above their titles, as desktop does.
5. Bring the Contact social links to 44px and the footer links to at least
   24px tall.
6. Show the role line ("Professional sim racing driver & content creator") on
   mobile, not only on desktop.

**D — Helmet mask** (`sections/Hero/HeroPortrait.tsx`, `helmetReveal.ts`,
`useHelmetReveal.ts`)

1. Intersect the cursor reveal with a static helmet-region mask whose lower
   edge follows the neck line. Apply it on desktop (cursor) and mobile (iris).

## Done when

- At 390×844, the wordmark overlaps no text at any scroll position.
- At 1440×900 past the hero, the nav and the CTA are on screen and the active
  item is marked.
- Setup's photo sits beside its list, and the marquee gaps are even.
- The personal best is the largest number in Track Records.
- No meaning-bearing label renders below 11px.
- With the cursor anywhere on the portrait, the helmeted photo never shows
  below the neck line.
- `pnpm build && pnpm lint && pnpm test` are green.

## Progress

- [x] A — Navigation
- [ ] B — Track Records hierarchy
- [x] C — Type and layout
- [ ] D — Helmet mask
- [ ] Docs swept for stale to-dos; ROADMAP and plans README updated
