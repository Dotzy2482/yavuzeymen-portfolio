import { act, render, screen } from '@testing-library/react';
import userEvent, { PointerEventsCheckLevel, type UserEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { preferReducedMotion } from '@/test/reducedMotion';

import { TrackRecords } from '../index';
import { COUNTRIES } from '../data/flags';
import { TRACK_REGIONS, tracks } from '../data/tracks';
import { LAP_DURATION_MS, type Track, type TrackRegion } from '../data/types';
import { parseLapTime } from '../lib/formatLapTime';

// Rendered through the feature's public entry point, and queried the way a
// visitor meets it: by role and accessible name. Every region, circuit and
// count is derived from the data rather than written out, because the data is
// expected to change — regions regrouped, real geometry, real lap times — and
// none of that should change what the controls do.

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

function tracksIn(region: TrackRegion): Track[] {
  return tracks.filter((track) => track.region === region);
}

function lastTrackIn(region: TrackRegion): Track {
  const list = tracksIn(region);
  return list[list.length - 1];
}

/** A region with a circuit after its first, so a selection can be seen to move. */
function regionWithChoice(): TrackRegion {
  const region = TRACK_REGIONS.find((candidate) => tracksIn(candidate).length > 1);
  if (!region) throw new Error('the data needs a region with at least two circuits');
  return region;
}

function lapMs(track: Track): number {
  const ms = parseLapTime(track.lap);
  if (ms === null) throw new Error(`${track.name} has a malformed lap time: ${track.lap}`);
  return ms;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Letters only, upper-cased — how a region id and its tab label are compared. */
function letters(text: string): string {
  return text.toUpperCase().replace(/[^A-Z]/g, '');
}

/**
 * The filter button for a region. Today it reads the region id verbatim;
 * comparing letters alone keeps that true of a display label that differs from
 * the id only in case, spacing or punctuation.
 */
function regionButton(region: TrackRegion): HTMLElement {
  return screen.getByRole('button', { name: (name) => letters(name) === letters(region) });
}

/**
 * Every button that picks one of these circuits. jsdom applies no media
 * queries, so each circuit's desktop row and mobile chip are both rendered —
 * in that document order.
 */
function buttonsFor(list: readonly Track[]): HTMLElement[] {
  return screen.queryAllByRole('button', {
    name: (name) => list.some((track) => name.includes(track.name) && name.includes(track.lap)),
  });
}

function trackButtons(track: Track): HTMLElement[] {
  return buttonsFor([track]);
}

function isCurrent(element: HTMLElement): boolean {
  return element.getAttribute('aria-current') === 'true';
}

function currentRegion(): TrackRegion {
  const region = TRACK_REGIONS.find((candidate) => isCurrent(regionButton(candidate)));
  if (!region) throw new Error('no region is marked current');
  return region;
}

/** The circuit the panel is showing, read off its heading. */
function panelTrack(): Track {
  const { textContent } = screen.getByRole('heading', { level: 3 });
  const track = tracks.find((candidate) => candidate.name === textContent);
  if (!track) throw new Error(`the panel shows no known circuit: ${textContent}`);
  return track;
}

const pauseButton = () => screen.getByRole('button', { name: 'Pause' });
const playButton = () => screen.getByRole('button', { name: 'Play' });
const speedButton = (speed: 1 | 2) => screen.getByRole('button', { name: `Speed ${speed}X` });

/** The chronometer, in milliseconds. */
function reading(): number {
  const text = screen.getByRole('timer').textContent ?? '';
  const ms = parseLapTime(text);
  if (ms === null) throw new Error(`the chronometer reads something other than a time: ${text}`);
  return ms;
}

// ---------------------------------------------------------------------------
// Expectations
// ---------------------------------------------------------------------------

function expectPanelShows(track: Track): void {
  expect(screen.getByRole('heading', { level: 3, name: track.name })).toBeInTheDocument();
  expect(
    screen.getByText(
      (text) => text.includes(track.length) && text.includes(`${track.corners} CORNERS`),
    ),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('img', { name: (name) => name.includes(track.name) }),
  ).toBeInTheDocument();
}

/**
 * The circuit's row and chip are marked current, and so is its region's tab —
 * and nothing else is.
 */
function expectSelected(track: Track): void {
  const selected = [...trackButtons(track), regionButton(track.region)];
  for (const button of selected) expect(isCurrent(button), button.textContent).toBe(true);
  expect(screen.getAllByRole('button', { current: true })).toHaveLength(selected.length);
}

/** Only this region's circuits are listed, each as a row and a chip. */
function expectListing(region: TrackRegion): void {
  for (const track of tracksIn(region)) expect(trackButtons(track), track.name).toHaveLength(2);
  expect(buttonsFor(tracks.filter((track) => track.region !== region))).toHaveLength(0);
}

/**
 * The chronometer after `screenMs` of playback at `speed`: the real lap time
 * scaled by how far round the marker is — never the screen time itself. Within
 * a millisecond, because the display floors and the loop sums per-frame steps.
 */
function expectReading(track: Track, screenMs: number, speed: 1 | 2 = 1): void {
  const expected = ((screenMs * speed) / LAP_DURATION_MS) * lapMs(track);
  expect(Math.abs(reading() - expected)).toBeLessThanOrEqual(1);
}

// ---------------------------------------------------------------------------
// Doubles
// ---------------------------------------------------------------------------

/** One 60 Hz frame. */
const FRAME_MS = 16;

/**
 * requestAnimationFrame under the test's control. Nothing runs until
 * `frames()` is called and every frame is exactly `ms` apart, so what the
 * chronometer reads after N frames is arithmetic, not a race with a clock.
 */
function installFrameClock() {
  let now = 0;
  let nextId = 0;
  const queued = new Map<number, FrameRequestCallback>();

  vi.spyOn(performance, 'now').mockImplementation(() => now);
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    nextId += 1;
    queued.set(nextId, callback);
    return nextId;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    queued.delete(id);
  });

  return {
    /** Frames the page is currently waiting on. */
    get queued(): number {
      return queued.size;
    },
    /** Runs `count` frames, `ms` apart, and returns the screen time that passed. */
    frames(count: number, ms: number = FRAME_MS): number {
      for (let i = 0; i < count; i++) {
        now += ms;
        const due = [...queued.values()];
        queued.clear();
        for (const callback of due) callback(now);
      }
      return count * ms;
    },
  };
}

