/**
 * The hero helmet's scan reveal: a diagonal band sweeps across the helmet, and
 * inside the band the photo is masked away and the technical wireframe shows
 * through instead. Behind the band everything returns to normal.
 *
 * Three layers move together, driven by one number:
 * - the photo, masked so the band's interior is cut out of it;
 * - the wireframe, masked with the exact inverse, so *only* the interior shows;
 * - a thin accent line riding the band's leading edge.
 *
 * This hook owns no loop of its own. It returns an `update(elapsed, damp)`
 * that the host calls from the rAF loop it already runs for the helmet fit —
 * one loop drives the fit and all three scan layers, and no frame touches
 * React state. Re-rendering the hero sixty times a second to move a gradient
 * is not an option.
 *
 * Targets are found by `data-helmet-scan` attribute under a single container
 * ref and cached, the same pattern as the track-records lap animation:
 * threading a bag of refs down through the tree instead would put mutable
 * values in the render path, which React's lint rules rightly object to.
 *
 * Cost control: while the band is idle — 5.4s of every 7s cycle at the
 * defaults — the update writes nothing at all. It writes the resting state
 * once on the way out and then returns early until the next sweep begins.
 */

import { useRef, type RefObject } from 'react';

import { SCAN_NODE } from './helmetScan';

/**
 * How far the band travels, as a percentage of the gradient line. It overshoots
 * 100% at both ends by the band's own width so the band enters and leaves fully
 * off the shell rather than materialising on it.
 */
const SWEEP_SPAN = 120;

/** Leading-edge line: solid core, then a soft trail back into the band. */
const EDGE_THICKNESS = 0.35;
const EDGE_GLOW = 3;

/** Below this the effect is close enough to invisible to skip entirely. */
const DAMP_EPSILON = 0.001;

interface ScanNodes {
  photo: HTMLElement;
  wire: HTMLElement | null;
  edge: HTMLElement | null;
}

function resolveNodes(root: HTMLElement): ScanNodes | null {
  const photo = root.querySelector<HTMLElement>(`[data-helmet-scan="${SCAN_NODE.photo}"]`);
  if (!photo) return null;
  return {
    photo,
    wire: root.querySelector<HTMLElement>(`[data-helmet-scan="${SCAN_NODE.wire}"]`),
    edge: root.querySelector<HTMLElement>(`[data-helmet-scan="${SCAN_NODE.edge}"]`),
  };
}

/**
 * The band as a mask gradient. Two stops share each boundary position, which
 * is what keeps both edges hard instead of fading over the band's width.
 *
 * `invert` swaps opaque for transparent, giving the wireframe layer the exact
 * complement of the photo layer's mask — the seam between them is therefore
 * the same pair of numbers, and cannot drift apart.
 */
function bandMask(angle: number, x: number, y: number, invert: boolean): string {
  const outside = invert ? 'transparent' : '#000';
  const inside = invert ? '#000' : 'transparent';
  return `linear-gradient(${angle}deg, ${outside} ${x}%, ${inside} ${x}%, ${inside} ${y}%, ${outside} ${y}%)`;
}

/** The leading edge itself — a background, not a mask, so it can glow. */
function edgeLine(angle: number, y: number): string {
  return (
    `linear-gradient(${angle}deg, transparent ${y - EDGE_GLOW}%, ` +
    `var(--accent-primary-glow) ${y - EDGE_THICKNESS}%, ` +
    `var(--accent-primary) ${y - EDGE_THICKNESS}%, ` +
    `var(--accent-primary) ${y}%, transparent ${y}%)`
  );
}

function setMask(el: HTMLElement, value: string): void {
  // setProperty for both spellings: the prefixed one is not in the typed
  // CSSStyleDeclaration, and going through the same call for both keeps them
  // impossible to set out of step.
  el.style.setProperty('mask-image', value);
  el.style.setProperty('-webkit-mask-image', value);
}

export interface UseHelmetScanOptions {
  /** Wrapper the sweep searches for its target nodes. */
  containerRef: RefObject<HTMLElement | null>;
  /** Band thickness as a percentage of the gradient line. */
  bandWidth: number;
  /** Band angle in degrees, as a CSS gradient angle. */
  angle: number;
  /** Duration of a single pass, in milliseconds. */
  sweepDuration: number;
  /** Cycle length, in milliseconds: one pass, then rest until the next. */
  idleInterval: number;
}

/**
 * @returns `update(elapsed, damp)` — call once per frame.
 *   `elapsed` is milliseconds since the host loop started; `damp` scales the
 *   whole effect from 1 (full) to 0 (off) so it can fade out as the hero
 *   scrolls away.
 */
export function useHelmetScan({
  containerRef,
  bandWidth,
  angle,
  sweepDuration,
  idleInterval,
}: UseHelmetScanOptions): (elapsed: number, damp: number) => void {
  const nodes = useRef<ScanNodes | null>(null);
  const resting = useRef(false);

  return (elapsed: number, damp: number) => {
    const root = containerRef.current;
    if (!root) return;

    // Resolve once, then re-resolve only if React swapped the subtree out.
    let n = nodes.current;
    if (!n || !n.photo.isConnected) {
      n = resolveNodes(root);
      nodes.current = n;
    }
    if (!n) return;

    const phase = elapsed % idleInterval;
    const sweeping = phase < sweepDuration && damp > DAMP_EPSILON;

    if (!sweeping) {
      // Resting: drop the masks so the helmet is exactly the untouched photo,
      // then stop writing until the next pass.
      if (!resting.current) {
        resting.current = true;
        setMask(n.photo, 'none');
        if (n.wire) n.wire.style.opacity = '0';
        if (n.edge) n.edge.style.opacity = '0';
      }
      return;
    }
    resting.current = false;

    // Damping shrinks the band rather than fading it. A narrowing band closes
    // the hole in the photo and the strip of wireframe at the same rate, so the
    // effect can die mid-pass without any layer popping.
    const width = bandWidth * damp;
    const x = (phase / sweepDuration) * (SWEEP_SPAN + width) - width;
    const y = x + width;

    setMask(n.photo, bandMask(angle, x, y, false));

    if (n.wire) {
      setMask(n.wire, bandMask(angle, x, y, true));
      n.wire.style.opacity = '1';
    }

    if (n.edge) {
      n.edge.style.backgroundImage = edgeLine(angle, y);
      n.edge.style.opacity = String(damp);
    }
  };
}
