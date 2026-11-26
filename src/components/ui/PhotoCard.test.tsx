import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';

import { preferReducedMotion } from '@/test/reducedMotion';

import { PhotoCard } from './PhotoCard';

describe('PhotoCard', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('plays a reel as a muted inline loop that loads nothing until it is on screen', () => {
    const { container } = render(
      <PhotoCard src="/images/reels/fiat.jpg" video="/videos/reels/fiat.mp4" caption="REEL" />,
    );
    const video = container.querySelector('video');
    expect(video).not.toBeNull();
    expect(video?.getAttribute('src')).toBe('/videos/reels/fiat.mp4');
    expect(video?.getAttribute('poster')).toBe('/images/reels/fiat.jpg');
    expect(video?.getAttribute('preload')).toBe('none');
    expect(video?.muted).toBe(true);
    expect(video?.loop).toBe(true);
    expect(video?.hasAttribute('playsinline')).toBe(true);
  });

  it('shows only the still under reduced motion', () => {
    preferReducedMotion();
    const { container } = render(
      <PhotoCard src="/images/reels/fiat.jpg" video="/videos/reels/fiat.mp4" caption="REEL" />,
    );
    expect(container.querySelector('video')).toBeNull();
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/images/reels/fiat.jpg');
  });
});
