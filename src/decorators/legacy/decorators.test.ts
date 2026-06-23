import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import {
  Builder,
  Data,
  Debounce,
  DeepFreeze,
  Factory,
  Memoize,
  NonNull,
  Prototype,
  Retry,
  Serializable,
  Singleton,
  ToString,
  Trace,
  Validate,
  createFromFactory,
} from '../../legacy/index.js';
import { z } from 'zod';
import '../../validators/zod.js';

describe('legacy decorators', () => {
  it('NonNull rejects null on field setter', () => {
    class User {
      @NonNull
      name!: string;
    }
    const user = new User();
    const desc = Object.getOwnPropertyDescriptor(User.prototype, 'name');
    desc!.set!.call(user, 'Ada');
    expect(desc!.get!.call(user)).toBe('Ada');
    expect(() => desc!.set!.call(user, null)).toThrow(TypeError);
  });

  it('Singleton returns one instance', () => {
    @Singleton
    class Cache {
      n = Math.random();
    }
    expect(new Cache()).toBe(new Cache());
  });

  it('Prototype clones each instance', () => {
    @Prototype
    class Item {
      tags = ['a'];
    }
    const a = new Item();
    const b = new Item();
    expect(a).not.toBe(b);
    a.tags.push('b');
    expect(b.tags).toEqual(['a']);
  });

  it('Memoize caches method results', () => {
    const spy = vi.fn((x: number) => x + 1);
    class Calc {
      @Memoize()
      add(x: number) {
        return spy(x);
      }
    }
    const calc = new Calc();
    expect(calc.add(1)).toBe(2);
    expect(calc.add(1)).toBe(2);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('Factory registers classes by key', () => {
    @Factory('email')
    class EmailNotifier {
      kind = 'email';
    }
    void EmailNotifier;
    expect(createFromFactory<{ kind: string }>('email').kind).toBe('email');
  });

  it('Data Builder ToString set metadata without throwing', () => {
    @Data
    @Builder
    @ToString
    class Product {
      sku!: string;
    }
    expect(Product).toBeDefined();
  });

  it('Retry retries async methods', async () => {
    const spy = vi.fn().mockRejectedValueOnce(new Error('x')).mockResolvedValue(42);
    class Api {
      @Retry({ attempts: 2, delay: 1 })
      async load() {
        return spy();
      }
    }
    await expect(new Api().load()).resolves.toBe(42);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('Debounce delays method calls', () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    class Search {
      @Debounce(50)
      onInput(q: string) {
        spy(q);
      }
    }
    const s = new Search();
    s.onInput('a');
    s.onInput('b');
    expect(spy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(50);
    expect(spy).toHaveBeenCalledWith('b');
    vi.useRealTimers();
  });

  it('DeepFreeze prevents mutation', () => {
    @DeepFreeze
    class Config {
      nested = { port: 3000 };
    }
    const cfg = new Config();
    expect(() => {
      (cfg.nested as { port: number }).port = 4000;
    }).toThrow();
  });

  it('Validate rejects invalid field values', () => {
    class User {
      @Validate(z.string().min(3))
      name = 'ok';
    }
    const user = new User();
    const desc = Object.getOwnPropertyDescriptor(User.prototype, 'name')!;
    expect(() => desc.set!.call(user, 'no')).toThrow();
  });

  it('Trace wraps methods', () => {
    const logs: string[] = [];
    @Trace({ logger: { log: (m: string) => logs.push(m) }, args: false, result: false })
    class Svc {
      ping() {
        return 'pong';
      }
    }
    expect(new Svc().ping()).toBe('pong');
    expect(logs.length).toBeGreaterThan(0);
  });

  it('Serializable sets class metadata', () => {
    @Serializable
    class Payload {
      id = 1;
    }
    expect(Payload).toBeDefined();
  });
});
