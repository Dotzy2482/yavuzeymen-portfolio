/**
 * Measures how smoothly the built site runs, in headless Chrome over the
 * DevTools protocol — the numbers behind docs/plans/07-performance.md.
 *
 *   pnpm build && pnpm preview                 # in one terminal
 *   node docs/assets/measure-frames.mjs        # in another
 *   node docs/assets/measure-frames.mjs --url http://localhost:4174/ --label base
 *   node docs/assets/measure-frames.mjs --only mobile --throttle 6
 *
 * Writes `<label>.json` (and a screenshot per scenario) to `--out`, default
 * the working directory, and prints a one-line summary per scenario.
 *
 * WHY HEADLESS CHROME. The desktop app's browser pane fires no
 * requestAnimationFrame callbacks unless it is on screen, and frame timing is
 * the whole point. Set CHROME_PATH if the binary is somewhere unusual.
 *
 * WHAT IT RECORDS, per scenario:
 *
 * - Frame deltas from a requestAnimationFrame loop in the page: median, p95,
 *   p99, the count over 33 ms (a dropped frame at 60 Hz and then some) and the
 *   worst. Headless Chrome runs at the display's own refresh rate, so on a
 *   165 Hz monitor a frame is 6.06 ms and every delta is a multiple of it.
 * - Main-thread work per delivered frame, from Performance.getMetrics. This is
 *   the number to compare: it does not depend on the refresh rate.
 * - Script and style-recalculation time per second, paints per second and
 *   long tasks (> 50 ms), from a trace.
 *
 * The CPU is throttled 4× by default, after the page has loaded, so a
 * problem that a fast desktop hides shows up. Before measuring, the page is
 * walked once top to bottom so lazy images and the Track Records chunk are in;
 * the scroll scenarios then scroll by script in fixed steps every 16 ms.
 *
 * Numbers move by 10–20 % between runs on a machine doing anything else.
 * Compare runs made back to back, alternate the builds, and repeat.
 */

import { access, mkdtemp, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

const { values: args } = parseArgs({
  options: {
    url: { type: 'string', default: 'http://localhost:4173/' },
    label: { type: 'string', default: 'run' },
    out: { type: 'string', default: '.' },
    throttle: { type: 'string', default: '4' },
    only: { type: 'string' },
  },
});
const THROTTLE = Number(args.throttle);
const ONLY = args.only?.split(',');

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function findChrome() {
  for (const candidate of CHROME_CANDIDATES) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Next candidate.
    }
  }
  throw new Error('no Chrome binary found; set CHROME_PATH');
}

// ---------------------------------------------------------------------------
// A minimal DevTools protocol client: one page target, one socket.

function connect(socketUrl) {
  const socket = new WebSocket(socketUrl);
  let nextId = 0;
  const pending = new Map();
  const listeners = new Set();
  socket.onmessage = (message) => {
    const data = JSON.parse(message.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject, method } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(new Error(`${method}: ${data.error.message}`));
      else resolve(data.result);
    } else if (data.method) {
      for (const listener of listeners) listener(data.method, data.params);
    }
  };
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++nextId;
      pending.set(id, { resolve, reject, method });
      socket.send(JSON.stringify({ id, method, params }));
    });
  return {
    ready: new Promise((resolve) => (socket.onopen = resolve)),
    send,
    listen: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    close: () => socket.close(),
  };
}

// ---------------------------------------------------------------------------
// In-page helpers.

const RECORD = (ms) => `(async () => {
  const deltas = [];
  let last = performance.now();
  let on = true;
  const tick = (now) => { if (!on) return; deltas.push(now - last); last = now; requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  await (${ms === null ? 'window.__done' : `new Promise((r) => setTimeout(r, ${ms}))`});
  on = false;
  return deltas.slice(1);
})()`;

const SCROLL_TO_END = (step) => `(() => {
  window.__done = new Promise((resolve) => {
    const max = document.documentElement.scrollHeight - innerHeight;
    let y = 0;
    const id = setInterval(() => {
      y += ${step};
      scrollTo(0, y);
      if (y >= max) { clearInterval(id); setTimeout(resolve, 300); }
    }, 16);
  });
  return 1;
})()`;

function frameStats(deltas, taskMsPerSec) {
  const sorted = [...deltas].sort((a, b) => a - b);
  const at = (p) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
  const seconds = deltas.reduce((sum, d) => sum + d, 0) / 1000;
  const round = (v) => Math.round(v * 10) / 10;
  return {
    frames: sorted.length,
    median: round(at(0.5)),
    p95: round(at(0.95)),
    p99: round(at(0.99)),
    over33: sorted.filter((d) => d > 33.4).length,
    max: round(sorted[sorted.length - 1]),
    workPerFrame: Math.round(((taskMsPerSec * seconds) / sorted.length) * 100) / 100,
  };
}

// ---------------------------------------------------------------------------

