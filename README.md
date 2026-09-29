# yavuzeymen-portfolio

Personal portfolio site for **Yavuz Eymen** — sim racing driver, Team Curve
Hunters main driver, founder of NoGripSimRacing.

Single page, dark, scroll-driven. Its centrepiece is the **Track Records**
section: pick a circuit and read its personal best while a lap plays back
around the real outline, drawn from OpenStreetMap.

Headings and UI are English; body copy is Turkish. That split is deliberate.

---

## Getting started

Requires Node 24 (see `.nvmrc`; `package.json` accepts 22 and up) and pnpm.

```bash
pnpm install
```

```bash
pnpm dev
```

Then open http://localhost:5173.

### Environment

```bash
cp .env.example .env.local
```

Fill in what you have. The site renders fine with an empty file — every
variable is optional and resolves to an empty string. `.env.example` holds key
names only, never values.

---

## Scripts

| Script               | What it does                                                                            |
| -------------------- | --------------------------------------------------------------------------------------- |
| `pnpm dev`           | Vite dev server                                                                         |
| `pnpm build`         | Typecheck, then production build                                                        |
| `pnpm preview`       | Serve the production build locally                                                      |
| `pnpm typecheck`     | `tsc -b`, no emit                                                                       |
| `pnpm lint`          | ESLint                                                                                  |
| `pnpm lint:fix`      | ESLint with `--fix`                                                                     |
| `pnpm format`        | Prettier, write                                                                         |
| `pnpm format:check`  | Prettier, check only (what CI runs)                                                     |
| `pnpm test`          | Vitest, single run                                                                      |
| `pnpm test:watch`    | Vitest, watch mode                                                                      |
| `pnpm test:coverage` | Vitest with coverage                                                                    |
| `pnpm images`        | Encode new or changed rasters under `public/images/` to AVIF + WebP; `--check` verifies |

---

## Stack

| Concern   | Choice                                  |
| --------- | --------------------------------------- |
| Build     | Vite + React 19 + TypeScript (strict)   |
| Styling   | Tailwind CSS v4 + CSS custom properties |
| Animation | `motion` (framer-motion)                |
| Testing   | Vitest + Testing Library                |
| Quality   | ESLint + Prettier                       |
| Packages  | pnpm                                    |

---

## Documentation

| Document                                       | What it covers                                                                   |
| ---------------------------------------------- | -------------------------------------------------------------------------------- |
| [CLAUDE.md](CLAUDE.md)                         | Working rules for this repo — conventions, constraints, known placeholders       |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)   | Folder layout, why Vite, data flow, the design token system                      |
| [docs/TRACK_RECORDS.md](docs/TRACK_RECORDS.md) | The animated circuit module in depth — data shape, animation, path rules         |
| [docs/CONTENT.md](docs/CONTENT.md)             | What content is real, what is placeholder, and where the real version comes from |
| [docs/ROADMAP.md](docs/ROADMAP.md)             | What is done, what is blocked on material, what is unscheduled                   |
| [docs/plans/](docs/plans/)                     | The workstreams the site was built in, and the reasoning behind each             |
| [SECURITY.md](SECURITY.md)                     | How to report a vulnerability                                                    |

Two things are worth knowing before reading any code:

- **`features/track-records/` is reachable only through its `index.ts`.** It is
  the one part of the site with real internal complexity, so it gets a real
  boundary.
- **Colour, type and spacing come from `styles/tokens.css`**, never from
  literals in components.

---

## Status

The design is fully implemented and the site runs. Outstanding work is content,
not construction — real lap times, real hardware, hi-res photography. The
circuit outlines are real geometry, generated from OpenStreetMap. See
[docs/ROADMAP.md](docs/ROADMAP.md).

---

## Security

This repository is public and its history will not be rewritten, so nothing
sensitive may enter it at any point.

- **No contact details as literals.** `src/data/profile.ts` reads e-mail, phone
  and social URLs from `import.meta.env`.
- **`VITE_` variables are public.** Vite inlines them into the bundle. Keeping
  them out of git is not the same as keeping them secret; anything genuinely
  secret must not carry the prefix and belongs on a server.
- **Unreleased media** goes in `public/images/private/`, which is git-ignored.
- **CI scans every new commit for secrets** with `gitleaks`, not just the
  tip, so a secret that was committed and removed again later in the same pull
  request still fails the build.

See [SECURITY.md](SECURITY.md) to report a vulnerability.

---

## Licence

[MIT](LICENSE), except the self-hosted typefaces in `public/fonts/` — Archivo,
Instrument Serif and Martian Mono — which are under the SIL Open Font License
1.1; see [public/fonts/OFL.txt](public/fonts/OFL.txt).
