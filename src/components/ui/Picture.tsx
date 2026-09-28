/**
 * An image, served as AVIF or WebP where the browser takes them, with the
 * original as the fallback.
 *
 * Pass the original — the `.png` or `.jpg` under /public — exactly as you would
 * to an <img>. `pnpm images` (docs/assets/encode-images.mjs) writes an `.avif`
 * and a `.webp` beside every raster under public/images/ at the original's
 * exact pixel size, so the two <source> paths are derived from `src` rather
 * than listed by hand. A test asserts every raster has both, and that neither
 * is stale: a <source> that 404s is a broken image, not a fallback.
 *
 * Anything that is not a PNG or a JPEG — an SVG logo — renders as a plain
 * <img>, since there is nothing to encode.
 *
 * Every other prop, `ref` included, goes to the <img>, which stays the element
 * that is sized, styled, masked and measured. The <picture> around it is
 * `display: contents`, so it generates no box: in a flex row, a grid cell or an
 * absolutely positioned stack the <img> lays out exactly as it would bare.
 * `width` and `height` describe all three files, which share one pixel size.
 */

import type { ComponentPropsWithRef } from 'react';

const RASTER = /\.(png|jpe?g)$/i;

export interface PictureProps extends ComponentPropsWithRef<'img'> {
  /** The original raster (or an SVG), as a path under /public. */
  src: string;
  /** Required — pass `''` for a decorative image. */
  alt: string;
}

export function Picture({ src, alt, ...img }: PictureProps) {
  if (!RASTER.test(src)) return <img src={src} alt={alt} {...img} />;

  return (
    <picture className="contents">
      <source type="image/avif" srcSet={src.replace(RASTER, '.avif')} />
      <source type="image/webp" srcSet={src.replace(RASTER, '.webp')} />
      <img src={src} alt={alt} {...img} />
    </picture>
  );
}
