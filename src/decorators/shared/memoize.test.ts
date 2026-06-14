import { describe, expect, it, vi } from 'vitest';
import { memoizeMethod } from './memoize.js';

describe('memoize', () => {
  it('caches return values', () => {
    const fn = vi.fn((n: number) => n * 2);
    const memoized = memoizeMethod(fn as (...args: unknown[]) => unknown);
    expect(memoized(2)).toBe(4);
    expect(memoized(2)).toBe(4);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('expires entries when ttl is set', async () => {
    const fn = vi.fn(() => Date.now());
    const memoized = memoizeMethod(fn as (...args: unknown[]) => unknown, { ttl: 20 });
    const first = memoized();
    await new Promise((r) => setTimeout(r, 30));
    const second = memoized();
    expect(first).not.toBe(second);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('returns cached value within ttl window', async () => {
    const fn = vi.fn(() => Math.random());
    const memoized = memoizeMethod(fn, { ttl: 500 });
    const first = memoized();
    const second = memoized();
    expect(first).toBe(second);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
