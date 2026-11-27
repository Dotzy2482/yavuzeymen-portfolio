import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { preferReducedMotion } from '@/test/reducedMotion';

import { usePlayback } from './usePlayback';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('usePlayback', () => {
  it('auto-plays at 1×, as the design does', () => {
    const { result } = renderHook(() => usePlayback());

    expect(result.current.isPlaying).toBe(true);
    expect(result.current.speed).toBe(1);
  });

  it('plays under prefers-reduced-motion too', () => {
    preferReducedMotion();

    const { result } = renderHook(() => usePlayback());

    // Windows' "Animation effects" switch sets the preference on machines
    // whose owners never chose it; a replay frozen at 0:00 read as broken.
    expect(result.current.isPlaying).toBe(true);
    expect(result.current.speed).toBe(1);
  });

  it('lets a reduced-motion visitor pause the lap', () => {
    preferReducedMotion();
    const { result } = renderHook(() => usePlayback());

    act(() => result.current.toggle());

    expect(result.current.isPlaying).toBe(false);
  });

  it('pauses and resumes on toggle', () => {
    const { result } = renderHook(() => usePlayback());

    act(() => result.current.toggle());
    expect(result.current.isPlaying).toBe(false);

    act(() => result.current.toggle());
    expect(result.current.isPlaying).toBe(true);
  });

  it('alternates between 1× and 2× on toggleSpeed', () => {
    const { result } = renderHook(() => usePlayback());

    act(() => result.current.toggleSpeed());
    expect(result.current.speed).toBe(2);

    act(() => result.current.toggleSpeed());
    expect(result.current.speed).toBe(1);
  });

  it('keeps play state and speed independent of each other', () => {
    const { result } = renderHook(() => usePlayback());

    // Changing speed while paused must not start the lap…
    act(() => result.current.toggle());
    act(() => result.current.toggleSpeed());
    expect(result.current).toMatchObject({ isPlaying: false, speed: 2 });

    // …and resuming must not reset the speed.
    act(() => result.current.toggle());
    expect(result.current).toMatchObject({ isPlaying: true, speed: 2 });
  });

  it('hands out the same callbacks on every render', () => {
    // Nothing compiles these with the React Compiler, so the identity is the
    // hook's own promise: safe in a dependency list or a memoised child.
    const { result, rerender } = renderHook(() => usePlayback());
    const { toggle, toggleSpeed } = result.current;

    act(() => result.current.toggle());
    act(() => result.current.toggleSpeed());
    rerender();

    expect(result.current.toggle).toBe(toggle);
    expect(result.current.toggleSpeed).toBe(toggleSpeed);
  });
});
