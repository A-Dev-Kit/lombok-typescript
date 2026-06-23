import { describe, expect, it, vi } from 'vitest';
import { computeBackoffDelay, sleep } from './timing-utils.js';

describe('timing-utils', () => {
  it('computes fixed, linear, and exponential backoff', () => {
    expect(computeBackoffDelay(100, 2, 'fixed')).toBe(100);
    expect(computeBackoffDelay(100, 2, 'linear')).toBe(200);
    expect(computeBackoffDelay(100, 3, 'exponential')).toBe(400);
  });

  it('sleep resolves after delay', async () => {
    vi.useFakeTimers();
    const promise = sleep(50);
    vi.advanceTimersByTime(50);
    await expect(promise).resolves.toBeUndefined();
    vi.useRealTimers();
  });
});
