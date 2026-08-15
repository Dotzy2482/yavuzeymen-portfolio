# yavuzeymen-portfolio

Personal portfolio site for **Yavuz Eymen**, sim racing driver.

Single page, dark theme, scroll-driven, heavily animated. Its centrepiece is
the **Track Records** section: pick a circuit, watch a lap play back around the
outline while the timer counts out the real lap time.

> **Status: scaffold.** The structure is complete and runs, but nothing is
> implemented. Every component is a typed stub with a JSDoc header and TODOs.
> The visual design is still in progress, so styling and animation are
> deliberately absent.

---

## Getting started

Requires Node 24 (see `.nvmrc`) and pnpm.

```bash
pnpm install
```

```bash
pnpm dev
```

You get a page listing the eleven section headings as placeholders. That is the
intended output at this stage.

### Scripts

| Script              | What it does                        |
| ------------------- | ----------------------------------- |
| `pnpm dev`          | Vite dev server                     |
| `pnpm build`        | Typecheck, then production build    |
| `pnpm preview`      | Serve the production build locally  |
| `pnpm typecheck`    | `tsc -b` with no emit               |
| `pnpm lint`         | ESLint                              |
| `pnpm format`       | Prettier, write                     |
| `pnpm format:check` | Prettier, check only (what CI runs) |
| `pnpm test`         | Vitest, single run                  |
| `pnpm test:watch`   | Vitest, watch mode                  |

### Environment

Copy `.env.example` to `.env.local` and fill it in. `.env.local` is git-ignored;
`.env.example` holds key names only, never values.

```bash
cp .env.example .env.local
```

The site must render with an empty `.env` — every variable is optional and
resolves to an empty string.

---

## Stack

| Concern   | Choice                                |
| --------- | ------------------------------------- |
| Build     | Vite + React 19 + TypeScript (strict) |
| Styling   | Tailwind CSS v4                       |
| Animation | `motion` (framer-motion)              |
| Testing   | Vitest + Testing Library              |
| Quality   | ESLint + Prettier                     |
| Packages  | pnpm                                  |

---

## Folder structure

```
src/
  app/                 App shell and cross-cutting providers
  sections/            The eleven page sections, one folder each
    Nav/ Hero/ About/ TrackRecords/ Career/ Achievements/
    SimToReal/ Content/ Setup/ Partners/ Contact/
  components/
    ui/                SectionHeading, StatValue, Tag, Button, Divider
    motion/            Reveal, Stagger, ParallaxLayer, CountUp
  features/
    track-records/     Isolated feature module — see below
      components/      TrackRecords, TrackList, TrackListItem, TrackPanel,
                       TrackMap, CarMarker, DriverLabel, LapTimer,
                       SectorBar, PlaybackControls
      hooks/           useTrackSelection, usePlayback, useLapAnimation,
                       usePathPoint
      data/            tracks.ts, types.ts
      lib/             formatLapTime.ts, svgPath.ts
      index.ts         The module's only public entry point
  hooks/               useInView, useMediaQuery, useRafLoop,
                       useScrollProgress, usePrefersReducedMotion
  lib/                 cn.ts, format.ts, constants.ts
  data/                profile, career, achievements, partners,
                       socialStats, setup
  styles/              tokens.css, globals.css
  types/               Shared type definitions
  test/                Vitest setup
```

---

## Architecture notes

**Track Records is a module, not a folder.** It is the largest and most
stateful part of the site — path geometry, a frame loop, playback transport,
selection state. It sits behind `features/track-records/index.ts`, which
exports `<TrackRecords />` and a few types and nothing else. The rest of the app
cannot reach past that boundary, so the internals can be rewritten without
touching a consumer. Everything else on the page is comparatively static and
does not need this treatment.

**`lapTimeMs` and `displayDurationMs` are separate on purpose.** An endurance
lap can run to eight real minutes; nobody watches a dot travel for eight
minutes. The animation completes in about twelve seconds while the timer counts
out the true lap time. Conflating them would force a choice between a correct
number and a watchable animation.

**Tokens live in CSS, not in a JS config.** `styles/tokens.css` defines every
colour, face, space and radius as a custom property, and `globals.css` maps
those into Tailwind's theme with `@theme inline`. Re-theming means editing one
file, and the same variables are available to raw CSS and inline SVG attributes
where Tailwind utilities do not reach.

**Motion is a wrapper layer.** `components/motion/` holds the animation
vocabulary — reveal, stagger, parallax, count-up — so sections compose
animations instead of each re-deriving them. Every wrapper must honour
`prefers-reduced-motion`; on a site this animation-heavy the opt-out is a
requirement, not a nicety.

**Hooks split intent from execution.** `usePlayback` owns what the visitor
wants (playing, speed, scrub position); `useLapAnimation` owns the frame loop
that acts on it. That split lets the controls be tested without a running
`requestAnimationFrame`.

**Data is typed and static.** `src/data/` holds hand-maintained content with
explicit interfaces. There is no CMS and no API integration; a live social-stats
fetch would need a server-side token, which a static site has nowhere to keep.

---

## Security

The repository is private today and will be made public. History is not going to
be rewritten, so nothing sensitive may enter it at any point — including the
first commit.

- **No contact details as literals.** `src/data/profile.ts` reads e-mail and
  phone from `import.meta.env`, never from source. Public profile URLs are
  fine, but go through the same path so all external references sit together.
- **`VITE_` variables are public.** Vite inlines them into the bundle; they are
  readable by anyone loading the site. They are kept out of git, which is not
  the same as being secret. Anything that must stay secret must **not** carry
  the `VITE_` prefix and belongs on a server.
- **Unreleased media** goes in `public/images/private/`, which is git-ignored.
  Move a file out of it only once its usage rights are confirmed.
- **CI scans for secrets.** `gitleaks` runs over the full history
  (`fetch-depth: 0`) on every push and PR, so a secret that was committed and
  later deleted still fails the build.

See [SECURITY.md](SECURITY.md) to report a vulnerability.

---

## Licence

[MIT](LICENSE)
