/**
 * The lap animation itself: one rAF loop that advances the lap fraction and
 * writes every derived value straight to the DOM.
 *
 * Nothing here passes through React state. A lap touches the progress dash,
 * the trail, the car dot, the chronometer, three sector bars and the driver
 * plate — re-rendering that tree sixty times a second is not an option.
 *
 * The loop finds its targets by `data-lap` attribute under a single container
 * ref, resolved once and cached. Threading a bag of refs down through the
 * component tree instead would put mutable values in the render path, which
 * both React's lint rules and the compiler rightly object to.
 *
 * Timing rule (the critical one): the dot always completes a circuit in
 * LAP_DURATION_MS / speed, while the chronometer shows `fraction × lapMs`, so
 * it lands exactly on the personal best as the dot crosses the line. Screen
 * duration and real lap time are independent.
 */

import { useRef, type RefObject } from 'react';

import { useRafLoop } from '@/hooks';

import { formatLapTime, parseLapTime } from '../lib/formatLapTime';
import { getProgressDash, getSectorFill, getTrailDash } from '../lib/svgPath';
import { usePathPoint } from './usePathPoint';
import {
  LAP_DURATION_MS,
  TRACK_VIEW_HEIGHT,
  TRACK_VIEW_WIDTH,
  TRAIL_LENGTH,
  type SectorIndex,
  type Track,
} from '../data/types';
import type { PlaybackSpeed } from './usePlayback';

/** Fraction of the panel width past which the driver plate flips to the left. */
const LABEL_FLIP_AT = 0.66;
const LABEL_OFFSET_X = 12;
const LABEL_OFFSET_Y = 13;

/**
 * `data-lap` values the loop looks for. Components tag their nodes with these
 * instead of receiving refs.
 */
export const LAP_NODE = {
  base: 'base',
  progress: 'progress',
  trail: 'trail',
  dot: 'dot',
  startFinish: 'start-finish',
  chrono: 'chrono',
  label: 'label',
  map: 'map',
} as const;

interface LapNodes {
  basePath: SVGPathElement;
  progressPath: SVGPathElement | null;
  trailPath: SVGPathElement | null;
  dot: SVGGElement | null;
  startFinish: SVGGElement | null;
  chrono: HTMLElement | null;
  label: HTMLElement | null;
  mapWrap: HTMLElement | null;
  sectors: (HTMLElement | null)[];
}

function resolveNodes(root: HTMLElement): LapNodes | null {
  const basePath = root.querySelector<SVGPathElement>(`[data-lap="${LAP_NODE.base}"]`);
  if (!basePath) return null;
  return {
    basePath,
    progressPath: root.querySelector<SVGPathElement>(`[data-lap="${LAP_NODE.progress}"]`),
    trailPath: root.querySelector<SVGPathElement>(`[data-lap="${LAP_NODE.trail}"]`),
    dot: root.querySelector<SVGGElement>(`[data-lap="${LAP_NODE.dot}"]`),
    startFinish: root.querySelector<SVGGElement>(`[data-lap="${LAP_NODE.startFinish}"]`),
    chrono: root.querySelector<HTMLElement>(`[data-lap="${LAP_NODE.chrono}"]`),
    label: root.querySelector<HTMLElement>(`[data-lap="${LAP_NODE.label}"]`),
    mapWrap: root.querySelector<HTMLElement>(`[data-lap="${LAP_NODE.map}"]`),
    sectors: [0, 1, 2].map((i) => root.querySelector<HTMLElement>(`[data-lap-sector="${i}"]`)),
  };
}

export interface UseLapAnimationOptions {
  track: Track | null;
  isPlaying: boolean;
  speed: PlaybackSpeed;
  /** Wrapper the loop searches for its target nodes. */
  containerRef: RefObject<HTMLElement | null>;
  /** Stop burning frames while the section is off-screen. */
  active?: boolean;
}

export function useLapAnimation({
  track,
  isPlaying,
  speed,
  containerRef,
  active = true,
}: UseLapAnimationOptions): void {
  const fraction = useRef(0);
  const lastPath = useRef<string | null>(null);
  const nodes = useRef<LapNodes | null>(null);
  const { measure, pointAt } = usePathPoint();

  useRafLoop((delta) => {
    if (!track) return;
    const root = containerRef.current;
    if (!root) return;

    // Resolve once, then re-resolve only if React swapped the subtree out.
    let n = nodes.current;
    if (!n || !n.basePath.isConnected) {
      n = resolveNodes(root);
      nodes.current = n;
    }
    if (!n) return;

    // A new circuit: reset to the start line and re-measure.
    if (lastPath.current !== track.path) {
      lastPath.current = track.path;
      fraction.current = 0;
      const startPoint = pointAt(n.basePath, 0);
      n.startFinish?.setAttribute('transform', `translate(${startPoint.x},${startPoint.y})`);
    }

    const totalLength = measure(n.basePath, track.path);
    if (totalLength <= 0) return;

    if (isPlaying) {
      fraction.current = (fraction.current + (delta * speed) / LAP_DURATION_MS) % 1;
    }
    const progress = fraction.current;
    const distance = progress * totalLength;

    // Lap traced so far.
    if (n.progressPath) {
      n.progressPath.style.strokeDasharray = getProgressDash(distance, totalLength);
    }

    // Bright trail whose leading edge sits on the dot.
    if (n.trailPath) {
      const trail = getTrailDash(distance, totalLength, TRAIL_LENGTH);
      n.trailPath.style.strokeDasharray = trail.dasharray;
      n.trailPath.style.strokeDashoffset = String(trail.dashoffset);
    }

    const point = pointAt(n.basePath, distance);
    n.dot?.setAttribute('transform', `translate(${point.x},${point.y})`);

    // The chronometer counts the real lap time, scaled to the dot's position.
    if (n.chrono) {
      const lapMs = parseLapTime(track.lap) ?? 0;
      n.chrono.textContent = formatLapTime(progress * lapMs);
    }

    n.sectors.forEach((sector, i) => {
      if (sector) sector.style.width = `${getSectorFill(progress, i as SectorIndex) * 100}%`;
    });

    // Driver plate tracks the dot in panel pixels, flipping before it would
    // run off the right edge. It never rotates and never leaves the panel.
    if (n.label && n.mapWrap) {
      const width = n.mapWrap.clientWidth;
      const height = n.mapWrap.clientHeight;
      const scale = Math.min(width / TRACK_VIEW_WIDTH, height / TRACK_VIEW_HEIGHT);
      const originX = (width - TRACK_VIEW_WIDTH * scale) / 2;
      const originY = (height - TRACK_VIEW_HEIGHT * scale) / 2;
      const x = originX + point.x * scale;
      const y = originY + point.y * scale;
      const flip = x > width * LABEL_FLIP_AT;

      n.label.style.flexDirection = flip ? 'row-reverse' : 'row';
      n.label.style.transform = flip
        ? `translate(${x - LABEL_OFFSET_X}px, ${y - LABEL_OFFSET_Y}px) translateX(-100%)`
        : `translate(${x + LABEL_OFFSET_X}px, ${y - LABEL_OFFSET_Y}px)`;
    }
  }, active);
}
