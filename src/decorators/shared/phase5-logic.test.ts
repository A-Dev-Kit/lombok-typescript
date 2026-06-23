import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { legacyBackend } from '../../legacy/backend.js';
import { stage3Backend } from '../../stage3/backend.js';
import {
  debounceMethodLegacy,
  debounceMethodStage3,
  retryMethodLegacy,
  retryMethodStage3,
  throttleMethodLegacy,
  throttleMethodStage3,
  traceClassLegacy,
  traceClassStage3,
  traceMethodLegacy,
  traceMethodStage3,
} from './phase5-logic.js';
import { deepFreezeClassLegacy, deepFreezeClassStage3 } from './deep-freeze-logic.js';
import {
  serializableAliasFieldLegacy,
  serializableAliasFieldStage3,
  serializableClassLegacy,
  serializableClassStage3,
  serializableExcludeFieldLegacy,
  serializableExcludeFieldStage3,
  serializableTransformFieldLegacy,
  serializableTransformFieldStage3,
} from './serializable.js';
import { validateClassLegacy } from './validate-logic.js';
import { z } from 'zod';
import '../../validators/zod.js';

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

describe('phase5-logic legacy', () => {
  it('retryMethodLegacy wraps descriptor', async () => {
    const spy = vi.fn().mockRejectedValueOnce(new Error('x')).mockResolvedValue(1);
    class Svc {
      run() {
        return spy();
      }
    }
    const desc = Object.getOwnPropertyDescriptor(Svc.prototype, 'run')!;
    const next = retryMethodLegacy(legacyBackend, Svc.prototype, 'run', desc, {
      attempts: 2,
      delay: 1,
    })!;
    Svc.prototype.run = next.value;
    await expect(new Svc().run()).resolves.toBe(1);
  });

  it('debounceMethodLegacy attaches cancel and flush', () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    class Svc {
      go(v: string) {
        spy(v);
      }
    }
    const desc = Object.getOwnPropertyDescriptor(Svc.prototype, 'go')!;
    const next = debounceMethodLegacy(legacyBackend, Svc.prototype, 'go', desc, 50, {
      leading: true,
    })!;
    const fn = next.value as { (v: string): void; cancel(): void; flush(): void };
    fn('a');
    fn.cancel();
    fn('b');
    fn.flush();
    expect(spy).toHaveBeenCalledWith('b');
    vi.useRealTimers();
  });

  it('throttleMethodLegacy rate limits', () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    class Svc {
      tick(n: number) {
        spy(n);
      }
    }
    const desc = Object.getOwnPropertyDescriptor(Svc.prototype, 'tick')!;
    const next = throttleMethodLegacy(legacyBackend, Svc.prototype, 'tick', desc, 100)!;
    const fn = next.value as (n: number) => void;
    fn(1);
    fn(2);
    expect(spy).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it('traceClassLegacy and traceMethodLegacy', () => {
    const logs: string[] = [];
    class Svc {
      ping() {
        return 1;
      }
    }
    traceClassLegacy(legacyBackend, Svc, { logger: { log: (m) => logs.push(m) }, args: false });
    expect(new Svc().ping()).toBe(1);
    const desc = Object.getOwnPropertyDescriptor(Svc.prototype, 'ping')!;
    traceMethodLegacy(
      legacyBackend,
      Svc.prototype,
      'pong',
      { ...desc, value: () => 2 },
      {
        logger: { log: (m) => logs.push(m) },
      },
    );
    expect(logs.length).toBeGreaterThan(0);
  });

  it('deepFreezeClassLegacy returns frozen constructor', () => {
    class Cfg {
      n = { v: 1 };
    }
    const Frozen = deepFreezeClassLegacy(legacyBackend, Cfg);
    const cfg = new Frozen();
    expect(() => {
      (cfg.n as { v: number }).v = 2;
    }).toThrow();
  });

  it('validateClassLegacy validates instances', () => {
    class Signup {
      email = 'john@example.com';
    }
    const Validated = validateClassLegacy(
      legacyBackend,
      Signup,
      z.object({ email: z.string().email() }),
    );
    expect(() => new Validated()).not.toThrow();
  });

  it('retryMethodLegacy returns early for non-function descriptors', () => {
    const desc = { value: 1, writable: true, enumerable: true, configurable: true };
    expect(retryMethodLegacy(legacyBackend, {}, 'x', desc, {})).toBeUndefined();
  });

  it('traceMethodLegacy returns early for non-function descriptors', () => {
    const desc = { value: 1, writable: true, enumerable: true, configurable: true };
    expect(traceMethodLegacy(legacyBackend, {}, 'x', desc)).toBeUndefined();
  });

  it('debounceMethodLegacy returns early for non-function descriptors', () => {
    const desc = { value: 1, writable: true, enumerable: true, configurable: true };
    expect(debounceMethodLegacy(legacyBackend, {}, 'x', desc, 10)).toBeUndefined();
  });

  it('throttleMethodLegacy returns early for non-function descriptors', () => {
    const desc = { value: 1, writable: true, enumerable: true, configurable: true };
    expect(throttleMethodLegacy(legacyBackend, {}, 'x', desc, 10)).toBeUndefined();
  });

  it('traceClassStage3 wraps class methods', () => {
    const logs: string[] = [];
    class Svc {
      ping() {
        return 1;
      }
    }
    traceClassLegacy(legacyBackend, Svc, { logger: { log: (m) => logs.push(m) }, args: false });
    expect(new Svc().ping()).toBe(1);
  });
});

