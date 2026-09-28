/**
 * The page's scroll indicator, in place of the native scrollbar that
 * globals.css hides: a lap rail down the right edge.
 *
 * Desktop with a mouse gets the full instrument. A hairline track, a Signal
 * Cyan fill running from the top down to the reader's position, and at its
 * head the same car dot the Track Records map drives round a circuit. A notch
 * crosses the track where each section starts — measured from the document,
 * never assumed, because the pinned sections make the page's proportions
 * anything but even — and lights cyan once the head has passed it, exactly as
 * Career's timeline nodes do. A stacked `04 / 09` readout caps the rail.
 *
 * It stays quiet while the visitor reads and comes up to full strength under
 * the pointer, where it behaves as a scrollbar: drag anywhere on the rail to
 * scrub the page, or click to jump there. A click near a notch snaps to that
 * section's first pixel, and a plate in the style of the Track Records driver
 * label previews which section the click will land in — the chapter marker of
 * a video scrubber, in this site's type.
 *
 * Touch screens and phones get a two-pixel progress line on the edge and
 * nothing to grab. Below `md` there is no room for a target that would not
 * steal swipes from the page, and on a coarse pointer of any width a strip
 * that jumps the page when brushed is a hazard rather than a control.
 *
 * ## Accessibility
 *
 * Every part of it is `aria-hidden` and none of it is focusable. It duplicates
 * native scrolling for pointers — wheel, keyboard, touch and the nav's anchor
 * links all still work, because the page itself never stops being the scroller
 * — so it is a visual affordance, not a widget. A half-built slider role would
 * be worse than none.
 *
 * ## Motion
 *
 * Per-frame values never pass through React. The head, the fill and the lit
 * notches are motion values; React renders again only when the section under
 * the head changes, when the preview plate's target does, or when a resize
 * moves the notches. Scroll reaches the head through a critically damped
 * spring, so a wheel's discrete steps glide instead of stepping. The spring is
 * bypassed while dragging — the head must stay under the pointer — and under
 * `prefers-reduced-motion`, where the head maps to scroll directly and a click
 * jumps instead of gliding.
 */

import { useEffect, useRef, useState } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react';

import { BREAKPOINTS, SECTION_IDS } from '@/lib/constants';
import { cn } from '@/lib/cn';
import { useMediaQuery, usePrefersReducedMotion } from '@/hooks';

import {
  LAST_SECTION_NUMBER,
  RAIL_LABELS,
  nearestTick,
  progressAtPointer,
  scrollTopFor,
  sectionIndexAt,
  sectionNumber,
  tickPositions,
  type RailBox,
} from './railGeometry';

/** A device that can hover and aim — the only one that gets the drag rail. */
const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)';

/** How close, in rail pixels, a click has to be to a notch to snap to it. */
const SNAP_PX = 8;
/** How close, in rail pixels, a press has to be to the head to pick it up. */
const HEAD_GRAB_PX = 9;
/** Pointer travel that turns a press on the bare rail into a drag. */
const DRAG_THRESHOLD_PX = 3;

/**
 * Critically damped (damping ≈ 2·√stiffness), so the head never overshoots a
 * notch it is settling on. Within 5% of its target in about 150ms, measured —
 * enough to smooth a wheel's steps, not enough to feel like lag.
 */
const HEAD_SPRING = {
  type: 'spring',
  stiffness: 1000,
  damping: 63,
  restDelta: 0.0001,
  restSpeed: 0.001,
} as const;

export interface ScrollRailProps {
  className?: string;
}

export function ScrollRail({ className }: ScrollRailProps) {
  const isDesktop = useMediaQuery(BREAKPOINTS.md);
  const hasFinePointer = useMediaQuery(FINE_POINTER_QUERY);

  if (isDesktop && hasFinePointer) return <LapRail className={className} />;
  return <ProgressLine className={className} />;
}

/**
 * Phones and touch screens: the reader's position as a thin line on the edge.
 * Direct from scroll — a finger is already moving the page smoothly — and
 * `pointer-events-none`, so it can never take a swipe meant for the page.
 */
