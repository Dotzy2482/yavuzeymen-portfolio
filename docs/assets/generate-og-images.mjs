/**
 * Rasterises the two PNGs the document head needs and that nothing else in the
 * build can produce:
 *
 *   public/og-image.png         1200×630, from ./og-card.html
 *   public/apple-touch-icon.png   180×180, from ../../public/favicon.svg
 *
 *   node docs/assets/generate-og-images.mjs           # rewrite them
 *   node docs/assets/generate-og-images.mjs --check   # assert they are present
 *                                                     # and correctly sized
 *
 * Both sources stay editable and versioned; only their rasters ship. That is
 * the same bargain generate-helmet-wireframe.mjs makes, and for the same
 * reason: a committed binary whose origin nobody can reconstruct is a dead end
 * the next person cannot edit.
 *
 * WHY HEADLESS CHROME, AND NOT A LIBRARY. Rendering the card needs a real
 * layout engine — variable-font axes, radial gradients, SVG dash offsets — so
 * the choice is between a browser and a headless browser package. Chrome is
 * already installed on any machine that opens this site; adding ~300 MB of
 * devDependency to write two PNGs that change roughly never is not a trade
 * worth making. Set CHROME_PATH if the binary is somewhere unusual.
 *
 * WHY --check DOES NOT COMPARE BYTES. A screenshot is not reproducible across
 * Chrome versions, font-cache states or subpixel-rendering settings: the same
 * source yields visually identical, byte-different PNGs. Asserting equality
 * would fail on machines where nothing is wrong. So --check asserts what is
 * actually invariant — that both files exist and carry exactly the dimensions
 * index.html advertises in og:image:width / og:image:height. A card whose
 * content has drifted from its source is caught by looking at it, which is the
 * only way it was ever going to be caught.
 */

import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CARD = new URL('./og-card.html', import.meta.url);
const FAVICON = new URL('../../public/favicon.svg', import.meta.url);
const OG_IMAGE = new URL('../../public/og-image.png', import.meta.url);
const TOUCH_ICON = new URL('../../public/apple-touch-icon.png', import.meta.url);

/** 1.91:1, the aspect every major card renderer crops to. */
const OG_SIZE = { width: 1200, height: 630 };
/** iOS home-screen icon; Apple's largest, downscaled from there. */
const TOUCH_ICON_SIZE = { width: 180, height: 180 };

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA && `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);

async function findChrome() {
  for (const candidate of CHROME_CANDIDATES) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Next candidate.
    }
  }
  throw new Error(
    'no Chrome binary found. Set CHROME_PATH to one, e.g.\n' +
      '  CHROME_PATH="/c/Program Files/Google/Chrome/Application/chrome.exe" node docs/assets/generate-og-images.mjs',
  );
}

/**
 * Width and height straight out of the PNG's IHDR chunk: 8 bytes of signature,
 * then a 4-byte length and the 'IHDR' tag, then the two dimensions big-endian.
 * Cheaper and more honest than trusting the flag we passed Chrome.
 */
async function pngSize(path) {
  const buffer = await readFile(path);
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buffer.length < 24 || !buffer.subarray(0, 8).equals(signature)) {
    throw new Error(`${path} is not a PNG`);
  }
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

/**
 * Reads the raster back and asserts it is the size it was asked to be. Shared
 * by the write path and by --check, so the two cannot drift apart on what
 * "correct" means.
 */
async function assertSize(out, size, label) {
  const actual = await pngSize(fileURLToPath(out));
  if (actual.width !== size.width || actual.height !== size.height) {
    throw new Error(
      `${label} is ${actual.width}×${actual.height}, want ${size.width}×${size.height}`,
    );
  }
  return actual;
}

function run(binary, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', reject);
    child.on('close', (code) => {
      // Chrome is noisy on stderr even when it succeeds; only the code matters.
      if (code === 0) resolve();
      else reject(new Error(`chrome exited ${code}\n${stderr.trim()}`));
    });
  });
}

async function screenshot(chrome, { url, out, size, profile, label }) {
  await run(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    // Subpixel antialiasing bakes red/blue fringes into the raster, which a
    // feed then rescales. Grayscale AA survives that; LCD AA does not.
    '--disable-lcd-text',
    // Without this a HiDPI machine silently doubles every dimension.
    '--force-device-scale-factor=1',
    // Its own throwaway profile, so this never touches — or is blocked by — the
    // Chrome the person running it has open.
    `--user-data-dir=${profile}`,
    // Advances the clock so webfonts finish arriving before the frame is taken.
    // Without it the card rasterises in Archivo's fallback, which is not
    // obviously wrong until you compare it with the page.
    '--virtual-time-budget=15000',
    `--window-size=${size.width},${size.height}`,
    `--screenshot=${fileURLToPath(out)}`,
    url,
  ]);

  return assertSize(out, size, label);
}

/**
 * The touch icon is favicon.svg on an opaque ground.
 *
 * The markup is inlined into the page rather than linked or handed over as a
 * data: URI, because both of those make it a *replaced element* — and
 * favicon.svg declares only a viewBox, no width or height, so as a replaced
 * element it has no intrinsic size to scale from and Chrome renders it at a
 * default 300×150 letterboxed into whatever box the CSS gives it. Inline, it
 * is part of the document and sizes to the rule below.
 *
 * The ground is opaque because iOS composites the icon onto white and then
 * applies its own corner mask: transparent corners outside favicon.svg's
 * rounded rect would flash as white pips before being rounded off again.
 */
async function touchIconPage() {
  const svg = await readFile(FAVICON, 'utf8');
  const { width, height } = TOUCH_ICON_SIZE;
  return `<!doctype html>
