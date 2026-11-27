/**
 * Rasterises the images the document head needs and that nothing else in the
 * build can produce:
 *
 *   public/og-image.png         1200×630, from ./og-card.html
 *   public/apple-touch-icon.png   180×180, from ../../public/favicon.svg
 *   public/favicon-192.png        192×192, from ../../public/favicon.svg
 *   public/favicon-512.png        512×512, from ../../public/favicon.svg
 *   public/favicon.ico        48, 32, 16, downscaled from favicon-192.png
 *   public/search-image.jpg     1200×1200, the bare-headed hero photo on the
 *                               page ground
 *
 * The last two are for search results. Google shows a site's favicon next to
 * its result, but only one that is square and a multiple of 48px; it showed
 * a grey globe while the site had nothing but the SVG. The .ico is the file
 * every crawler and old browser asks for at the root without being told.
 * The 512 is the large icon site.webmanifest offers a phone's home screen.
 *
 * search-image.jpg is the picture Google shows beside the search result.
 * Left to choose, it took the hero's helmet cut-out, a transparent PNG, and
 * showed it on white. The structured data in vite.config.ts now names this
 * square, opaque image instead (Google crops result thumbnails to about a
 * square, which would cut the head off any of the tall portraits), and
 * robots.txt keeps Google's image crawler off the transparent hero files.
 *
 *   node docs/assets/generate-og-images.mjs           # rewrite them
 *   node docs/assets/generate-og-images.mjs --check   # assert they are present
 *                                                     # and correctly sized
 *
 * Both sources stay editable and versioned; only their rasters ship, for the
 * reason that a committed binary whose origin nobody can reconstruct is a dead
 * end the next person cannot edit.
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

import { access, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const CARD = new URL('./og-card.html', import.meta.url);
const FAVICON = new URL('../../public/favicon.svg', import.meta.url);
const OG_IMAGE = new URL('../../public/og-image.png', import.meta.url);
const TOUCH_ICON = new URL('../../public/apple-touch-icon.png', import.meta.url);
const FAVICON_PNG = new URL('../../public/favicon-192.png', import.meta.url);
const FAVICON_ICO = new URL('../../public/favicon.ico', import.meta.url);
const FAVICON_LARGE = new URL('../../public/favicon-512.png', import.meta.url);
const HERO_FACE = new URL('../../public/images/hero/portrait-cutout.png', import.meta.url);
const SEARCH_IMAGE = new URL('../../public/search-image.jpg', import.meta.url);

/** 1.91:1, the aspect every major card renderer crops to. */
const OG_SIZE = { width: 1200, height: 630 };
/** iOS home-screen icon; Apple's largest, downscaled from there. */
const TOUCH_ICON_SIZE = { width: 180, height: 180 };
/** Search-result favicon: square, a multiple of 48 (Google's rule). */
const FAVICON_PNG_SIZE = { width: 192, height: 192 };
/** The manifest's large icon. */
const FAVICON_LARGE_SIZE = { width: 512, height: 512 };
/** The search-result picture: square, and large enough for any crop Google makes. */
const SEARCH_IMAGE_SIZE = { width: 1200, height: 1200 };
/** The sizes packed into favicon.ico, largest first. */
const ICO_SIZES = [48, 32, 16];

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

  await recompress(out);
  return assertSize(out, size, label);
}

/**
 * Chrome writes its screenshots with fast, light zlib settings: the card came
 * out at ~280 KB. Re-encoding at the highest compression level, without
 * per-row filters (which only add entropy on a mostly flat dark card), takes
 * about a third off. It is lossless — the same pixels, byte for byte once
 * decoded — so the card a feed shows does not change. A palette encode would
 * be smaller again, but it moves pixels in the gradients, and this file is
 * the one a share preview rescales.
 *
 * Kept only when it is actually smaller, so a raster Chrome already packs
 * well (the touch icon) is left as it was written.
 */
