# Plans

One file per workstream, numbered in the order they must land. Each is written
to be picked up cold: a session opens one plan, works it to its **Done when**
bar, and stops.

## The rule

**One plan per session.** The split exists so a session sees only the work in
front of it. The numbering is a dependency chain, not a preference — `04` needs
what `03` lands.

Tick the **Progress** list as each step goes in, and commit it with the work.
That list is the whole resume mechanism: the next session reads it to find where
the last one stopped.

## Order

| #                                      | Workstream                 | Depends on | Touches                                          |
| -------------------------------------- | -------------------------- | ---------- | ------------------------------------------------ |
| [01](01-awaken-the-last-third.md)      | Awaken the last third      | —          | **Landed.** Kept for the reasoning it records.   |
| [02](02-social-card-and-scroll-spy.md) | Social card and scroll-spy | —          | **Landed.** Kept for the reasoning it records.   |
| [03](03-weight-and-wiring.md)          | Weight and wiring          | —          | assets, `index.html`, `app/App.tsx`, small fixes |
| [04](04-real-circuit-geometry.md)      | Real circuit geometry      | `03`       | `docs/assets/`, `features/track-records/data`    |

`01` and `02` have landed; their files stay because the **Reasoning** sections
are the only record of why the scrub was built the way it was, and why the
scroll-spy highlights on an exact match only. `03` is independent but must
precede `04`, which adds ~36 kB of path data to a chunk `03` makes lazy, and
which `03` spares from having to touch `TrackRegion`.

## Why the reasoning sections are long

A later session can re-read the code and work out _what_ exists. It cannot
re-derive _why_ a decision went the way it did — why the start/finish problem is
solved by rotating geometry rather than adding a field, why no `ScrubFill`
primitive. Those decisions were made once, with the whole codebase in view, and
the **Reasoning** section is the only place they survive. Read it before the
steps; it is what stops the work being redesigned from scratch each time.

## What is not here

Anything blocked on material from Yavuz — real lap times, the setup hardware
list, contact environment values, hi-res photography, the karting photo,
refreshed Instagram figures, legal page copy. Those stay in
[ROADMAP.md](../ROADMAP.md) and get no plan, because no amount of planning
unblocks them. Every plan here is completable with zero external input.