function ProgressLine({ className }: ScrollRailProps) {
  const { scrollYProgress } = useScroll();

  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none fixed inset-y-0 right-0 z-40 w-0.5', className)}
    >
      <div className="bg-hairline absolute inset-0" />
      <motion.div
        className="bg-accent-primary/80 absolute inset-0 origin-top"
        style={{ scaleY: scrollYProgress }}
      />
    </div>
  );
}

/** Where the sections start on the rail, and the scroll range that maps onto it. */
interface RailGeometry {
  ticks: (number | null)[];
  maxScroll: number;
}

const NO_GEOMETRY: RailGeometry = { ticks: SECTION_IDS.map(() => null), maxScroll: 0 };

/** What the preview plate is pointing at. */
interface RailTarget {
  /** The section a click here would land in. */
  section: number;
  /** The notch it would snap to, or -1. */
  tick: number;
}

/** A press on the rail, from `pointerdown` until it is released or lost. */
interface Gesture {
  pointerId: number;
  startY: number;
  /** Pointer offset from the head's centre when the head itself was grabbed. */
  grabOffset: number;
  /** Whether this press has become a drag — immediately, if it took the head. */
  dragging: boolean;
}

function maxScrollNow(): number {
  const root = document.documentElement;
  return Math.max(0, root.scrollHeight - root.clientHeight);
}

