/**
 * Encodes every raster under public/images/ to AVIF and WebP, written beside
 * the original at the original's exact pixel size:
 *
 *   public/images/simtoreal/fiat-front.png
 *     → public/images/simtoreal/fiat-front.avif
 *     → public/images/simtoreal/fiat-front.webp
 *
 *   pnpm images            # encode whatever is new or has changed
 *   pnpm images --force    # re-encode everything
 *   pnpm images --check    # assert every encode exists and is current;
 *                          # writes nothing, exits 1 if anything is off
 *
 * The page asks for the encodes through <Picture> (components/ui), which
 * derives both sibling paths from the original's and keeps the original as the
 * <picture> fallback. So an original with no encodes beside it is a broken
 * image in every modern browser, not a slower one — which is why --check
 * exists, and why encode-images.test.mjs runs it under `pnpm test`.
 *
 * WHY sharp. Encoding AVIF needs a real encoder, and there is no way to do it
 * with what Node or the browser ships. sharp is a devDependency: it runs here,
 * at author time, writes files into public/, and never reaches the bundle.
 * Its native binary arrives as a prebuilt optional dependency, so it needs no
 * install script and pnpm-workspace.yaml's allowBuilds stays as it was.
 *
 * NEVER RESIZE. Every encode is the original's exact size, and --check
 * asserts it. The two hero portraits are stacked pixel-for-pixel by the helmet
 * reveal, and every raster on the page declares its intrinsic width/height —
 * the hero marquee and the Sim to Real gallery both measure layout from them.
 *
 * STALENESS. Replacing an original under the same filename is the documented
 * way hi-res photography arrives (docs/CONTENT.md). Without a record of what
 * each encode was made from, the old encodes would keep winning the <picture>
 * and the new photo would never be seen. encoded-images.json records each
 * original's SHA-256 and the settings its encodes were made with; a mismatch
 * on either marks it stale. It is the only state this script keeps.
 */

import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

// Paths built from strings, not `new URL(…, import.meta.url)`: under Vitest's
// jsdom environment `URL` is jsdom's, which node:url will not accept.
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '../../public/images');
const MANIFEST = join(HERE, 'encoded-images.json');

/** Originals. Everything else under public/images/ is either vector or ours. */
const SOURCE_EXT = /\.(png|jpe?g)$/i;
const ENCODED_EXT = /\.(avif|webp)$/i;

/** Git-ignored holding area for media without confirmed usage rights. */
const SKIP_DIRS = new Set(['private']);

/**
 * Three kinds of raster, three sets of settings. Chosen by eye against the
 * original at 1× and 2×, not by metric.
 *
 * `photo` is photography whose original is lossless — the two hero cut-outs,
 * whose alpha both encoders carry through untouched, and the photos that
 * arrived as PNG. Every pixel is real detail, and the hero portrait is shown
 * larger than native on a 2× screen, so this is the highest photo setting: at
 * 55 the beard and skin texture visibly smear; at 65 they hold.
 *
 * `jpeg` is photography whose original is already lossy. Spending bits here
 * mostly preserves the JPEG's own artefacts, so it runs lower — and at 65 the
 * AVIF of a JPEG came out larger than the WebP, which the browser would still
 * pick first.
 *
 * `graphic` is the partner logos: flat colour, hard edges, alpha. Lossless WebP
 * is exact and smaller than the PNG. AVIF stays lossy but high, because its
 * lossless mode is no smaller than the PNG on art this small. (spardox's AVIF
 * is 2 kB larger than its 3.5 kB PNG at any setting; one rule for every raster
 * is worth more than those 2 kB.)
 */
const PROFILES = {
  photo: {
    avif: { quality: 65, effort: 9 },
    webp: { quality: 80, effort: 6 },
  },
  jpeg: {
    avif: { quality: 55, effort: 9 },
    webp: { quality: 78, effort: 6 },
  },
  graphic: {
    avif: { quality: 80, effort: 9 },
    webp: { lossless: true, effort: 6 },
  },
};

function profileFor(path) {
  if (path.startsWith('partners/')) return 'graphic';
  return /\.jpe?g$/i.test(path) ? 'jpeg' : 'photo';
}

function settingsHash(profile) {
  return createHash('sha256').update(JSON.stringify(PROFILES[profile])).digest('hex').slice(0, 12);
}