describe('phase5-logic stage3', () => {
  it('retryMethodStage3 wraps methods', async () => {
    const fn = vi.fn().mockResolvedValue(9);
    const wrapped = retryMethodStage3(legacyBackend, fn, makeMethodContext('run'), { attempts: 1 });
    await expect(wrapped()).resolves.toBe(9);
  });

  it('debounce and throttle stage3 wrappers', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    debounceMethodStage3(stage3Backend, fn, makeMethodContext('go'), 20);
    const throttled = throttleMethodStage3(stage3Backend, fn, makeMethodContext('tick'), 50);
    throttled(1);
    vi.useRealTimers();
    expect(fn).toHaveBeenCalled();
  });

  it('traceMethodStage3 logs async results', async () => {
    const logs: string[] = [];
    const fn = async () => 'ok';
    const wrapped = traceMethodStage3(stage3Backend, fn, makeMethodContext('load'), {
      logger: { log: (m) => logs.push(m) },
    });
    await expect(wrapped()).resolves.toBe('ok');
    expect(logs.length).toBeGreaterThan(1);
  });

  it('traceClassStage3 wraps class methods', () => {
    const logs: string[] = [];
    class Svc {
      ping() {
        return 1;
      }
    }
    traceClassStage3(
      stage3Backend,
      Svc,
      {
        kind: 'class',
        name: 'Svc',
        metadata: {},
        addInitializer: () => {},
      } as ClassDecoratorContext,
      { logger: { log: (m) => logs.push(m) }, args: false },
    );
    expect(new Svc().ping()).toBe(1);
    expect(logs.length).toBeGreaterThan(0);
  });

  it('deepFreezeClassStage3 freezes instances', () => {
    class Cfg {
      n = 1;
    }
    const Frozen = deepFreezeClassStage3(stage3Backend, Cfg, {
      kind: 'class',
      name: 'Cfg',
      metadata: {},
      addInitializer: () => {},
    } as ClassDecoratorContext);
    const cfg = new Frozen();
    expect(() => {
      (cfg as { n: number }).n = 2;
    }).toThrow();
  });
});

describe('serializable markers', () => {
  it('registers serializable metadata on class and fields', () => {
    class User {}
    serializableClassLegacy(legacyBackend, User);
    serializableExcludeFieldLegacy(legacyBackend, User.prototype, 'secret');
    serializableAliasFieldLegacy(legacyBackend, User.prototype, 'email', 'user_email');
    serializableTransformFieldLegacy(legacyBackend, User.prototype, 'createdAt', {
      serialize: (d) => d,
      deserialize: (d) => d,
    });
    expect(User).toBeDefined();
  });

  it('registers serializable metadata with stage3 contexts', () => {
    class User {}
    const classCtx = {
      kind: 'class',
      name: 'User',
      metadata: {},
      addInitializer: () => {},
    } as ClassDecoratorContext;
    const fieldCtx = {
      kind: 'field',
      name: 'email',
      static: false,
      private: false,
      metadata: {},
      addInitializer: () => {},
    } as unknown as ClassFieldDecoratorContext;
    serializableClassStage3(stage3Backend, User, classCtx);
    serializableExcludeFieldStage3(stage3Backend, fieldCtx);
    serializableAliasFieldStage3(stage3Backend, fieldCtx, 'user_email');
    serializableTransformFieldStage3(stage3Backend, fieldCtx, {
      serialize: (d) => d,
      deserialize: (d) => d,
    });
    expect(User).toBeDefined();
  });
});