function LapRail({ className }: ScrollRailProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);

  const [geometry, setGeometry] = useState<RailGeometry>(NO_GEOMETRY);
  const [current, setCurrent] = useState(0);
  const [target, setTarget] = useState<RailTarget>({ section: 0, tick: -1 });
  const [isDragging, setIsDragging] = useState(false);

  // Mirrors of state for the event handlers and motion-value callbacks, which
  // must read the latest value without waiting for a render.
  const geometryRef = useRef<RailGeometry>(NO_GEOMETRY);
  const currentRef = useRef(0);
  const gestureRef = useRef<Gesture | null>(null);

  /** Displayed progress: where the head is drawn, 0 at the top, 1 at the end. */
  const progress = useMotionValue(0);
  const headY = useTransform(progress, (p) => `${p * 100}%`);
  const { scrollY } = useScroll();

  /** One pixel of scroll, in progress units — the rounding a jump introduces. */
  const tolerance = geometry.maxScroll > 0 ? 1 / geometry.maxScroll : 0;

  // Measure where each section starts. A ResizeObserver on <body> catches
  // every change to the page's height — images decoding, fonts swapping, a
  // section switching layouts at a breakpoint — and fires once on its own
  // when it starts observing, which doubles as the first measurement. A window
  // resize is watched as well, because a viewport that only gets taller
  // changes the scroll range without resizing the page.
  useEffect(() => {
    const measure = () => {
      const maxScroll = maxScrollNow();
      const tops = SECTION_IDS.map((id) => {
        const section = document.getElementById(id);
        return section ? section.getBoundingClientRect().top + window.scrollY : null;
      });
      const next: RailGeometry = { ticks: tickPositions(tops, maxScroll), maxScroll };
      geometryRef.current = next;
      setGeometry(next);

      // The scroll range moved under the head: put it back where it belongs.
      // A jump, not a glide — nothing the reader did moved it.
      const settled = maxScroll > 0 ? Math.min(1, window.scrollY / maxScroll) : 0;
      progress.jump(settled);
      const section = sectionIndexAt(settled, next.ticks, maxScroll > 0 ? 1 / maxScroll : 0);
      currentRef.current = section;
      setCurrent(section);
    };

    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [progress]);

  // Scroll → head. Progress is taken against the measured range rather than
  // motion's own scrollYProgress, so the head and the notches always agree on
  // what the bottom of the page is.
  useMotionValueEvent(scrollY, 'change', (y) => {
    const { maxScroll } = geometryRef.current;
    const next = maxScroll > 0 ? Math.min(1, Math.max(0, y / maxScroll)) : 0;
    if (prefersReducedMotion || gestureRef.current?.dragging) progress.jump(next);
    else animate(progress, next, HEAD_SPRING);
  });

  // Head → readout. Runs every frame the head moves; React hears about it only
  // when the head crosses into another section.
  useMotionValueEvent(progress, 'change', (p) => {
    const { ticks, maxScroll } = geometryRef.current;
    const section = sectionIndexAt(p, ticks, maxScroll > 0 ? 1 / maxScroll : 0);
    if (section === currentRef.current) return;
    currentRef.current = section;
    setCurrent(section);
  });

  const railBox = (): RailBox => {
    const rect = trackRef.current?.getBoundingClientRect();
    return rect ? { top: rect.top, height: rect.height } : { top: 0, height: 0 };
  };

  /**
   * Point the preview plate at a spot on the rail. The plate's position is
   * written straight to the DOM; its label only re-renders when the section
   * or the snapped notch actually changes.
   */
  const preview = (at: number, rail: RailBox, tick: number) => {
    const plate = plateRef.current;
    if (plate) plate.style.transform = `translateY(${at * rail.height}px)`;
    const { ticks, maxScroll } = geometryRef.current;
    const section = tick >= 0 ? tick : sectionIndexAt(at, ticks, maxScroll > 0 ? 1 / maxScroll : 0);
    setTarget((prev) =>
      prev.section === section && prev.tick === tick ? prev : { section, tick },
    );
  };

  /** Where a click at `clientY` would land, snapped to a notch if one is close. */
  const snappedTarget = (clientY: number, rail: RailBox) => {
    const raw = progressAtPointer(clientY, rail);
    const tick = nearestTick(raw, geometryRef.current.ticks, rail.height, SNAP_PX);
    const at = tick >= 0 ? (geometryRef.current.ticks[tick] ?? raw) : raw;
    return { at, tick };
  };

  const scrub = (clientY: number, grabOffset: number) => {
    const rail = railBox();
    const at = progressAtPointer(clientY, rail, grabOffset);
    // `instant`, overriding the `scroll-behavior: smooth` on <html>: a drag
    // has to move the page with the pointer, not chase it.
    window.scrollTo({ top: scrollTopFor(at, maxScrollNow()), behavior: 'instant' });
    preview(at, rail, -1);
  };

  const startDragging = (gesture: Gesture) => {
    gesture.dragging = true;
    setIsDragging(true);
  };

  const endGesture = () => {
    gestureRef.current = null;
    setIsDragging(false);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    // No text selection and no native drag while scrubbing.
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    const rail = railBox();
    const headCentre = rail.top + progress.get() * rail.height;
    const onHead = Math.abs(event.clientY - headCentre) <= HEAD_GRAB_PX;
    const gesture: Gesture = {
      pointerId: event.pointerId,
      startY: event.clientY,
      grabOffset: onHead ? event.clientY - headCentre : 0,
      dragging: false,
    };
    gestureRef.current = gesture;
    // Taking hold of the head is a drag from the first pixel. A press on the
    // bare rail waits to see whether it is a click or the start of a drag.
    if (onHead) startDragging(gesture);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) {
      // Hovering: preview where a click would land.
      const rail = railBox();
      const { at, tick } = snappedTarget(event.clientY, rail);
      preview(at, rail, tick);
      return;
    }
    if (!gesture.dragging) {
      if (Math.abs(event.clientY - gesture.startY) < DRAG_THRESHOLD_PX) return;
      startDragging(gesture);
    }
    scrub(event.clientY, gesture.grabOffset);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    if (!gesture.dragging) {
      // A click: jump to the spot, or to the start of the section whose notch
      // it landed near. It glides like the nav's anchor links do, unless the
      // visitor has asked for no motion.
      const rail = railBox();
      const { at, tick } = snappedTarget(event.clientY, rail);
      window.scrollTo({
        top: scrollTopFor(at, maxScrollNow()),
        behavior: prefersReducedMotion ? 'instant' : 'smooth',
      });
      preview(at, rail, tick);
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    endGesture();
  };

  // Capture can be lost without a pointerup — a context menu, an alt-tab, a
  // cancelled touch. Whatever the cause, the gesture is over.
  const onLostPointerCapture = (event: React.PointerEvent<HTMLDivElement>) => {
    if (gestureRef.current?.pointerId === event.pointerId) endGesture();
  };

  const targetId = SECTION_IDS[target.section];

  return (
    <div
      aria-hidden="true"
      data-dragging={isDragging || undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onLostPointerCapture}
      onLostPointerCapture={onLostPointerCapture}
      onPointerLeave={() => setTarget((prev) => (prev.tick === -1 ? prev : { ...prev, tick: -1 }))}
      className={cn(
        // 24px wide: a comfortable target that still clears the hero's
        // right-hand column, which starts 40px in from the edge.
        'group fixed inset-y-0 right-0 z-40 w-6 cursor-pointer touch-none select-none data-[dragging]:cursor-grabbing',
        className,
      )}
    >
      {/* Everything visible, dimmed as one while the visitor is reading. */}
      <div className="absolute inset-0 opacity-70 transition-opacity duration-[250ms] group-hover:opacity-100 group-data-[dragging]:opacity-100">
        {/* The readout: current section over the last, like a lap counter —
            at the head of the rail, level with the top bar, and clear of the
            hero's sponsor strip along the bottom edge. */}
        <div className="num absolute top-6 right-0 flex w-6 flex-col items-center gap-1.5 text-[9px] leading-none">
          <span className="text-accent-primary">{sectionNumber(current)}</span>
          <span className="bg-border-chip block h-px w-2.5" />
          <span className="text-text-faint group-hover:text-text-secondary transition-colors duration-[250ms]">
            {LAST_SECTION_NUMBER}
          </span>
        </div>

        <div
          ref={trackRef}
          data-rail-track=""
          className="absolute top-[72px] right-[11px] bottom-24 w-px"
        >
          <div className="bg-hairline-strong group-hover:bg-border-btn group-data-[dragging]:bg-border-btn absolute inset-0 transition-colors duration-[250ms]" />
          <motion.div
            className="bg-accent-primary absolute inset-0 origin-top"
            style={{ scaleY: progress }}
          />

          {geometry.ticks.map((position, i) =>
            position === null ? null : (
              <Notch
                key={SECTION_IDS[i]}
                position={position}
                progress={progress}
                tolerance={tolerance}
                hot={target.tick === i}
              />
            ),
          )}

          {/* The head: the Track Records car dot, core inside a halo. */}
          <motion.div
            data-rail-head=""
            className="absolute inset-x-0 top-0 h-full"
            style={{ y: headY }}
          >
            <span className="bg-accent-primary/25 absolute top-0 left-1/2 size-[11px] -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-[250ms] group-hover:scale-125 group-data-[dragging]:scale-150" />
            <span className="bg-track-dot shadow-glow-dot absolute top-0 left-1/2 size-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
          </motion.div>

          {/* The preview plate. Its transform is owned by `preview()`; the
              centring translate lives on the child so the two never meet. */}
          <div ref={plateRef} className="pointer-events-none absolute top-0 right-0">
            <div
              lang="en"
              className="absolute top-0 right-2 flex -translate-y-1/2 items-center opacity-0 transition-opacity duration-[250ms] group-hover:opacity-100 group-data-[dragging]:opacity-100"
            >
              <span className="border-accent-primary/50 bg-surface-2 tracking-label text-text border px-2.5 py-1.5 font-mono text-[10px] whitespace-nowrap uppercase">
                <span className="text-accent-primary">{sectionNumber(target.section)}</span>
                <span className="text-text-faint"> — </span>
                {targetId ? RAIL_LABELS[targetId] : ''}
              </span>
              <span className="bg-accent-primary/70 block h-px w-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface NotchProps {
  /** Where the section starts, in scroll progress. */
  position: number;
  progress: MotionValue<number>;
  /** One pixel of scroll in progress units, so a section jumped to reads as reached. */
  tolerance: number;
  /** Whether a click at the pointer would snap here. */
  hot: boolean;
}

/**
 * A section start, crossing the track. Lights cyan once the head reaches it —
 * the lit layer's opacity is a motion value, so passing a notch costs no
 * render.
 */
function Notch({ position, progress, tolerance, hot }: NotchProps) {
  const lit = useTransform(progress, (p) => (p + tolerance >= position ? 1 : 0));

  return (
    <div
      data-rail-notch=""
      className={cn(
        'absolute left-1/2 h-px -translate-x-1/2 transition-[width,background-color] duration-[250ms]',
        hot
          ? 'bg-text w-[15px]'
          : 'bg-border-chip group-hover:bg-text-faint w-[7px] group-hover:w-[11px]',
      )}
      style={{ top: `${position * 100}%` }}
    >
      <motion.div className="bg-accent-primary absolute inset-0" style={{ opacity: lit }} />
    </div>
  );
}
