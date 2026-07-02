import { describe, expect, it } from 'vitest';
import { MemoizeNest } from './memoize-nest.js';

describe('MemoizeNest', () => {
  it('caches results like @Memoize and ignores the requestSafe flag', () => {
    let calls = 0;
    class Svc {
      @MemoizeNest({ requestSafe: true })
      compute(n: number) {
        calls += 1;
        return n * 2;
      }
    }
    const svc = new Svc();
    expect(svc.compute(2)).toBe(4);
    expect(svc.compute(2)).toBe(4);
    expect(calls).toBe(1);
  });

  it('works with no options', () => {
    let calls = 0;
    class Svc {
      @MemoizeNest()
      value() {
        calls += 1;
        return 42;
      }
    }
    const svc = new Svc();
    expect(svc.value()).toBe(42);
    expect(svc.value()).toBe(42);
    expect(calls).toBe(1);
  });
});
