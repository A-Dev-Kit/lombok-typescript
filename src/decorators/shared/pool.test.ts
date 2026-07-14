import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { Pool, PoolExhaustedError, type Pooled } from '../../legacy/index.js';
import { Pool as PoolS3 } from '../../stage3/index.js';

function makeClassContext(name: string): ClassDecoratorContext & { metadata: object } {
  const metadata: Record<PropertyKey, unknown> = {};
  return {
    kind: 'class',
    name,
    metadata,
    addInitializer: () => {},
  } as unknown as ClassDecoratorContext & { metadata: object };
}

describe('@Pool (legacy)', () => {
  it('acquire returns fresh instances up to the pool size', () => {
    @Pool({ size: 2 })
    class Connection {
      id = Math.random();
    }
    const P = Connection as Pooled<typeof Connection>;
    const a = P.acquire();
    const b = P.acquire();
    expect(a).toBeInstanceOf(Connection);
    expect(b).toBeInstanceOf(Connection);
    expect(a).not.toBe(b);
  });

  it('reuses released instances (checkout/return lifecycle)', () => {
    @Pool({ size: 2 })
    class Buffer {}
    const P = Buffer as Pooled<typeof Buffer>;
    const first = P.acquire();
    P.release(first);
    const second = P.acquire();
    expect(second).toBe(first);
  });

  it('throws PoolExhaustedError when the pool is full and all leased', () => {
    @Pool({ size: 1 })
    class Slot {}
    const P = Slot as Pooled<typeof Slot>;
    P.acquire();
    expect(() => P.acquire()).toThrow(PoolExhaustedError);
    try {
      P.acquire();
    } catch (err) {
      expect(err).toBeInstanceOf(PoolExhaustedError);
      const e = err as PoolExhaustedError;
      expect(e.className).toContain('Slot');
      expect(e.size).toBe(1);
      expect(e.message).toMatch(/exhausted/i);
    }
  });

  it('invokes the reset callback on release before returning to the pool', () => {
    const reset = vi.fn((c: { closed: boolean }) => {
      c.closed = true;
    });
    @Pool({ size: 1, reset })
    class Handle {
      closed = false;
    }
    const P = Handle as Pooled<typeof Handle>;
    const h = P.acquire();
    P.release(h);
    expect(reset).toHaveBeenCalledWith(h);
    expect(h.closed).toBe(true);
  });

  it('uses a custom factory when provided', () => {
    let calls = 0;
    class Widget {
      constructor(public label: string) {
        calls += 1;
      }
    }
    const PooledWidget = Pool({ size: 2, factory: () => new Widget('made-by-factory') })(Widget);
    const P = PooledWidget as unknown as Pooled<typeof Widget>;
    const w = P.acquire();
    expect(w.label).toBe('made-by-factory');
    expect(calls).toBe(1);
  });

  it('release of an unknown instance is a no-op (idempotent)', () => {
    @Pool({ size: 1 })
    class Foo {}
    const P = Foo as Pooled<typeof Foo>;
    const outsider = new Foo(); // never acquired via the pool
    expect(() => P.release(outsider)).not.toThrow();
    // Pool still empty: we can acquire one fresh instance.
    const a = P.acquire();
    expect(a).not.toBe(outsider);
    // Releasing the same instance twice: second time is a no-op.
    P.release(a);
    P.release(a);
    const b = P.acquire();
    expect(b).toBe(a);
    // No third can be acquired.
    expect(() => P.acquire()).toThrow(PoolExhaustedError);
  });

  it('discards an instance whose reset throws (does not return it to the pool)', () => {
    @Pool({
      size: 1,
      reset: () => {
        throw new Error('reset failed');
      },
    })
    class Fragile {}
    const P = Fragile as Pooled<typeof Fragile>;
    const first = P.acquire();
    P.release(first); // reset throws internally; instance is discarded, slot freed
    const second = P.acquire(); // a fresh instance, not `first`
    expect(second).not.toBe(first);
    expect(second).toBeInstanceOf(Fragile);
  });

  it('rejects invalid size at decoration time', () => {
    expect(() => Pool({ size: 0 } as never)(class {})).toThrow(/positive integer/);
    expect(() => Pool({} as never)(class {})).toThrow(/positive integer/);
  });
});

describe('@Pool (stage3)', () => {
  it('exposes acquire/release on stage3 too', () => {
    class Worker {}
    // Apply the stage3 decorator explicitly — matches how phase4.test.ts exercises
    // stage3 decorators without switching the whole test file to the Stage 3 emit.
    const Wrapped = PoolS3({ size: 2 })(Worker, makeClassContext('Worker')) as typeof Worker;
    const P = Wrapped as Pooled<typeof Worker>;
    const w = P.acquire();
    expect(w).toBeInstanceOf(Wrapped);
    P.release(w);
    expect(P.acquire()).toBe(w);
  });
});