/**
 * An IntersectionObserver that reports its target on screen the moment it is
 * observed. The inert one in setup.ts reports nothing, which leaves the panel
 * off screen for good: the right default, but no way to watch a lap.
 */
class OnScreenObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '0px';
  readonly thresholds: readonly number[] = [0];
  // Assigned in the body: `erasableSyntaxOnly` rules out parameter properties.
  private readonly callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element): void {
    const entry = {
      target,
      isIntersecting: true,
      intersectionRatio: 1,
      boundingClientRect: DOMRect.fromRect(),
      intersectionRect: DOMRect.fromRect(),
      rootBounds: null,
      time: 0,
    } satisfies IntersectionObserverEntry;
    this.callback([entry], this);
  }
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

// ---------------------------------------------------------------------------

let clock: ReturnType<typeof installFrameClock>;
let user: UserEvent;

beforeEach(() => {
  // Installed for every test, so no real frame loop ever runs here — even
  // under reduced motion, where the panel counts as visible from the start.
  clock = installFrameClock();
  // The pointer-events check walks computed styles up the tree on every click,
  // and jsdom has no stylesheet here for it to find anything in — pure cost,
  // in a file that clicks a great deal.
  user = userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/** Picks a circuit the way a visitor would: its region's tab, then its row. */
async function selectCircuit(track: Track): Promise<void> {
  await user.click(regionButton(track.region));
  await user.click(trackButtons(track)[0]);
}

describe('TrackRecords', () => {
  describe('region filter', () => {
    it('offers one button per region, in order, with exactly one current', () => {
      render(<TrackRecords />);

      const buttons = TRACK_REGIONS.map(regionButton);
      for (let i = 1; i < buttons.length; i++) {
        const order = buttons[i - 1].compareDocumentPosition(buttons[i]);
        expect(order & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      }
      expect(buttons.filter(isCurrent)).toHaveLength(1);
    });

    it('does not claim tab semantics it does not implement', () => {
      // A tablist owes the visitor tabpanels and arrow-key roving focus. The
      // filter is a plain button group and says so with aria-current.
      render(<TrackRecords />);

      expect(screen.queryByRole('tablist')).toBeNull();
      expect(screen.queryAllByRole('tab')).toHaveLength(0);
    });

    it('opens on a region with its circuits listed and the first one showing', () => {
      render(<TrackRecords />);
      const region = currentRegion();
      const first = tracksIn(region)[0];

      expectListing(region);
      expectPanelShows(first);
      expectSelected(first);
    });

    it.each(TRACK_REGIONS)(
      'switching to %s lists only its circuits and shows the first',
      async (region) => {
        render(<TrackRecords />);
        // Leave from somewhere else, parked on a later circuit, so a switch that
        // kept the old selection would show.
        const from = TRACK_REGIONS.find((candidate) => candidate !== region) ?? region;
        await selectCircuit(lastTrackIn(from));

        await user.click(regionButton(region));

        expectListing(region);
        expectPanelShows(tracksIn(region)[0]);
        expectSelected(tracksIn(region)[0]);
      },
    );

    it('switches region from the keyboard', async () => {
      render(<TrackRecords />);
      const target = TRACK_REGIONS.find((region) => !isCurrent(regionButton(region)));
      if (!target) throw new Error('the data needs at least two regions');

      act(() => regionButton(target).focus());
      await user.keyboard('{Enter}');

      expect(currentRegion()).toBe(target);
      expectPanelShows(tracksIn(target)[0]);
    });
  });

  describe('circuit list', () => {
    it('names every entry with its circuit, its country and its best lap', () => {
      // The flag is a gradient; the country exists for a screen reader only as
      // the chip's hidden label, so it has to reach the button's name.
      render(<TrackRecords />);

      for (const track of tracksIn(currentRegion())) {
        const buttons = trackButtons(track);
        expect(buttons, track.name).toHaveLength(2);
        for (const button of buttons) {
          expect(button).toHaveAccessibleName(
            expect.stringContaining(COUNTRIES[track.country].name),
          );
        }
      }
    });

    it.each(tracks)('selecting $name shows it in the panel and marks it current', async (track) => {
      render(<TrackRecords />);

      await selectCircuit(track);

      expectPanelShows(track);
      expectSelected(track);
    });

    it('lets the mobile chip pick a circuit just as the row does', async () => {
      render(<TrackRecords />);
      const region = regionWithChoice();
      await user.click(regionButton(region));
      const target = lastTrackIn(region);

      const [, chip] = trackButtons(target);
      await user.click(chip);

      expectPanelShows(target);
      // One selection, shown in both places: the row is marked as well.
      expectSelected(target);
    });

    it('selects a circuit from the keyboard', async () => {
      render(<TrackRecords />);
      const region = regionWithChoice();
      await user.click(regionButton(region));
      const target = lastTrackIn(region);

      act(() => trackButtons(target)[0].focus());
      await user.keyboard(' ');

      expectPanelShows(target);
      expectSelected(target);
    });
  });

  describe('transport controls', () => {
    it('offers Pause at 1× while the lap auto-plays', () => {
      render(<TrackRecords />);

      expect(pauseButton()).toHaveTextContent('Pause');
      expect(speedButton(1)).toHaveTextContent('1X');
      expect(screen.queryByRole('button', { name: 'Play' })).toBeNull();
    });

    it('offers Play under prefers-reduced-motion', () => {
      preferReducedMotion();

      render(<TrackRecords />);

      expect(playButton()).toHaveTextContent('Play');
      expect(speedButton(1)).toBeInTheDocument();
    });

    it('swaps Pause and Play on the same button, keeping focus on it', async () => {
      render(<TrackRecords />);
      const button = pauseButton();

      await user.click(button);
      expect(playButton()).toBe(button);
      expect(button).toHaveTextContent('Play');
      expect(button).toHaveFocus();

      await user.click(button);
      expect(pauseButton()).toBe(button);
      expect(button).toHaveTextContent('Pause');
    });

    it('alternates the speed between 1× and 2×', async () => {
      render(<TrackRecords />);
      const button = speedButton(1);

      await user.click(button);
      expect(speedButton(2)).toBe(button);
      expect(button).toHaveTextContent('2X');

      await user.click(button);
      expect(speedButton(1)).toBe(button);
      expect(button).toHaveTextContent('1X');
    });

    it('keeps the visitor’s transport choice across circuit and region changes', async () => {
      render(<TrackRecords />);
      await user.click(pauseButton());
      await user.click(speedButton(1));
      const elsewhere = TRACK_REGIONS.find((region) => region !== currentRegion());
      if (!elsewhere) throw new Error('the data needs at least two regions');

      // A region switch and a circuit pick, in one.
      await selectCircuit(lastTrackIn(elsewhere));

      expect(playButton()).toBeInTheDocument();
      expect(speedButton(2)).toBeInTheDocument();
    });
  });

  describe('lap animation', () => {
    it('requests no frames while the panel is off screen', () => {
      // setup.ts's observer never reports an intersection.
      render(<TrackRecords />);

      clock.frames(60);

      expect(clock.queued).toBe(0);
      expect(reading()).toBe(0);
    });

    it('auto-plays once on screen, counting the real lap time at screen speed', () => {
      vi.stubGlobal('IntersectionObserver', OnScreenObserver);
      render(<TrackRecords />);

      const elapsed = clock.frames(60);

      expect(reading()).toBeGreaterThan(0);
      expectReading(panelTrack(), elapsed);
    });

    it('freezes the chronometer on Pause and resumes from the same reading', async () => {
      vi.stubGlobal('IntersectionObserver', OnScreenObserver);
      render(<TrackRecords />);
      const track = panelTrack();

      const before = clock.frames(60);
      await user.click(pauseButton());
      const frozen = reading();
      clock.frames(60);
      expect(reading()).toBe(frozen);

      await user.click(playButton());
      const after = clock.frames(30);

      expectReading(track, before + after);
    });

    it('runs the lap twice as fast at 2×', async () => {
      vi.stubGlobal('IntersectionObserver', OnScreenObserver);
      render(<TrackRecords />);
      await user.click(speedButton(1));

      const elapsed = clock.frames(60);

      expectReading(panelTrack(), elapsed, 2);
    });

    it('stays on the line under reduced motion until Play is pressed', async () => {
      // No observer needed: under reduced motion the panel counts as visible.
      preferReducedMotion();
      render(<TrackRecords />);
      const track = panelTrack();

      clock.frames(60);
      expect(reading()).toBe(0);

      await user.click(playButton());
      const elapsed = clock.frames(60);

      expectReading(track, elapsed);
    });

    it('starts a newly picked circuit from the line', async () => {
      vi.stubGlobal('IntersectionObserver', OnScreenObserver);
      render(<TrackRecords />);
      const current = panelTrack();
      const next = tracks.find((track) => track.path !== current.path);
      if (!next) throw new Error('the data needs two circuits with different outlines');

      clock.frames(300);
      expect(reading()).toBeGreaterThan(0);

      await selectCircuit(next);
      const elapsed = clock.frames(1);

      expectReading(next, elapsed);
    });

    it.each(tracks)('reads exactly $lap as the marker crosses the line at $name', async (track) => {
      // The module's critical rule (docs/TRACK_RECORDS.md): the chronometer
      // lands on the personal best at the moment the marker is back on the
      // line. The frames are an uneven 97 ms, inside useRafLoop's 100 ms clamp,
      // so no frame lands on the line by arithmetic luck — the finish has to
      // be shown on purpose.
      vi.stubGlobal('IntersectionObserver', OnScreenObserver);
      render(<TrackRecords />);
      await selectCircuit(track);
      const timer = screen.getByRole('timer');

      const readings: string[] = [];
      const oneLapAndABit = Math.ceil(LAP_DURATION_MS / 97) + 2;
      for (let i = 0; i < oneLapAndABit; i++) {
        clock.frames(1, 97);
        readings.push(timer.textContent ?? '');
      }

      expect(readings).toContain(track.lap);
      for (const text of readings) expect(parseLapTime(text)).toBeLessThanOrEqual(lapMs(track));
    });
  });
});
