import { describe, expect, it } from 'vitest';
import { legacyBackend } from './backend.js';
import {
  defineClassDecorator,
  defineFieldDecorator,
  defineMethodDecorator,
  defineParameterDecorator,
} from './decorate.js';

describe('defineClassDecorator (legacy)', () => {
  it('writes class-level metadata via the legacy backend', () => {
    const KEY = 'lombok-ts:test:tracked';
    const Tracked = defineClassDecorator((backend, target) => {
      backend.metadata.set(KEY, target, undefined, true);
    });

    @Tracked
    class User {}

    expect(legacyBackend.metadata.get<boolean>(KEY, User)).toBe(true);
  });

  it('passes through the constructor as target', () => {
    let captured: unknown;
    const Capture = defineClassDecorator((_, target) => {
      captured = target;
    });

    @Capture
    class User {}

    expect(captured).toBe(User);
  });

  it('can return a replacement constructor', () => {
    const Wrap = defineClassDecorator((_, target) => {
      const Cls = target as { new (): { wrapped: boolean } };
      return class extends Cls {
        wrapped = true;
      };
    }) as ClassDecorator;

    @Wrap
    class User {}

    const u = new (User as unknown as new () => { wrapped: boolean })();
    expect(u.wrapped).toBe(true);
  });
});

describe('defineFieldDecorator (legacy)', () => {
  it('writes field-level metadata under the property key', () => {
    const KEY = 'lombok-ts:test:nonNull';
    const NonNull = defineFieldDecorator((backend, target, key) => {
      backend.metadata.set(KEY, target, key, true);
    });

    class User {
      @NonNull declare name: string;
    }

    expect(legacyBackend.metadata.get<boolean>(KEY, User.prototype, 'name')).toBe(true);
  });

  it('multiple fields each get isolated metadata', () => {
    const KEY = 'lombok-ts:test:marked';
    const Mark = defineFieldDecorator((backend, target, key) => {
      backend.metadata.set(KEY, target, key, key);
    });

    class User {
      @Mark declare a: string;
      @Mark declare b: string;
    }

    expect(legacyBackend.metadata.get(KEY, User.prototype, 'a')).toBe('a');
    expect(legacyBackend.metadata.get(KEY, User.prototype, 'b')).toBe('b');
  });
});

describe('defineMethodDecorator (legacy)', () => {
  it('writes method-level metadata under the property key', () => {
    const KEY = 'lombok-ts:test:logged';
    const Logged = defineMethodDecorator((backend, target, key, desc) => {
      backend.metadata.set(KEY, target, key, true);
      return desc;
    });

    class Service {
      @Logged hello() {
        return 'hi';
      }
    }

    expect(legacyBackend.metadata.get<boolean>(KEY, Service.prototype, 'hello')).toBe(true);
  });

  it('can replace the underlying method via descriptor', () => {
    const Double = defineMethodDecorator<(n: number) => number>((_, __, ___, desc) => {
      const orig = desc.value!;
      desc.value = function (this: unknown, n: number) {
        return orig.call(this, n) * 2;
      };
      return desc;
    });

    class Calc {
      @Double square(n: number) {
        return n * n;
      }
    }

    expect(new Calc().square(3)).toBe(18);
  });
});

describe('defineParameterDecorator (legacy)', () => {
  it('writes parameter-index metadata under the method key', () => {
    const KEY = 'lombok-ts:test:nonNullParams';
    const NonNullParam = defineParameterDecorator((backend, target, key, idx) => {
      const list = (
        backend.metadata.get<number[]>(KEY, target, key as string | symbol) ?? []
      ).slice();
      list.push(idx);
      backend.metadata.set(KEY, target, key as string | symbol, list);
    });

    class Service {
      greet(@NonNullParam first: string, _second: number, @NonNullParam third: boolean) {
        return `${first} ${_second} ${third}`;
      }
    }

    const indices = legacyBackend.metadata.get<number[]>(KEY, Service.prototype, 'greet');
    expect(new Set(indices)).toEqual(new Set([0, 2]));
  });
});
