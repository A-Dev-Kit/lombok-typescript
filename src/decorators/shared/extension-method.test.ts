import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { ExtensionMethod } from '../../legacy/index.js';
import { ExtensionMethod as ExtensionMethodS3 } from '../../stage3/index.js';
import { legacyBackend } from '../../legacy/backend.js';
import { stage3Backend } from '../../stage3/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';

function makeClassContext(name: string): ClassDecoratorContext & { metadata: object } {
  const metadata: Record<PropertyKey, unknown> = {};
  return {
    kind: 'class',
    name,
    metadata,
    addInitializer: () => {},
  } as unknown as ClassDecoratorContext & { metadata: object };
}

class StringUtils {
  static reverse(s: string): string {
    return s.split('').reverse().join('');
  }
  static shout(s: string, punctuation = '!'): string {
    return s.toUpperCase() + punctuation;
  }
  static readonly VERSION = 1; // non-function static — must be ignored
}

class IntUtils {
  static abs(n: number): number {
    return n < 0 ? -n : n;
  }
}

describe('@ExtensionMethod (legacy)', () => {
  it('installs a helper static as an instance method that forwards `this` as the first argument', () => {
    class BoxUtils {
      static describe(box: { value: number }, prefix: string): string {
        return `${prefix}:${box.value}`;
      }
      static double(box: { value: number }): number {
        return box.value * 2;
      }
    }

    @ExtensionMethod([BoxUtils])
    class Box {
      constructor(public value: number) {}
      declare describe: (prefix: string) => string;
      declare double: () => number;
    }

    const b = new Box(21);
    expect(b.describe('n')).toBe('n:21');
    expect(b.double()).toBe(42);
  });

  it('installs across multiple helpers', () => {
    @ExtensionMethod([StringUtils, IntUtils])
    class Mixed {
      declare reverse: () => string;
      declare abs: () => number;
    }
    const m = new Mixed();
    expect(typeof m.reverse).toBe('function');
    expect(typeof m.abs).toBe('function');
  });

  it('ignores non-function statics and reserved keys (name/length/prototype)', () => {
    @ExtensionMethod([StringUtils])
    class Host {}
    const proto = Host.prototype as Record<string, unknown>;
    expect('VERSION' in proto).toBe(false);
    expect('name' in Object.getOwnPropertyDescriptors(proto)).toBe(false);
    expect('length' in Object.getOwnPropertyDescriptors(proto)).toBe(false);
    expect('prototype' in Object.getOwnPropertyDescriptors(proto)).toBe(false);
  });

  it('default onConflict=error throws when a helper method name clashes with a user method', () => {
    expect(() => {
      @ExtensionMethod([StringUtils])
      class Clash {
        reverse(): string {
          return 'user';
        }
      }
      void Clash;
    }).toThrow(/method 'reverse' from StringUtils conflicts/);
  });

  it('onConflict=skip preserves the pre-existing user method', () => {
    @ExtensionMethod([StringUtils], { onConflict: 'skip' })
    class Skip {
      reverse(): string {
        return 'user';
      }
    }
    const s = new Skip();
    expect(s.reverse()).toBe('user');
  });

  it('onConflict=override replaces the pre-existing user method', () => {
    @ExtensionMethod([StringUtils], { onConflict: 'override' })
    class Overridden {
      reverse(): string {
        return 'user';
      }
    }
    const o = new Overridden();
    // Extension forwards `this` — StringUtils.reverse expects a string, so use the string form.
    const result = (o.reverse as (this: string) => string).call('abc');
    expect(result).toBe('cba');
  });

  it('detects conflicts between two helpers under the default policy', () => {
    class HelperA {
      static shared(): string {
        return 'a';
      }
    }
    class HelperB {
      static shared(): string {
        return 'b';
      }
    }
    expect(() => {
      @ExtensionMethod([HelperA, HelperB])
      class C {}
      void C;
    }).toThrow(/method 'shared' from HelperB conflicts/);
  });

  it('include filter installs only listed method names', () => {
    @ExtensionMethod([StringUtils], { include: ['reverse'] })
    class OnlyReverse {}
    const proto = OnlyReverse.prototype as Record<string, unknown>;
    expect(typeof proto.reverse).toBe('function');
    expect('shout' in proto).toBe(false);
  });

  it('exclude filter drops listed method names', () => {
    @ExtensionMethod([StringUtils], { exclude: ['shout'] })
    class NoShout {}
    const proto = NoShout.prototype as Record<string, unknown>;
    expect(typeof proto.reverse).toBe('function');
    expect('shout' in proto).toBe(false);
  });

  it('writes an introspectable EXTENSION_METHOD metadata record', () => {
    @ExtensionMethod([StringUtils, IntUtils])
    class Marked {}
    const stored = legacyBackend.metadata.get<Array<{ helperName: string; methods: string[] }>>(
      MetadataKeys.EXTENSION_METHOD,
      Marked,
    );
    expect(stored).toEqual([
      { helperName: 'StringUtils', methods: ['reverse', 'shout'] },
      { helperName: 'IntUtils', methods: ['abs'] },
    ]);
  });

  it('rejects a non-function helper at decoration time', () => {
    expect(() => {
      @ExtensionMethod([{} as unknown as new () => unknown])
      class Bad {}
      void Bad;
    }).toThrow(/every helper must be a class or function/);
  });

  it('does not treat Object.prototype members (like toString) as conflicts', () => {
    class WithToString {
      static toString(): string {
        return 'from-helper';
      }
    }
    // Should NOT throw — user did not define their own toString.
    expect(() => {
      @ExtensionMethod([WithToString])
      class Ok {}
      void Ok;
    }).not.toThrow();
  });

  it('detects conflicts with methods defined on an ancestor class (not Object.prototype)', () => {
    class Base {
      shared(): string {
        return 'from-base';
      }
    }
    class Helper {
      static shared(): string {
        return 'from-helper';
      }
    }
    expect(() => {
      @ExtensionMethod([Helper])
      class Derived extends Base {}
      void Derived;
    }).toThrow(/method 'shared' from Helper conflicts/);
  });
});

describe('@ExtensionMethod (stage3)', () => {
  it('installs helper statics on the class prototype via stage3', () => {
    class Target {}
    ExtensionMethodS3([StringUtils])(Target, makeClassContext('Target'));
    const proto = Target.prototype as Record<string, unknown>;
    expect(typeof proto.reverse).toBe('function');
    expect(typeof proto.shout).toBe('function');
  });

  it('writes EXTENSION_METHOD metadata on the stage3 context bag', () => {
    class Target2 {}
    const ctx = makeClassContext('Target2');
    ExtensionMethodS3([IntUtils])(Target2, ctx);
    const stored = stage3Backend.metadata.get<Array<{ helperName: string; methods: string[] }>>(
      MetadataKeys.EXTENSION_METHOD,
      ctx.metadata,
    );
    expect(stored).toEqual([{ helperName: 'IntUtils', methods: ['abs'] }]);
  });

  it('honours conflict policies under stage3', () => {
    class Helper {
      static clash(): string {
        return 'helper';
      }
    }
    class Target3 {
      clash(): string {
        return 'user';
      }
    }
    // default 'error' should throw
    expect(() => ExtensionMethodS3([Helper])(Target3, makeClassContext('Target3'))).toThrow(
      /method 'clash' from Helper conflicts/,
    );
    // skip: existing method preserved
    class Target4 {
      clash(): string {
        return 'user';
      }
    }
    ExtensionMethodS3([Helper], { onConflict: 'skip' })(Target4, makeClassContext('Target4'));
    expect(new Target4().clash()).toBe('user');
  });
});
