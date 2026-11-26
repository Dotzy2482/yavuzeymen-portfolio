/**
 * A value that travels `distance` every `duration` seconds, linearly and for
 * ever — the clock behind the ambients' cyan runners — and that can be held.
 *
 * A runner's dash pattern repeats every `distance`, so a loop may start from
 * wherever the value was left: running from `v` to `v + distance` looks
 * exactly like running from 0 to `distance`. That is what makes holding it
 * free. While `running` is false nothing is scheduled at all, not even a
 * paused animation's frame tick, and on resume the runner carries on from
 * where it stopped rather than jumping back to the start.
 *
 * It exists because a dash offset is not something the compositor can
 * animate: every frame of it is main-thread style, paint and commit. The
 * runners used to keep paying that behind the hero's opaque stage and after
 * the hero had scrolled away. The callers hold their runners whenever they
 * cannot be seen.
 */

import { useEffect } from 'react';
import { animate, useMotionValue, type MotionValue } from 'motion/react';

export function useLoop(distance: number, duration: number, running: boolean): MotionValue<number> {
  const value = useMotionValue(0);

  useEffect(() => {
    if (!running) return;
    const from = value.get();
    const loop = animate(value, [from, from + distance], {
      duration,
      ease: 'linear',
      repeat: Infinity,
    });
    return () => loop.stop();
  }, [value, distance, duration, running]);

  return value;
}