async function main() {
  const chromePath = await findChrome();
  const port = 9400 + Math.floor(Math.random() * 400);
  const profile = await mkdtemp(join(tmpdir(), 'measure-frames-'));
  const chrome = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--autoplay-policy=no-user-gesture-required',
    '--hide-scrollbars',
    '--window-size=1440,900',
    'about:blank',
  ]);

  try {
    let target;
    for (let i = 0; i < 50 && !target; i++) {
      try {
        const response = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, {
          method: 'PUT',
        });
        target = await response.json();
      } catch {
        await sleep(200);
      }
    }
    if (!target) throw new Error('Chrome did not start');

    const cdp = connect(target.webSocketDebuggerUrl);
    await cdp.ready;
    const { send } = cdp;
    const evaluate = async (expression) => {
      const result = await send('Runtime.evaluate', {
        expression,
        awaitPromise: true,
        returnByValue: true,
      });
      if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
      return result.result.value;
    };
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Performance.enable');

    const metrics = async () => {
      const { metrics: list } = await send('Performance.getMetrics');
      return Object.fromEntries(list.map((m) => [m.name, m.value]));
    };

    /** Runs `fn` under a trace and returns its frame deltas with the costs. */
    async function measured(fn) {
      const events = [];
      const stop = cdp.listen((method, params) => {
        if (method === 'Tracing.dataCollected') events.push(...params.value);
      });
      const complete = new Promise((resolve) => {
        const off = cdp.listen((method) => {
          if (method === 'Tracing.tracingComplete') {
            off();
            resolve();
          }
        });
      });
      await send('Tracing.start', {
        traceConfig: { includedCategories: ['devtools.timeline', 'toplevel'] },
        transferMode: 'ReportEvents',
      });
      const before = await metrics();
      const started = Date.now();
      const deltas = await fn();
      const after = await metrics();
      const seconds = (Date.now() - started) / 1000;
      await send('Tracing.end');
      await complete;
      stop();

      const perSecond = (name) => ((after[name] - before[name]) * 1000) / seconds;
      const mainThreads = new Set(
        events
          .filter((e) => e.ph === 'M' && e.name === 'thread_name')
          .filter((e) => e.args.name === 'CrRendererMain')
          .map((e) => `${e.pid}:${e.tid}`),
      );
      const onMain = events.filter((e) => e.ph === 'X' && mainThreads.has(`${e.pid}:${e.tid}`));
      return {
        ...frameStats(deltas, perSecond('TaskDuration')),
        scriptMsPerSec: Math.round(perSecond('ScriptDuration')),
        styleMsPerSec: Math.round(perSecond('RecalcStyleDuration')),
        paintsPerSec: Math.round(onMain.filter((e) => e.name === 'Paint').length / seconds),
        longTasks: onMain.filter((e) => e.name === 'RunTask' && e.dur > 50_000).length,
      };
    }

    const screenshot = async (name) => {
      const { data } = await send('Page.captureScreenshot', { format: 'png' });
      await writeFile(join(args.out, `${args.label}-${name}.png`), Buffer.from(data, 'base64'));
    };

    async function load(mobile) {
      await send('Emulation.setCPUThrottlingRate', { rate: 1 });
      await send(
        'Emulation.setDeviceMetricsOverride',
        mobile
          ? { width: 390, height: 844, deviceScaleFactor: 3, mobile: true }
          : { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false },
      );
      await send('Emulation.setTouchEmulationEnabled', { enabled: mobile, maxTouchPoints: 5 });
      await send('Page.navigate', { url: args.url });
      await sleep(1500);
      await evaluate(
        `new Promise((r) => document.readyState === 'complete' ? r() : addEventListener('load', r))`,
      );
      await evaluate('document.fonts.ready.then(() => 1)');
      // Walk the page once so lazy images and the Track Records chunk are in.
      await evaluate(`(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
          scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 1500));
      })()`);
      await send('Emulation.setCPUThrottlingRate', { rate: THROTTLE });
    }

    async function goTo(selector, offset = 0) {
      await evaluate(`(() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        scrollTo(0, el.getBoundingClientRect().top + scrollY + ${offset});
      })()`);
      await sleep(1500);
    }

    const scroll = (step) =>
      measured(() => evaluate(SCROLL_TO_END(step)).then(() => evaluate(RECORD(null))));
    const idle = (ms) => measured(() => evaluate(RECORD(ms)));

    /** An orbit across the head and away from it, at about 60 Hz. */
    const hover = (ms) =>
      measured(async () => {
        const recording = evaluate(RECORD(ms));
        const start = Date.now();
        for (let i = 0; Date.now() - start < ms; i++) {
          const angle = i / 30;
          await send('Input.dispatchMouseEvent', {
            type: 'mouseMoved',
            x: 720 + Math.cos(angle) * 260,
            y: 330 + Math.sin(angle * 1.3) * 200,
          });
          await sleep(14);
        }
        return recording;
      });

    const want = (group) => !ONLY || ONLY.includes(group);
    const report = { label: args.label, url: args.url, throttle: THROTTLE };

    if (want('desktop')) {
      await load(false);
      await screenshot('desktop-hero');
      report.desktopScroll = await scroll(24);
      await goTo('#hero');
      report.heroIdle = await idle(4000);
      report.heroHover = await hover(5000);
      await goTo('#content [class*="w-[1070px]"]', -120);
      report.fanPlaying = await idle(8000);
      await screenshot('desktop-fan');
      await goTo('#career');
      report.idleCareer = await idle(5000);
      await goTo('#track-records', 200);
      report.idleTrackRecords = await idle(5000);
      await goTo('#setup', 300);
      report.idleSetup = await idle(5000);
      await screenshot('desktop-setup');
    }
    if (want('mobile')) {
      await load(true);
      await screenshot('mobile-hero');
      report.mobileScroll = await scroll(18);
      await goTo('#about');
      report.mobileIdleAbout = await idle(5000);
      await screenshot('mobile-about');
    }

    await writeFile(join(args.out, `${args.label}.json`), JSON.stringify(report, null, 2));
    for (const [name, r] of Object.entries(report)) {
      if (typeof r !== 'object') continue;
      console.log(
        `${name.padEnd(17)} median ${r.median}  p95 ${r.p95}  p99 ${r.p99}  >33ms ${r.over33}  ` +
          `work/frame ${r.workPerFrame} ms  script ${r.scriptMsPerSec}  style ${r.styleMsPerSec}  ` +
          `paints/s ${r.paintsPerSec}  long ${r.longTasks}`,
      );
    }
    cdp.close();
  } finally {
    chrome.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