<meta charset="utf-8">
<style>
  html, body { margin: 0; padding: 0; background: #0a0b0d; }
  svg { display: block; width: ${width}px; height: ${height}px; }
</style>
${svg}
`;
}

const check = process.argv.includes('--check');
const targets = [
  { out: OG_IMAGE, size: OG_SIZE, label: 'public/og-image.png' },
  { out: TOUCH_ICON, size: TOUCH_ICON_SIZE, label: 'public/apple-touch-icon.png' },
];

if (check) {
  let failed = false;
  for (const { out, size, label } of targets) {
    try {
      const actual = await assertSize(out, size, label);
      console.log(`${label} — ${actual.width}×${actual.height}`);
    } catch (error) {
      // Distinguishes "never generated" from "generated, then clobbered by
      // something that is not a PNG" — the two want different fixes.
      console.error(error.code === 'ENOENT' ? `${label} is missing` : error.message);
      failed = true;
    }
  }
  if (failed) {
    console.error('Run: node docs/assets/generate-og-images.mjs');
    process.exit(1);
  }
} else {
  const chrome = await findChrome();
  const workdir = await mkdtemp(join(tmpdir(), 'yavuz-og-'));

  try {
    const iconPage = join(workdir, 'touch-icon.html');
    await writeFile(iconPage, await touchIconPage(), 'utf8');

    const card = await screenshot(chrome, {
      url: CARD.href,
      out: OG_IMAGE,
      size: OG_SIZE,
      label: 'public/og-image.png',
      profile: join(workdir, 'profile-card'),
    });
    console.log(`wrote public/og-image.png — ${card.width}×${card.height}`);

    const icon = await screenshot(chrome, {
      url: new URL(`file://${iconPage.replace(/\\/g, '/')}`).href,
      out: TOUCH_ICON,
      size: TOUCH_ICON_SIZE,
      label: 'public/apple-touch-icon.png',
      profile: join(workdir, 'profile-icon'),
    });
    console.log(`wrote public/apple-touch-icon.png — ${icon.width}×${icon.height}`);
    console.log(`  chrome: ${chrome}`);
  } finally {
    await rm(workdir, { recursive: true, force: true });
  }
}
