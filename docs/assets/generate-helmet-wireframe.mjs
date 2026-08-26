/**
 * Generates src/sections/Hero/HelmetWireframe.tsx from helmet-wireframe.svg.
 *
 * The hero's scan reveal needs the helmet's line art as an inline SVG, not an
 * <img>: the drawing takes its colour from `currentColor`, which only works if
 * the markup is in the document. There is no SVG-to-component Vite plugin in
 * this project and adding a dependency for one asset is not worth it, so the
 * path is baked into a component — and this script is what bakes it.
 *
 * The component is therefore generated, not authored. The path is ~67 kB of
 * coordinates; hand-editing it is how you silently break the drawing.
 *
 *   node docs/assets/generate-helmet-wireframe.mjs           # rewrite it
 *   node docs/assets/generate-helmet-wireframe.mjs --check   # assert in sync
 *
 * Output goes through Prettier's own API with the repo's config, so a
 * regeneration leaves the working tree clean and `--check` is meaningful.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';

const SRC = new URL('./helmet-wireframe.svg', import.meta.url);
const OUT = new URL('../../src/sections/Hero/HelmetWireframe.tsx', import.meta.url);

/** Characters that would need escaping inside the double-quoted JSX attribute. */
const UNSAFE = ['"', "'", '`', String.fromCharCode(92)];

const svg = await readFile(SRC, 'utf8');

const dMatch = svg.match(/\sd="([^"]+)"/g);
if (!dMatch || dMatch.length !== 1) {
  throw new Error(
    `expected exactly one path in the source SVG, found ${dMatch ? dMatch.length : 0} — ` +
      'the component renders a single <path>, so a multi-path source needs a decision, not a guess',
  );
}

const d = svg.match(/\sd="([^"]+)"/)[1];
const viewBox = svg.match(/viewBox="([^"]+)"/)[1];
const [, , width, height] = viewBox.split(/\s+/).map(Number);

for (const char of UNSAFE) {
  if (d.includes(char)) {
    throw new Error(`path data contains ${JSON.stringify(char)} and would need escaping`);
  }
}

const subpaths = (d.match(/M/g) || []).length;
const closes = (d.match(/[Zz]/g) || []).length;
if (subpaths !== closes) {
  throw new Error(`${subpaths} subpaths but ${closes} closepaths — the source is not all closed`);
}

const source = `/**
 * The helmet's technical line art, inlined as a component.
 *
 * GENERATED — do not edit. Regenerate with:
 *
 *   node docs/assets/generate-helmet-wireframe.mjs
 *
 * Source of truth: docs/assets/helmet-wireframe.svg
 * Generator:       docs/assets/generate-helmet-wireframe.mjs
 *
 * Inlined rather than loaded through <img> because the drawing has to take its
 * colour from CSS: the single path is \`fill="currentColor"\`, so whatever sets
 * \`color\` on an ancestor tints the whole drawing. An <img> would be an opaque
 * raster to the cascade.
 *
 * The drawing is line art converted to outlines — ${subpaths} closed subpaths resolved
 * with \`fill-rule="evenodd"\`, which is what makes the inside of each stroke read
 * as a line rather than a solid blob.
 *
 * The ${width}×${height} viewBox is deliberately the same aspect as
 * public/images/hero/helmet.png — ${height}/${width} = ${(height / width).toFixed(5)} against the photo's
 * 508/492 = ${(508 / 492).toFixed(5)} — so the two layers overlay with no correction and
 * HelmetScanReveal's default wireframeOffset is the identity.
 */

export interface HelmetWireframeProps {
  className?: string;
  style?: React.CSSProperties;
}

export function HelmetWireframe({ className, style }: HelmetWireframeProps) {
  return (
    <svg
      viewBox="${viewBox}"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={style}
    >
      <path fill="currentColor" fillRule="evenodd" d="${d}" />
    </svg>
  );
}
`;

const outPath = fileURLToPath(OUT);
const prettierConfig = await resolveConfig(outPath);
const formatted = await format(source, { ...prettierConfig, filepath: outPath });

if (process.argv.includes('--check')) {
  const current = await readFile(OUT, 'utf8').catch(() => null);
  if (current !== formatted) {
    console.error('HelmetWireframe.tsx is out of sync with helmet-wireframe.svg.');
    console.error('Run: node docs/assets/generate-helmet-wireframe.mjs');
    process.exit(1);
  }
  console.log('HelmetWireframe.tsx is in sync.');
} else {
  await writeFile(OUT, formatted, 'utf8');
  console.log(`wrote src/sections/Hero/HelmetWireframe.tsx`);
  console.log(
    `  viewBox ${viewBox} | ${subpaths} closed subpaths | ${d.length} chars of path data`,
  );
}
