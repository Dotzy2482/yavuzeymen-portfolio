/**
 * `pnpm images --check`, run as part of `pnpm test` so CI enforces it.
 *
 * <Picture> asks for an AVIF and a WebP beside every raster it renders, and a
 * <source> that 404s is a broken image, not a fallback. So an original with
 * no encodes, a stale encode left behind by a replaced photo, or an encode at
 * the wrong size all break the page in a way no other test would notice.
 *
 * Plain .mjs beside the script it tests: it reads the file system and the
 * app's TypeScript program deliberately has no Node types.
 */

import { describe, expect, it } from 'vitest';

import { check } from './encode-images.mjs';

describe('image encodes', () => {
  it('gives every raster under public/images/ current AVIF and WebP encodes', async () => {
    expect(await check()).toEqual([]);
  }, 30_000);
});
