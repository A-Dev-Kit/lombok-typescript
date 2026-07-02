import { describe, expect, it } from 'vitest';
import { RetryNest } from './retry-nest.js';

describe('RetryNest', () => {
  it('retries like @Retry and ignores composeWithInterceptors', async () => {
    let calls = 0;
    class Svc {
      @RetryNest({ attempts: 3, delay: 1, composeWithInterceptors: true })
      async load(id: string) {
        calls += 1;
        if (calls < 3) throw new Error('boom');
        return id;
      }
    }
    const svc = new Svc();
    await expect(svc.load('x')).resolves.toBe('x');
    expect(calls).toBe(3);
  });

  it('propagates failure after exhausting attempts', async () => {
    let calls = 0;
    class Svc {
      @RetryNest({ attempts: 2, delay: 1 })
      async fail() {
        calls += 1;
        throw new Error('always');
      }
    }
    const svc = new Svc();
    await expect(svc.fail()).rejects.toThrow('always');
    expect(calls).toBe(2);
  });
});