/** Paths relative to public/images/, POSIX separators, sorted. */
async function walk(dir = ROOT) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) out.push(...(await walk(full)));
    } else {
      out.push(relative(ROOT, full).split(sep).join('/'));
    }
  }
  return out.sort();
}

const siblings = (path) => ({
  avif: path.replace(SOURCE_EXT, '.avif'),
  webp: path.replace(SOURCE_EXT, '.webp'),
});

async function readManifest() {
  try {
    return JSON.parse(await readFile(MANIFEST, 'utf8'));
  } catch {
    return {};
  }
}

async function sha256(path) {
  return createHash('sha256')
    .update(await readFile(join(ROOT, path)))
    .digest('hex');
}

async function exists(path) {
  try {
    await stat(join(ROOT, path));
    return true;
  } catch {
    return false;
  }
}

/**
 * Everything wrong with the current state, as human-readable lines. Empty means
 * every original has current, correctly sized encodes and nothing is orphaned.
 */
export async function check() {
  const files = await walk();
  const sources = files.filter((f) => SOURCE_EXT.test(f));
  const manifest = await readManifest();
  const problems = [];

  for (const path of sources) {
    const entry = manifest[path];
    const profile = profileFor(path);
    if (!entry) {
      problems.push(`${path}: never encoded`);
      continue;
    }
    if (entry.sha256 !== (await sha256(path))) {
      problems.push(`${path}: changed since it was encoded`);
    }
    if (entry.settings !== settingsHash(profile)) {
      problems.push(`${path}: encoded with different settings`);
    }
    const original = await sharp(join(ROOT, path)).metadata();
    for (const encoded of Object.values(siblings(path))) {
      if (!(await exists(encoded))) {
        problems.push(`${encoded}: missing`);
        continue;
      }
      const meta = await sharp(join(ROOT, encoded)).metadata();
      if (meta.width !== original.width || meta.height !== original.height) {
        problems.push(
          `${encoded}: ${meta.width}×${meta.height}, original is ${original.width}×${original.height}`,
        );
      }
    }
  }

  const expected = new Set(sources.flatMap((s) => Object.values(siblings(s))));
  for (const path of files.filter((f) => ENCODED_EXT.test(f))) {
    if (!expected.has(path)) problems.push(`${path}: no original beside it`);
  }
  for (const path of Object.keys(manifest)) {
    if (!sources.includes(path)) problems.push(`encoded-images.json: ${path} no longer exists`);
  }

  return problems;
}

async function encode({ force }) {
  const sources = (await walk()).filter((f) => SOURCE_EXT.test(f));
  const previous = await readManifest();
  const manifest = {};
  const rows = [];

  for (const path of sources) {
    const profile = profileFor(path);
    const settings = settingsHash(profile);
    const hash = await sha256(path);
    const out = siblings(path);
    const prior = previous[path];
    const current =
      !force &&
      prior?.sha256 === hash &&
      prior?.settings === settings &&
      (await exists(out.avif)) &&
      (await exists(out.webp));

    if (!current) {
      const input = join(ROOT, path);
      await sharp(input).avif(PROFILES[profile].avif).toFile(join(ROOT, out.avif));
      await sharp(input).webp(PROFILES[profile].webp).toFile(join(ROOT, out.webp));
    }
    manifest[path] = { sha256: hash, profile, settings };

    const size = async (p) => (await stat(join(ROOT, p))).size;
    rows.push({
      file: path,
      encoded: current ? 'current' : 'now',
      original: await size(path),
      avif: await size(out.avif),
      webp: await size(out.webp),
    });
  }

  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

  const total = (key) => rows.reduce((sum, row) => sum + row[key], 0);
  const kb = (n) => `${(n / 1024).toFixed(1)} kB`;
  console.table(
    rows.map((r) => ({ ...r, original: kb(r.original), avif: kb(r.avif), webp: kb(r.webp) })),
  );
  console.log(
    `originals ${kb(total('original'))}  ·  avif ${kb(total('avif'))}  ·  webp ${kb(total('webp'))}`,
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  if (process.argv.includes('--check')) {
    const problems = await check();
    if (problems.length) {
      console.error(`${problems.length} problem(s) — run \`pnpm images\`:`);
      for (const p of problems) console.error(`  ${p}`);
      process.exit(1);
    }
    console.log('Every raster under public/images/ has current AVIF and WebP encodes.');
  } else {
    await encode({ force: process.argv.includes('--force') });
  }
}
