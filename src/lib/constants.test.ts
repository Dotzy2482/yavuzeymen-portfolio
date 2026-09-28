import { describe, expect, it } from 'vitest';

import tokens from '@/styles/tokens.css?raw';

import { DURATION } from './constants';

describe('DURATION', () => {
  it('matches the --duration-* tokens it copies', () => {
    const fromTokens = Object.fromEntries(
      [...tokens.matchAll(/--duration-(\w+):\s*(\d+)ms/g)].map(([, name, ms]) => [
        name,
        Number(ms) / 1000,
      ]),
    );
    expect(fromTokens).toEqual(DURATION);
  });
});
