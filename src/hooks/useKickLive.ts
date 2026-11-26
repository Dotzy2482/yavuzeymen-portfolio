/**
 * Whether Yavuz is live on Kick right now — polled from the visitor's browser.
 *
 * The site is static: there is no server to ask Kick on its behalf, and Kick's
 * documented API (api.kick.com/public/v1) needs an OAuth app token that cannot
 * ship in a public bundle. So this reads the channel endpoint kick.com's own
 * web app uses, `kick.com/api/v2/channels/<slug>`. It answers CORS for any
 * origin and needs no token; `livestream` is null while the channel is
 * offline and an object (`is_live`, `viewer_count`, `session_title`) while it
 * is on air. It is undocumented, so everything about it is treated as
 * optional: a failed request, a non-JSON body or a changed shape all read as
 * "not live", and the page simply shows its offline state. Being wrong about
 * "offline" costs nothing; claiming "live" wrongly would.
 *
 * One poll is shared by every consumer (the hero bar and each social link row)
 * through a module-level store: it starts with the first subscriber, stops
 * with the last, waits while the tab is hidden and refreshes the moment it is
 * shown again.
 *
 * The channel comes from `VITE_KICK_URL` (see data/profile.ts); with it unset,
 * nothing is ever requested.
 */

import { useSyncExternalStore } from 'react';

import { profile } from '@/data';

export interface KickLiveStatus {
  live: boolean;
  /** Viewer count while live, when Kick reports one. */
  viewers: number | null;
}

const OFFLINE: KickLiveStatus = { live: false, viewers: null };
/** Two minutes: a stream lasts hours, and the endpoint is not ours to hammer. */
const POLL_MS = 120_000;

/** The channel slug from a kick.com URL, or null for anything else. */
export function kickSlugFrom(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!/(^|\.)kick\.com$/.test(parsed.hostname)) return null;
    const slug = parsed.pathname.split('/').find(Boolean);
    return slug && /^[\w-]+$/.test(slug) ? slug : null;
  } catch {
    return null;
  }
}

/** Reads the channel endpoint's body; anything unexpected is offline. */
export function parseKickChannel(body: unknown): KickLiveStatus {
  if (typeof body !== 'object' || body === null || !('livestream' in body)) return OFFLINE;
  const stream: unknown = body.livestream;
  if (typeof stream !== 'object' || stream === null) return OFFLINE;
  if ('is_live' in stream && stream.is_live === false) return OFFLINE;
  const viewers =
    'viewer_count' in stream && typeof stream.viewer_count === 'number'
      ? stream.viewer_count
      : null;
  return { live: true, viewers };
}

let status: KickLiveStatus = OFFLINE;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function publish(next: KickLiveStatus) {
  if (next.live === status.live && next.viewers === status.viewers) return;
  status = next;
  for (const listener of listeners) listener();
}

async function poll(slug: string) {
  if (document.visibilityState === 'hidden') return;
  try {
    const response = await fetch(`https://kick.com/api/v2/channels/${slug}`, {
      headers: { Accept: 'application/json' },
    });
    publish(response.ok ? parseKickChannel(await response.json()) : OFFLINE);
  } catch {
    publish(OFFLINE);
  }
}

function subscribe(listener: () => void) {
  const slug = kickSlugFrom(profile.socials.kick);
  listeners.add(listener);
  const onVisible = () => {
    if (slug && document.visibilityState === 'visible') void poll(slug);
  };
  if (slug && timer === null) {
    void poll(slug);
    timer = setInterval(() => void poll(slug), POLL_MS);
  }
  document.addEventListener('visibilitychange', onVisible);

  return () => {
    listeners.delete(listener);
    document.removeEventListener('visibilitychange', onVisible);
    if (listeners.size === 0 && timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };
}

const getSnapshot = () => status;
const getServerSnapshot = () => OFFLINE;

export function useKickLive(): KickLiveStatus {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
