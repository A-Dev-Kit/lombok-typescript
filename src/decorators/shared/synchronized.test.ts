import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { Synchronized, SynchronizedTimeoutError } from '../../legacy/index.js';
import { Synchronized as SynchronizedS3 } from '../../stage3/index.js';
import { stage3Backend } from '../../stage3/backend.js';
import { synchronizedMethodStage3 } from './phase5-logic.js';

function makeMethodContext(name: string): ClassMethodDecoratorContext {
  return {
    kind: 'method',
    name,
    static: false,
    private: false,
    metadata: {},
    addInitializer: () => {},
  } as unknown as ClassMethodDecoratorContext;
}

const tick = () => new Promise<void>((r) => setTimeout(r, 0));
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

describe('Synchronized (legacy)', () => {
  it('serializes overlapping calls to one method (no read-modify-write race)', async () => {
    class Account {
      balance = 100;
      @Synchronized()
      async withdraw(amount: number) {
        const before = this.balance;
        await tick(); // interleaving point without the mutex
        this.balance = before - amount;
      }
    }
    const acc = new Account();
    await Promise.all([acc.withdraw(50), acc.withdraw(50)]);
    expect(acc.balance).toBe(0); // 50 if the calls interleaved
  });

  it('default shared lock serializes different decorated methods on one instance', async () => {
    const order: string[] = [];
    class Svc {
      @Synchronized()
      async a() {
        order.push('a:start');
        await sleep(15);
        order.push('a:end');
      }
      @Synchronized()
      async b() {
        order.push('b:start');
        order.push('b:end');
      }
    }
    const svc = new Svc();
    await Promise.all([svc.a(), svc.b()]);
    expect(order).toEqual(['a:start', 'a:end', 'b:start', 'b:end']);
  });

  it('distinct named locks do not contend with each other', async () => {
    const order: string[] = [];
    class Svc {
      @Synchronized('alpha')
      async a() {
        order.push('a:start');
        await sleep(15);
        order.push('a:end');
      }
      @Synchronized('beta')
      async b() {
        order.push('b:start');
        order.push('b:end');
      }
    }
    const svc = new Svc();
    await Promise.all([svc.a(), svc.b()]);
    // b runs to completion while a is still holding its own lock.
    expect(order).toEqual(['a:start', 'b:start', 'b:end', 'a:end']);
  });

  it('separate instances never contend', async () => {
    const order: string[] = [];
    class Svc {
      constructor(private id: string) {}
      @Synchronized()
      async run() {
        order.push(`${this.id}:start`);
        await sleep(15);
        order.push(`${this.id}:end`);
      }
    }
    await Promise.all([new Svc('x').run(), new Svc('y').run()]);
    expect(order).toEqual(['x:start', 'y:start', 'x:end', 'y:end']);
  });

  it('a rejecting call does not poison the queue', async () => {
    class Svc {
      @Synchronized()
      async boom() {
        throw new Error('boom');
      }
      @Synchronized()
      async ok() {
        return 'ok';
      }
    }
    const svc = new Svc();
    await expect(svc.boom()).rejects.toThrow('boom');
    await expect(svc.ok()).resolves.toBe('ok');
  });

  it('queued call rejects with SynchronizedTimeoutError when acquisition times out', async () => {
    class Svc {
      @Synchronized({ timeout: 10 })
      async slow(ms: number) {
        await sleep(ms);
        return 'done';
      }
    }
    const svc = new Svc();
    const first = svc.slow(60); // holds the lock past the second call's timeout
    const second = svc.slow(1);
    await expect(second).rejects.toBeInstanceOf(SynchronizedTimeoutError);
    try {
      await svc.slow(200); // fresh call also times out behind `first`
    } catch (err) {
      const e = err as SynchronizedTimeoutError;
      expect(e.lockName).toBe('$lock');
      expect(e.timeout).toBe(10);
      expect(e.message).toMatch(/not acquired within 10ms/);
    }
    await expect(first).resolves.toBe('done'); // the holder is unaffected
  });

  it('timeout never fires without contention, and later calls still run after a timeout', async () => {
    class Svc {
      @Synchronized({ timeout: 10 })
      async quick() {
        return 'quick';
      }
      @Synchronized({ timeout: 10 })
      async slow() {
        await sleep(40);
        return 'slow';
      }
    }
    const svc = new Svc();
    await expect(svc.quick()).resolves.toBe('quick');
    const holder = svc.slow();
    await expect(svc.quick()).rejects.toBeInstanceOf(SynchronizedTimeoutError);
    await expect(holder).resolves.toBe('slow');
    await expect(svc.quick()).resolves.toBe('quick'); // lock is free again
  });

  it('wraps sync methods too (result becomes a Promise)', async () => {
    class Svc {
      @Synchronized()
      add(a: number, b: number) {
        return a + b;
      }
    }
    const result = new Svc().add(2, 3);
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBe(5);
  });
});

describe('Synchronized (stage3)', () => {
  it('serializes via the stage3 export', async () => {
    const order: string[] = [];
    class Svc {
      async run(tag: string, ms: number) {
        order.push(`${tag}:start`);
        await sleep(ms);
        order.push(`${tag}:end`);
      }
    }
    const wrapped = SynchronizedS3()(
      Svc.prototype.run as (this: unknown, ...args: unknown[]) => unknown,
      makeMethodContext('run'),
    ) as typeof Svc.prototype.run;
    Svc.prototype.run = wrapped;
    const svc = new Svc();
    await Promise.all([svc.run('one', 15), svc.run('two', 1)]);
    expect(order).toEqual(['one:start', 'one:end', 'two:start', 'two:end']);
  });

  it('stage3 glue stores metadata and accepts an explicit name', async () => {
    const fn = async function (this: unknown) {
      return 'v';
    };
    const wrapped = synchronizedMethodStage3(stage3Backend, fn, makeMethodContext('m'), {
      name: 'custom',
    });
    await expect(wrapped.call({})).resolves.toBe('v');
  });
});
