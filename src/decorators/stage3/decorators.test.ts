import { describe, expect, it, vi } from 'vitest';
import { nonNullFieldStage3 } from '../shared/non-null.js';
import { stage3Backend } from '../../stage3/backend.js';
import {
  Builder,
  Data,
  Factory,
  Memoize,
  Prototype,
  Singleton,
  ToString,
  createFromFactory,
} from '../../stage3/index.js';

function makeClassContext(name = 'TestClass'): ClassDecoratorContext & { metadata: object } {
  const metadata: Record<PropertyKey, unknown> = {};
  return {
    kind: 'class',
    name,
    metadata,
    addInitializer: () => {},
  } as unknown as ClassDecoratorContext & { metadata: object };
}

function makeFieldContext(name = 'fieldA'): ClassFieldDecoratorContext & { metadata: object } {
  const metadata: Record<PropertyKey, unknown> = {};
  return {
    kind: 'field',
    name,
    metadata,
    static: false,
    private: false,
    access: { get: () => undefined, set: () => {}, has: () => false },
    addInitializer: () => {},
  } as unknown as ClassFieldDecoratorContext & { metadata: object };
}

function makeMethodContext(name = 'methodA'): ClassMethodDecoratorContext & { metadata: object } {
  const metadata: Record<PropertyKey, unknown> = {};
  return {
    kind: 'method',
    name,
    metadata,
    static: false,
    private: false,
    access: { get: () => undefined, has: () => false },
    addInitializer: () => {},
  } as unknown as ClassMethodDecoratorContext & { metadata: object };
}

describe('stage3 exported decorators', () => {
  it('NonNull rejects null initial value', () => {
    const init = nonNullFieldStage3(stage3Backend, makeFieldContext('name'))!;
    expect(() => init(null as never)).toThrow(/must not be null/);
    expect(init('ok' as never)).toBe('ok');
  });

  it('Singleton returns one instance', () => {
    class Cache {
      n = Math.random();
    }
    const Wrapped = Singleton(Cache, makeClassContext('Cache')) as typeof Cache;
    expect(new Wrapped()).toBe(new Wrapped());
  });

  it('Prototype clones each instance', () => {
    class Item {
      tags = ['a'];
    }
    const Wrapped = Prototype(Item, makeClassContext('Item')) as typeof Item;
    const a = new Wrapped();
    const b = new Wrapped();
    expect(a).not.toBe(b);
  });

  it('Memoize caches method results', () => {
    const spy = vi.fn((x: number) => x + 1);
    class Calc {
      add(x: number) {
        return spy(x);
      }
    }
    const wrapped = Memoize()(
      Calc.prototype.add as (...args: unknown[]) => unknown,
      makeMethodContext('add'),
    ) as (this: Calc, x: number) => number;
    expect(wrapped.call(new Calc(), 1)).toBe(2);
    expect(wrapped.call(new Calc(), 1)).toBe(2);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('Factory registers classes by key', () => {
    class SmsChannel {
      kind = 'sms';
    }
    Factory('sms')(SmsChannel, makeClassContext('SmsChannel'));
    expect(createFromFactory<{ kind: string }>('sms').kind).toBe('sms');
  });

  it('Data Builder ToString apply cleanly', () => {
    class Product {}
    Data(Product, makeClassContext('Product'));
    Builder(Product, makeClassContext('Product'));
    ToString(Product, makeClassContext('Product'));
    expect(Product).toBeDefined();
  });
});
