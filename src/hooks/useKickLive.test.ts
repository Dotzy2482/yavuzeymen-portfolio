import { describe, expect, it } from 'vitest';

import { kickSlugFrom, parseKickChannel } from './useKickLive';

describe('kickSlugFrom', () => {
  it('reads the channel from a kick.com URL', () => {
    expect(kickSlugFrom('https://kick.com/yavuzeymen12')).toBe('yavuzeymen12');
    expect(kickSlugFrom('https://www.kick.com/yavuzeymen12/')).toBe('yavuzeymen12');
  });

  it('refuses anything that is not a kick.com channel', () => {
    expect(kickSlugFrom('')).toBeNull();
    expect(kickSlugFrom('https://kick.com/')).toBeNull();
    expect(kickSlugFrom('https://notkick.com/yavuz')).toBeNull();
    expect(kickSlugFrom('https://kick.com.evil.example/yavuz')).toBeNull();
  });
});

describe('parseKickChannel', () => {
  it('is offline when the channel has no livestream', () => {
    expect(parseKickChannel({ slug: 'x', livestream: null })).toEqual({
      live: false,
      viewers: null,
    });
  });

  it('is live, with the viewer count, while a livestream is on air', () => {
    expect(parseKickChannel({ livestream: { is_live: true, viewer_count: 42 } })).toEqual({
      live: true,
      viewers: 42,
    });
  });

  it('never claims live on an unexpected answer', () => {
    for (const body of [
      null,
      'live',
      42,
      {},
      { livestream: 'yes' },
      { livestream: { is_live: false } },
    ]) {
      expect(parseKickChannel(body).live).toBe(false);
    }
  });
});
