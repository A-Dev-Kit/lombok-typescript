import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import {
  Builder,
  Data,
  Factory,
  Memoize,
  NonNull,
  Prototype,
  Singleton,
  ToString,
  createFromFactory,
} from '../../legacy/index.js';

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
});
