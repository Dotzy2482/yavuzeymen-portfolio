# 06 — Put Yavuz's real material on the site

## Goal

Until November 2026 the site ran on the design handoff's material: invented lap
times on circuits Yavuz never drove, the team's sponsors presented as his,
placeholder hardware, low-resolution working copies of the photos, illustrative
Instagram figures and reel cards that were stills. This workstream replaced
every piece of that with Yavuz's own material as it arrived, in one long
session, and recorded what it decided along the way.

Unlike 01–05 it was not planned up front: the material arrived piece by piece
from the owner and Yavuz, and each piece was landed as it came. This file is
the record, written after the fact, so the next session knows what is real now,
where it came from, and what is still waiting.

## Reasoning

### Lap times: one number per circuit, and no circuit without one

Yavuz's iRacing profile lists a best per car, per layout and per session. The
site shows one number per circuit, so the rule is the fastest lap there in any
car and any session, with `track.car` naming the car. A circuit he has no lap
at is not listed: the nine handoff circuits he never drove left with their
invented times rather than keep a number that was not his. The layout drawn is
the layout the time is for — the Nordschleife alone ("Industriefahrten"), not
the 24h combined layouts; Fuji with the chicane. See
[TRACK_RECORDS.md](../TRACK_RECORDS.md#real-lap-times).

Overpass was down for every instance tried, so the generator gained
`--fetch --changed --api`: the main OSM API, and only new or re-pinned
circuits, leaving the rest of the cache byte for byte.

### Whose sponsor is it

gelbura, SPARDOX and DriveHunter sponsor Team Curve Hunters, not Yavuz. A strip
of logos under his portrait reads as "backed by", so they left the hero strip
and the Partners grid with their files. Partners is one card for his team, in
its own colours, and a "become a partner" line instead of empty dashed cells —
one logo beside five empty slots read as a vacancy notice.

### Real numbers only, and read signed in

The Content counters went through three wrong versions before the right one,
and the lesson is worth keeping: **Instagram shows a signed-out visitor only
the latest twelve reels**, and in a Turkish-locale browser it writes counts as
`84,6 B` (bin, thousand) and `797 B`. Read signed out, the best reel looked like
7,810 views; read signed in, all 346 reels, it is 797,000 — the handoff's
"797K" was real. TikTok is not his main platform; the owner said so. The
counters are a dated snapshot of the signed-in reading, with the total stated
as a floor because Instagram rounds everything past ten thousand.

### The fan: one full clip at a time, and cards that actually move

Five full 540 × 960 clips decoding at once inside a fan that rotates and
scrolls made the section stutter. Playing only the centre card fixed that but
looked dead, so the side cards loop 270 × 480 / 24 fps previews (a quarter of
the pixels, 84–200 KB) and the fan is a playlist: the centre clip plays once,
then every card travels one slot left — the card itself, with its position,
size and tilt, not the picture inside a fixed frame, which the owner read as
broken. Clicking a card to move the fan made cards jump two slots and swing
across each other, so clicks were dropped: reel cards are links to the reel,
footage cards are not clickable, and ← → buttons under the fan, either side
of an "03 / 09" counter, step it.

Which reels: the first cut used his five most-watched (797K down), F1-game
crash memes. Yavuz did not like how they represented him and picked his
own — four reels of his iRacing work with a facecam — so the fan shows
those, **with no view counts**: they were chosen for how they look,
not how they did. The view figures live on in the counters only.

### Photos: originals first, AI only where it adds pixels

The professional set (`rv__*`) is 6–8K and is used as is. The low-res files on
the site turned out to be crops of photos in the delivery, so they were re-cut
from the originals. Gemini "upscales" of three phone photos came back smaller
than the originals and were not used; the About portrait was a real gain and,
checked against the original, kept its face and text. The owner's own photo
was in the delivery and is used nowhere.

### The logo

Several rounds: a traced flat monogram, an upright redraw, a "modern" gradient
pass the owner rejected, sheets of SVG concepts, and finally a Gemini concept
Yavuz picked, traced with marching squares rather than redrawn so the slashes
sit where the artwork put them, in his colour choice (purple Y, navy E). The
monogram and the name were never to sit side by side: the bar carries the mark,
the hero carries the name.

## Steps

1. Real lap times, cars and circuits; generator `--changed --api`.
2. Setup hardware, contact links from `.env.local`, Kick in the social row.
3. Partners: TCH only; team sponsors and their files removed.
4. Hero bar: Kick live status, Business Enquiries, scroll cue.
5. The YE monogram: favicon, touch icon, nav mark; name moved to the hero.
6. Sim to Real and Setup photos from the originals; karting slot filled.
7. Content: footage loops, then the playlist fan with previews and arrows,
   five Instagram reels linked, real counters.
8. Setup: Yavuz's own rig with numbered markers; the full PC list.

## Done when

Every number, name, logo and photo on the page is Yavuz's own or his team's
and says where it came from in `data/` or `docs/CONTENT.md`; `pnpm build`,
`pnpm lint`, `pnpm test`, `pnpm images --check` and the track generator's
`--check` pass.

## Progress

- [x] 1 — lap times and circuits ([PR #29](https://github.com/Dotzy2482/yavuzeymen-portfolio/pull/29))
- [x] 2 — Setup rows, contact links, Kick (PR #29)
- [x] 3 — Partners (PR #29)
- [x] 4 — hero bar and Kick live status (PR #29)
- [x] 5 — the YE monogram (PR #29)
- [x] 6 — photos from the originals (PR #29)
- [x] 7 — Content playlist, reels and counters ([PR #30](https://github.com/Dotzy2482/yavuzeymen-portfolio/pull/30))
- [x] 8 — annotated Setup (PR #30)

### Still waiting on material — not a step of this plan

- **Live iRacing figures.** A request for a Password Limited OAuth client went
  to auth@iracing.com on 26 Nov 2026; iRacing has paused client creation. When
  a client arrives: a daily scheduled job, credentials in repository secrets.
- **Sim screenshots** from Yavuz, for Sim to Real or a gallery of their own.
- **Shifter** — a Logitech Driving Force shifter seems to be beside the wheel
  in the rig photo; not listed until Yavuz confirms.
- Legal page copy, a domain (`og:url`, canonical), a phone number if wanted.
