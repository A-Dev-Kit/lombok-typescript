import { describe, expect, it } from 'vitest';
import { stage3Backend } from './backend.js';
import {
  defineClassDecorator,
  defineFieldDecorator,
  defineMethodDecorator,
  defineGetterDecorator,
  defineSetterDecorator,
} from './decorate.js';

/**
 * These tests exercise the Stage 3 decorator factories by INVOKING the returned
 * decorator functions directly with synthetic contexts. We do NOT use `@`-syntax
 * because the project's tsconfig has `experimentalDecorators: true`, which
 * compiles `@` to legacy-shape decorators. Calling factories as plain functions
 * is more rigorous anyway — it tests the factory's contract in isolation.
 */

function makeClassContext(name = 'TestClass'): ClassDecoratorContext & {
  metadata: object;
} {
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

function makeGetterContext(name = 'getterA'): ClassGetterDecoratorContext & { metadata: object } {
  const metadata: Record<PropertyKey, unknown> = {};
  return {
    kind: 'getter',
    name,
    metadata,
    static: false,
    private: false,
    access: { get: () => undefined, has: () => false },
    addInitializer: () => {},
  } as unknown as ClassGetterDecoratorContext & { metadata: object };
}

function makeSetterContext(name = 'setterA'): ClassSetterDecoratorContext & { metadata: object } {
  const metadata: Record<PropertyKey, unknown> = {};
  return {
    kind: 'setter',
    name,
    metadata,
    static: false,
    private: false,
    access: { set: () => {}, has: () => false },
    addInitializer: () => {},
  } as unknown as ClassSetterDecoratorContext & { metadata: object };
}

describe('defineClassDecorator (stage3)', () => {
  it('writes class-level metadata via context.metadata as the storage target', () => {
    const KEY = 'lombok-ts:test:tracked';
    const Tracked = defineClassDecorator((backend, _value, context) => {
      backend.metadata.set(KEY, context.metadata as object, undefined, true);
    });

    class User {}
    const ctx = makeClassContext();
    Tracked(User, ctx);

    expect(stage3Backend.metadata.get<boolean>(KEY, ctx.metadata)).toBe(true);
  });

  it('returns the original class when logic returns void', () => {
    const Identity = defineClassDecorator(() => undefined);
    class User {}
    const ctx = makeClassContext();
    const result = Identity(User, ctx);
    expect(result).toBeUndefined();
  });

  it('can return a replacement class', () => {
    const Wrap = defineClassDecorator((_, value) => {
      const Cls = value as { new (): { wrapped: boolean } };
      return class extends Cls {
        wrapped = true;
      };
    });
    class User {}
    const ctx = makeClassContext();
    const Replacement = Wrap(User, ctx);
    expect(Replacement).toBeDefined();
    expect(Replacement).not.toBe(User);
  });
});

describe('defineFieldDecorator (stage3)', () => {
  it('writes field metadata under the property name', () => {
    const KEY = 'lombok-ts:test:nonNull';
    const NonNull = defineFieldDecorator((backend, context) => {
      backend.metadata.set(KEY, context.metadata as object, context.name, true);
    });

    const ctx = makeFieldContext('email');
    NonNull(undefined, ctx);

    expect(stage3Backend.metadata.get<boolean>(KEY, ctx.metadata, 'email')).toBe(true);
  });

  it('returning a transformer rewrites the initializer', () => {
    const Doubled = defineFieldDecorator<unknown, number>(() => {
      return function (_initial: number) {
        return _initial * 2;
      };
    });

    const ctx = makeFieldContext('count') as ClassFieldDecoratorContext<unknown, number> & {
      metadata: object;
    };
    const initializer = Doubled(undefined, ctx);
    expect(initializer).toBeTypeOf('function');
    expect(initializer!.call({}, 5)).toBe(10);
  });

  it('returning void leaves initializer untouched', () => {
    const NoOp = defineFieldDecorator(() => undefined);
    const ctx = makeFieldContext();
    expect(NoOp(undefined, ctx)).toBeUndefined();
  });
});

describe('defineMethodDecorator (stage3)', () => {
  it('writes method metadata under the property name', () => {
    const KEY = 'lombok-ts:test:logged';
    const Logged = defineMethodDecorator((backend, _value, context) => {
      backend.metadata.set(KEY, context.metadata as object, context.name, true);
    });

    const orig = function hello() {
      return 'hi';
    };
    const ctx = makeMethodContext('hello');
    Logged(orig, ctx);

    expect(stage3Backend.metadata.get<boolean>(KEY, ctx.metadata, 'hello')).toBe(true);
  });

  it('can return a replacement method that wraps the original', () => {
    const Double = defineMethodDecorator<unknown, [number], number>((_, value) => {
      return function (this: unknown, n: number) {
        return value.call(this, n) * 2;
      };
    });

    const square = (n: number) => n * n;
    const ctx = makeMethodContext('square');
    const wrapped = Double(square as never, ctx);
    expect(wrapped).toBeTypeOf('function');
    expect((wrapped as (n: number) => number)(3)).toBe(18);
  });
});

describe('defineGetterDecorator (stage3)', () => {
  it('can wrap a getter', () => {
    const KEY = 'lombok-ts:test:getter';
    const TrackedGetter = defineGetterDecorator((backend, _value, context) => {
      backend.metadata.set(KEY, context.metadata as object, context.name, true);
    });
    const orig = () => 'value';
    const ctx = makeGetterContext('name');
    TrackedGetter(orig, ctx);
    expect(stage3Backend.metadata.get<boolean>(KEY, ctx.metadata, 'name')).toBe(true);
  });
});

describe('defineSetterDecorator (stage3)', () => {
  it('can wrap a setter', () => {
    const KEY = 'lombok-ts:test:setter';
    const TrackedSetter = defineSetterDecorator((backend, _value, context) => {
      backend.metadata.set(KEY, context.metadata as object, context.name, true);
    });
    const orig = (_v: unknown) => {};
    const ctx = makeSetterContext('name');
    TrackedSetter(orig, ctx);
    expect(stage3Backend.metadata.get<boolean>(KEY, ctx.metadata, 'name')).toBe(true);
  });
});

describe('getClassMetadata helper', () => {
  it('returns undefined when class has no Symbol.metadata', async () => {
    const { getClassMetadata } = await import('./index.js');
    class Bare {}
    expect(getClassMetadata(Bare)).toBeUndefined();
  });

  it('returns the metadata object when Symbol.metadata is present', async () => {
    const { getClassMetadata } = await import('./index.js');
    const meta = { tracked: true };
    const cls = class WithMeta {} as unknown as { [Symbol.metadata]?: object } & (new () => object);
    cls[Symbol.metadata] = meta;
    expect(getClassMetadata(cls)).toBe(meta);
  });
});
