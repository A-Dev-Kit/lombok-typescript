import { describe, expect, it, vi } from 'vitest';
import { debounceMethod } from './debounce.js';
import { deepFreezeInstance, deepFreezeValue } from './deep-freeze.js';
import { retryMethod } from './retry.js';
import { throttleMethod } from './throttle.js';
import { formatTraceArgs, traceClassMethods, traceMethod } from './trace.js';
import '../../validators/zod.js';
import { runValidation } from '../../validators/adapter.js';
import { Retry, Throttle, Trace } from '../../legacy/index.js';
import { z } from 'zod';

describe('phase 5 method wrappers', () => {
  it('retryMethod retries async failures', async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error('fail')).mockResolvedValue('ok');
    const wrapped = retryMethod(fn, { attempts: 2, delay: 1 });
    await expect(wrapped()).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('retryMethod honors retryIf', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('no-retry'));
    const wrapped = retryMethod(fn, {
      attempts: 3,
      delay: 1,
      retryIf: (error) => (error as Error).message === 'retry',
    });
    await expect(wrapped()).rejects.toThrow('no-retry');
    expect(fn).toHaveBeenCalledOnce();
  });

  it('retryMethod uses exponential backoff', async () => {
    vi.useFakeTimers();
    const fn = vi.fn().mockRejectedValueOnce(new Error('x')).mockResolvedValue('ok');
    const wrapped = retryMethod(fn, { attempts: 2, delay: 10, backoff: 'exponential' });
    const promise = wrapped();
    await vi.advanceTimersByTimeAsync(10);
    await expect(promise).resolves.toBe('ok');
    vi.useRealTimers();
  });

  it('retryMethod times out slow attempts', async () => {
    const fn = vi.fn(() => new Promise(() => {}));
    const wrapped = retryMethod(fn, { attempts: 1, timeout: 50 });
    await expect(wrapped()).rejects.toThrow('timed out');
  });

  it('debounceMethod delays trailing invocation', async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounceMethod(fn, 100);
    debounced('a');
    debounced('b');
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith('b');
    vi.useRealTimers();
  });

  it('debounceMethod flush is a no-op without pending args', () => {
    const fn = vi.fn();
    const debounced = debounceMethod(fn, 100, { trailing: false });
    debounced.flush();
    expect(fn).not.toHaveBeenCalled();
  });

  it('debounceMethod trailing callback skips when leading already ran', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounceMethod(fn, 100, { leading: true, trailing: true });
    debounced('only');
    expect(fn).toHaveBeenCalledOnce();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it('debounceMethod supports leading and cancel/flush', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounceMethod(fn, 100, { leading: true, trailing: false });
    debounced('a');
    debounced('b');
    expect(fn).toHaveBeenCalledWith('a');
    debounced.cancel();
    debounced('c');
    debounced.flush();
    expect(fn).toHaveBeenCalledWith('c');
    vi.useRealTimers();
  });

  it('throttleMethod limits calls', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const throttled = throttleMethod(fn, 100);
    throttled(1);
    throttled(2);
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith(1);
    vi.useRealTimers();
  });

  it('throttleMethod supports cancel and flush', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const throttled = throttleMethod(fn, 100);
    throttled(1);
    throttled(2);
    throttled.flush();
    expect(fn).toHaveBeenCalledTimes(2);
    throttled.cancel();
    vi.useRealTimers();
  });

  it('throttleMethod allows calls after the interval elapses', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const throttled = throttleMethod(fn, 100);
    throttled(1);
    vi.advanceTimersByTime(100);
    throttled(2);
    expect(fn).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it('Throttle decorator integrates with legacy', () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    class Scroll {
      @Throttle(100)
      onScroll(n: number) {
        spy(n);
      }
    }
    const s = new Scroll();
    s.onScroll(1);
    s.onScroll(2);
    expect(spy).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it('traceMethod logs entry and exit', () => {
    const logs: string[] = [];
    const logger = { log: (msg: string) => logs.push(msg) };
    const fn = (x: number) => x + 1;
    const traced = traceMethod(
      fn as (...args: unknown[]) => unknown,
      { logger, name: 'Svc' },
      'Svc.add',
    );
    expect(traced(1)).toBe(2);
    expect(logs.some((l) => l.startsWith('> Svc.add'))).toBe(true);
    expect(logs.some((l) => l.startsWith('< Svc.add'))).toBe(true);
  });

  it('traceMethod logs sync errors', () => {
    const logs: string[] = [];
    const logger = { log: (msg: string) => logs.push(msg) };
    const fn = () => {
      throw new Error('boom');
    };
    const traced = traceMethod(
      fn,
      { logger, args: false, result: false, timing: false },
      'Svc.run',
    );
    expect(() => traced()).toThrow('boom');
    expect(logs.some((l) => l.startsWith('! Svc.run'))).toBe(true);
  });

  it('traceMethod logs async rejections', async () => {
    const logs: string[] = [];
    const logger = { log: (msg: string) => logs.push(msg) };
    const fn = async () => {
      throw new Error('async-fail');
    };
    const traced = traceMethod(fn, { logger, args: false, result: false }, 'Svc.load');
    await expect(traced()).rejects.toThrow('async-fail');
    expect(logs.some((l) => l.startsWith('! Svc.load'))).toBe(true);
  });

  it('formatTraceArgs redacts by argument name', () => {
    expect(formatTraceArgs(['a', 'b'], ['email', 'token'], ['token'])).toEqual(['a', '[REDACTED]']);
  });

  it('traceMethod uses the default console logger', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    traceMethod(() => 1, {}, 'Test.fn')();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('traceMethod logs exit with timing only', () => {
    const logs: string[] = [];
    const logger = { log: (msg: string) => logs.push(msg) };
    traceMethod(() => 1, { logger, args: false, result: false, timing: true }, 'T.fn')();
    expect(logs.some((l) => l.startsWith('< T.fn ['))).toBe(true);
  });

  it('traceMethod logs exit with result only', () => {
    const logs: string[] = [];
    const logger = { log: (msg: string, ...rest: unknown[]) => logs.push(`${msg} ${rest.join(' ')}`) };
    traceMethod(() => 42, { logger, args: false, result: true, timing: false }, 'T.fn')();
    expect(logs.some((l) => l.includes('->'))).toBe(true);
  });

  it('traceMethod logs exit without result or timing details', () => {
    const logs: string[] = [];
    const logger = { log: (msg: string) => logs.push(msg) };
    traceMethod(() => 1, { logger, args: false, result: false, timing: false }, 'T.fn')();
    expect(logs).toContain('< T.fn');
  });

  it('traceClassMethods skips non-function prototype properties', () => {
    class Svc {
      ping() {
        return 1;
      }
    }
    Object.defineProperty(Svc.prototype, 'label', { value: 'svc', enumerable: true });
    traceClassMethods(Svc, { args: false, result: false, timing: false });
    expect((Svc.prototype as unknown as { label: string }).label).toBe('svc');
    expect(new Svc().ping()).toBe(1);
  });

  it('formatTraceArgs returns args unchanged without redact list', () => {
    expect(formatTraceArgs([1, 2], ['a', 'b'], undefined)).toEqual([1, 2]);
  });

  it('throttleMethod cancel is safe without a pending timer', () => {
    const fn = vi.fn();
    const throttled = throttleMethod(fn, 100);
    throttled.cancel();
    expect(fn).not.toHaveBeenCalled();
  });

  it('stacks Trace and Retry decorators', async () => {
    const logs: string[] = [];
    let calls = 0;
    class Svc {
      @Trace({ logger: { log: (m) => logs.push(m) }, args: false, result: false, timing: false })
      @Retry({ attempts: 2, delay: 1 })
      async load(id: string) {
        calls += 1;
        if (calls === 1) throw new Error('retry');
        return id;
      }
    }
    const svc = new Svc();
    await expect(svc.load('1')).resolves.toBe('1');
    expect(calls).toBe(2);
    expect(logs.length).toBeGreaterThan(0);
  });
});

describe('deep freeze', () => {
  it('freezes nested structures', () => {
    const obj = { a: { b: 1 }, c: [1, 2] };
    deepFreezeValue(obj);
    expect(() => {
      (obj.a as { b: number }).b = 2;
    }).toThrow();
    expect(() => {
      obj.c.push(3);
    }).toThrow();
  });

  it('deepFreezeInstance freezes own properties', () => {
    class Box {
      value = { n: 1 };
    }
    const box = new Box();
    deepFreezeInstance(box);
    expect(() => {
      (box.value as { n: number }).n = 2;
    }).toThrow();
  });

  it('skips non-plain objects like Date', () => {
    const date = new Date('2020-01-01');
    const frozen = deepFreezeValue(date);
    expect(frozen).toBe(date);
  });

  it('handles circular references without infinite recursion', () => {
    const obj: { self?: unknown } = {};
    obj.self = obj;
    expect(() => deepFreezeValue(obj)).not.toThrow();
    expect(Object.isFrozen(obj)).toBe(true);
  });

  it('freezes array-like objects that are not Array.isArray', () => {
    const arrayLike = Object.create(Array.prototype) as unknown[];
    arrayLike[0] = 1;
    const frozen = deepFreezeValue(arrayLike);
    expect(Object.isFrozen(frozen)).toBe(true);
  });
});

describe('validate adapter', () => {
  it('validates with zod schema', () => {
    const schema = z.string().email();
    expect(() => runValidation(schema, 'bad', 'zod')).toThrow();
    expect(() => runValidation(schema, 'a@b.com', 'zod')).not.toThrow();
  });
});