async function recompress(out) {
  const path = fileURLToPath(out);
  const before = (await stat(path)).size;
  const packed = await sharp(path)
    .png({ compressionLevel: 9, adaptiveFiltering: false, palette: false })
    .toBuffer();
  if (packed.length < before) await writeFile(path, packed);
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
async function iconPage({ width, height }) {
  const svg = await readFile(FAVICON, 'utf8');
  return `<!doctype html>
<meta charset="utf-8">
<style>
  html, body { margin: 0; padding: 0; background: #0a0b0d; }
  svg { display: block; width: ${width}px; height: ${height}px; }
</style>
${svg}
`;
}

/**
 * The search-result picture's page: the bare-headed hero photo standing on the
 * bottom edge of the page ground, with the red and blue ambient glows the
 * hero and the social card use. Values are literals mirrored from tokens.css,
 * for the reason og-card.html gives.
 */
function searchImagePage() {
  const face = fileURLToPath(HERO_FACE).replace(/\\/g, '/');
  const { width, height } = SEARCH_IMAGE_SIZE;
  return `<!doctype html>
<meta charset="utf-8">
<style>
  html, body { margin: 0; padding: 0; }
  .stage { position: relative; width: ${width}px; height: ${height}px; overflow: hidden; background: #0a0b0d; }
  .glow { position: absolute; border-radius: 50%; }
  .red { left: -20%; top: 18%; width: 70%; height: 80%; background: radial-gradient(ellipse at center, rgba(232, 35, 42, 0.2), transparent 62%); }
  .blue { right: -20%; top: 8%; width: 70%; height: 80%; background: radial-gradient(ellipse at center, rgba(43, 88, 255, 0.18), transparent 62%); }
  img { position: absolute; left: 50%; bottom: 0; height: 92%; transform: translateX(-50%); }
</style>
<div class="stage">
  <div class="glow red"></div>
  <div class="glow blue"></div>
  <img src="file:///${face}" alt="">
</div>
`;
}

/**
 * An .ico is a directory of images; each entry may be a whole PNG file, which
 * every browser since IE Vista and every crawler reads. A 6-byte header, a
 * 16-byte entry per image, then the PNGs.
 */
async function writeIco(source, out) {
  const images = await Promise.all(
    ICO_SIZES.map((size) =>
      sharp(source).resize(size, size).png({ compressionLevel: 9 }).toBuffer(),
    ),
  );
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + 16 * images.length;
  const entries = images.map((png, i) => {
    const entry = Buffer.alloc(16);
    const size = ICO_SIZES[i];
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 means 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // palette colours
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });
  await writeFile(fileURLToPath(out), Buffer.concat([header, ...entries, ...images]));
}

/** The sizes in an .ico's directory, for --check. */
async function icoSizes(out) {
  const buffer = await readFile(fileURLToPath(out));
  if (buffer.length < 6 || buffer.readUInt16LE(0) !== 0 || buffer.readUInt16LE(2) !== 1) {
    throw new Error('public/favicon.ico is not an icon file');
  }
  const count = buffer.readUInt16LE(4);
  return Array.from({ length: count }, (_, i) => buffer.readUInt8(6 + 16 * i) || 256);
}

const check = process.argv.includes('--check');
const targets = [
  { out: OG_IMAGE, size: OG_SIZE, label: 'public/og-image.png' },
  { out: TOUCH_ICON, size: TOUCH_ICON_SIZE, label: 'public/apple-touch-icon.png' },
  { out: FAVICON_PNG, size: FAVICON_PNG_SIZE, label: 'public/favicon-192.png' },
  { out: FAVICON_LARGE, size: FAVICON_LARGE_SIZE, label: 'public/favicon-512.png' },
];

/** Width and height of a baseline or progressive JPEG, from its SOF marker. */
async function jpegSize(path) {
  const buffer = await readFile(path);
  let offset = 2;
  while (offset < buffer.length) {
    const marker = buffer.readUInt16BE(offset);
    const length = buffer.readUInt16BE(offset + 2);
    if (marker >= 0xffc0 && marker <= 0xffc2) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  throw new Error(`${path} has no frame header`);
}

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
  try {
    const { width, height } = await jpegSize(fileURLToPath(SEARCH_IMAGE));
    if (width !== SEARCH_IMAGE_SIZE.width || height !== SEARCH_IMAGE_SIZE.height) {
      throw new Error(`public/search-image.jpg is ${width}×${height}, want 1200×1200`);
    }
    console.log(`public/search-image.jpg — ${width}×${height}`);
  } catch (error) {
    console.error(error.code === 'ENOENT' ? 'public/search-image.jpg is missing' : error.message);
    failed = true;
  }
  try {
    const sizes = await icoSizes(FAVICON_ICO);
    if (sizes.join() !== ICO_SIZES.join()) {
      throw new Error(`public/favicon.ico holds ${sizes.join(', ')}, want ${ICO_SIZES.join(', ')}`);
    }
    console.log(`public/favicon.ico — ${sizes.join(', ')}`);
  } catch (error) {
    console.error(error.code === 'ENOENT' ? 'public/favicon.ico is missing' : error.message);
    failed = true;
  }
  if (failed) {
    console.error('Run: node docs/assets/generate-og-images.mjs');
    process.exit(1);
  }
} else {
  const chrome = await findChrome();
  const workdir = await mkdtemp(join(tmpdir(), 'yavuz-og-'));

  try {
    const touchPage = join(workdir, 'touch-icon.html');
    await writeFile(touchPage, await iconPage(TOUCH_ICON_SIZE), 'utf8');
    const faviconPage = join(workdir, 'favicon.html');
    await writeFile(faviconPage, await iconPage(FAVICON_PNG_SIZE), 'utf8');
    const searchPage = join(workdir, 'search-image.html');
    await writeFile(searchPage, searchImagePage(), 'utf8');
    const largePage = join(workdir, 'favicon-large.html');
    await writeFile(largePage, await iconPage(FAVICON_LARGE_SIZE), 'utf8');

    const card = await screenshot(chrome, {
      url: CARD.href,
      out: OG_IMAGE,
      size: OG_SIZE,
      label: 'public/og-image.png',
      profile: join(workdir, 'profile-card'),
    });
    console.log(`wrote public/og-image.png — ${card.width}×${card.height}`);

    const icon = await screenshot(chrome, {
      url: new URL(`file://${touchPage.replace(/\\/g, '/')}`).href,
      out: TOUCH_ICON,
      size: TOUCH_ICON_SIZE,
      label: 'public/apple-touch-icon.png',
      profile: join(workdir, 'profile-icon'),
    });
    console.log(`wrote public/apple-touch-icon.png — ${icon.width}×${icon.height}`);

    const favicon = await screenshot(chrome, {
      url: new URL(`file://${faviconPage.replace(/\\/g, '/')}`).href,
      out: FAVICON_PNG,
      size: FAVICON_PNG_SIZE,
      label: 'public/favicon-192.png',
      profile: join(workdir, 'profile-favicon'),
    });
    console.log(`wrote public/favicon-192.png — ${favicon.width}×${favicon.height}`);

    const large = await screenshot(chrome, {
      url: new URL(`file://${largePage.replace(/\\/g, '/')}`).href,
      out: FAVICON_LARGE,
      size: FAVICON_LARGE_SIZE,
      label: 'public/favicon-512.png',
      profile: join(workdir, 'profile-favicon-large'),
    });
    console.log(`wrote public/favicon-512.png — ${large.width}×${large.height}`);

    // Chrome writes PNG; the photo ships as a JPEG, a tenth of the size.
    const searchPng = new URL(`file://${join(workdir, 'search-image.png').replace(/\\/g, '/')}`);
    await screenshot(chrome, {
      url: new URL(`file://${searchPage.replace(/\\/g, '/')}`).href,
      out: searchPng,
      size: SEARCH_IMAGE_SIZE,
      label: 'search-image.png',
      profile: join(workdir, 'profile-search'),
    });
    await sharp(fileURLToPath(searchPng))
      .jpeg({ quality: 86, mozjpeg: true })
      .toFile(fileURLToPath(SEARCH_IMAGE));
    console.log('wrote public/search-image.jpg — 1200×1200');

    await writeIco(fileURLToPath(FAVICON_PNG), FAVICON_ICO);
    console.log(`wrote public/favicon.ico — ${ICO_SIZES.join(', ')}`);
    console.log(`  chrome: ${chrome}`);
  } finally {
    await rm(workdir, { recursive: true, force: true });
  }
}
