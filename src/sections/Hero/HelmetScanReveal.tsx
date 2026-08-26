/**
 * The helmet's three stacked layers, in the order the scan reveal needs them.
 *
 * Purely presentational: it renders the layers and tags them with
 * `data-helmet-scan` so `useHelmetScan` can find them. Every per-frame value —
 * both masks, the edge gradient, the two opacities — is written straight to the
 * DOM by that hook, from HeroPortrait's rAF loop. This component never
 * re-renders during a sweep.
 *
 * The layers render in their *resting* state: photo unmasked, wireframe and
 * edge at zero opacity. That is what makes reduced motion free — with no loop
 * running, nothing is ever written, and what stays on screen is the plain
 * helmet photo.
 *
 * The wireframe takes its colour from `text-accent-primary` on its wrapper,
 * which the SVG's `fill="currentColor"` picks up. The leading-edge line is
 * clipped by the helmet photo's own alpha channel, so it never runs past the
 * shell into empty stage.
 *
 * Tuning — band width, angle, timing, wireframe alignment — is in
 * `helmetScan.ts`, not here.
 */

import { HelmetWireframe } from './HelmetWireframe';
import {
  HELMET_PHOTO,
  HELMET_SCAN,
  PHOTO_H,
  PHOTO_W,
  SCAN_NODE,
  type WireframeOffset,
} from './helmetScan';

/**
 * Shared by every masked layer. Gradients default to `repeat`, and a mask that
 * tiles would put a second band on the shell.
 */
const MASK_BASE: React.CSSProperties = {
  maskRepeat: 'no-repeat',
  WebkitMaskRepeat: 'no-repeat',
  maskSize: '100% 100%',
  WebkitMaskSize: '100% 100%',
};

export interface HelmetScanRevealProps {
  /** Alignment of the wireframe over the photo. */
  wireframeOffset?: WireframeOffset;
}

export function HelmetScanReveal({
  wireframeOffset = HELMET_SCAN.wireframeOffset,
}: HelmetScanRevealProps) {
  return (
    <>
      {/* 1 — the photo. Sets the box every other layer sizes against. */}
      <img
        data-helmet-scan={SCAN_NODE.photo}
        src={HELMET_PHOTO}
        alt=""
        width={PHOTO_W}
        height={PHOTO_H}
        style={MASK_BASE}
        className="block h-auto w-full"
      />

      {/* 2 — the wireframe, inverse-masked: only the band's interior shows it. */}
      <div
        data-helmet-scan={SCAN_NODE.wire}
        aria-hidden="true"
        style={MASK_BASE}
        className="text-accent-primary pointer-events-none absolute inset-0 opacity-0"
      >
        <HelmetWireframe
          className="h-full w-full"
          style={{
            transform: `translate(${wireframeOffset.x}px, ${wireframeOffset.y}px) scale(${wireframeOffset.scale})`,
          }}
        />
      </div>

      {/*
        3 — the leading-edge line. The wrapper is masked by the photo's alpha so
        the line follows the shell's silhouette; the inner element carries the
        gradient the loop rewrites. Keeping the two masks on separate elements
        composes them without relying on `mask-composite`.
      */}
      <div
        aria-hidden="true"
        style={{
          ...MASK_BASE,
          maskImage: `url(${HELMET_PHOTO})`,
          WebkitMaskImage: `url(${HELMET_PHOTO})`,
        }}
        className="pointer-events-none absolute inset-0"
      >
        <div data-helmet-scan={SCAN_NODE.edge} className="absolute inset-0 opacity-0" />
      </div>
    </>
  );
}
