import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';

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
    expect(video?.getAttribute('preload')).toBe('none');
    expect(video?.muted).toBe(true);
    expect(video?.loop).toBe(true);
    expect(video?.hasAttribute('playsinline')).toBe(true);
  });

  it('keeps the cover under the video and shows the video only once it plays', () => {
    const { container } = render(
      <PhotoCard src="/images/reels/fiat.jpg" video="/videos/reels/fiat.mp4" caption="REEL" />,
    );
    // No poster: browsers drop it on play() and paint black until a frame
    // decodes. The cover picture underneath stands in for it.
    const video = container.querySelector('video') as HTMLVideoElement;
    expect(video.hasAttribute('poster')).toBe(false);
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/images/reels/fiat.jpg');
    expect(video).toHaveClass('opacity-0');

    fireEvent.playing(video);
    expect(video).not.toHaveClass('opacity-0');
  });

  it('moves a manual card on after a hold when the browser refuses to play it', async () => {
    // iOS Low Power Mode and "never autoplay" settings reject play(); the fan's
    // playlist only advances when its centre clip ends.
    vi.useFakeTimers();
    const play = vi
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockImplementation(() => Promise.reject(new DOMException('blocked', 'NotAllowedError')));
    const onEnded = vi.fn();
    try {
      render(
        <PhotoCard
          src="/images/reels/fiat.jpg"
          video="/videos/reels/fiat.mp4"
          caption="REEL"
          play="manual"
          playing
          onEnded={onEnded}
        />,
      );
      expect(play).toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(5900);
      expect(onEnded).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(200);
      expect(onEnded).toHaveBeenCalledTimes(1);
    } finally {
      play.mockRestore();
      vi.useRealTimers();
    }
  });

  it('still plays the clip under reduced motion, over its cover', () => {
    preferReducedMotion();
    const { container } = render(
      <PhotoCard src="/images/reels/fiat.jpg" video="/videos/reels/fiat.mp4" caption="REEL" />,
    );
    expect(container.querySelector('video')?.getAttribute('src')).toBe('/videos/reels/fiat.mp4');
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/images/reels/fiat.jpg');
  });
});
