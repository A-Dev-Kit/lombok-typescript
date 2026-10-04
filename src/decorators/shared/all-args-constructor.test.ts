import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { AllArgsConstructor } from '../../legacy/index.js';
import { AllArgsConstructor as AllArgsConstructorS3 } from '../../stage3/index.js';
import { legacyBackend } from '../../legacy/backend.js';
import { stage3Backend } from '../../stage3/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import {
  DEFAULT_ALL_ARGS_STATIC_NAME,
  type AllArgsConstructorMetadata,
} from './all-args-constructor.js';

function makeClassContext(name: string): ClassDecoratorContext & { metadata: object } {
  const metadata: Record<PropertyKey, unknown> = {};
  return {
    kind: 'class',
    name,
    metadata,
    addInitializer: () => {},
  } as unknown as ClassDecoratorContext & { metadata: object };
}

describe('@AllArgsConstructor (legacy)', () => {
  it('records default metadata with no options', () => {
    @AllArgsConstructor()
    class User {
      declare name: string;
      declare age: number;
    }
    const stored = legacyBackend.metadata.get<AllArgsConstructorMetadata>(
      MetadataKeys.ALL_ARGS_CONSTRUCTOR,
      User,
    );
    expect(stored).toEqual({ staticName: DEFAULT_ALL_ARGS_STATIC_NAME, access: 'public' });
  });

  it('honours the staticName option', () => {
    @AllArgsConstructor({ staticName: 'of' })
    class Order {
      declare item: string;
    }
    const stored = legacyBackend.metadata.get<AllArgsConstructorMetadata>(
      MetadataKeys.ALL_ARGS_CONSTRUCTOR,
      Order,
    );
    expect(stored?.staticName).toBe('of');
  });

  it('honours the access option (recorded for tooling only, no runtime enforcement)', () => {
    @AllArgsConstructor({ access: 'protected' })
    class Opaque {
      declare slug: string;
    }
    const stored = legacyBackend.metadata.get<AllArgsConstructorMetadata>(
      MetadataKeys.ALL_ARGS_CONSTRUCTOR,
      Opaque,
    );
    expect(stored?.access).toBe('protected');
  });

  it('rejects an empty staticName', () => {
    expect(() => {
      @AllArgsConstructor({ staticName: '' })
      class Bad {
        declare x: number;
      }
      void Bad;
    }).toThrow(/non-empty string/);
  });

  it('rejects a non-string staticName at decoration time', () => {
    expect(() => {
      @AllArgsConstructor({ staticName: 42 as unknown as string })
      class Bad {
        declare x: number;
      }
      void Bad;
    }).toThrow(/non-empty string/);
  });

  it('does not install any method on the prototype (codegen owns that)', () => {
    @AllArgsConstructor()
    class Marker {
      declare x: number;
    }
    const proto = Marker.prototype as unknown as Record<string, unknown>;
    expect('allArgs' in proto).toBe(false);
    expect(typeof (Marker as unknown as Record<string, unknown>).allArgs).toBe('undefined');
  });

  it('subclasses record their own independent metadata', () => {
    @AllArgsConstructor()
    class Base {
      declare x: number;
    }
    @AllArgsConstructor({ staticName: 'of' })
    class Derived extends Base {
      declare y: number;
    }
    const baseStored = legacyBackend.metadata.get<AllArgsConstructorMetadata>(
      MetadataKeys.ALL_ARGS_CONSTRUCTOR,
      Base,
    );
    const derivedStored = legacyBackend.metadata.get<AllArgsConstructorMetadata>(
      MetadataKeys.ALL_ARGS_CONSTRUCTOR,
      Derived,
    );
    expect(baseStored?.staticName).toBe(DEFAULT_ALL_ARGS_STATIC_NAME);
    expect(derivedStored?.staticName).toBe('of');
  });
});

describe('@AllArgsConstructor (stage3)', () => {
  it('writes metadata on the stage3 context bag', () => {
    class Target {}
    const ctx = makeClassContext('Target');
    AllArgsConstructorS3()(Target, ctx);
    const stored = stage3Backend.metadata.get<AllArgsConstructorMetadata>(
      MetadataKeys.ALL_ARGS_CONSTRUCTOR,
      ctx.metadata,
    );
    expect(stored).toEqual({ staticName: DEFAULT_ALL_ARGS_STATIC_NAME, access: 'public' });
  });

  it('honours staticName under stage3', () => {
    class Target {}
    const ctx = makeClassContext('Target');
    AllArgsConstructorS3({ staticName: 'build' })(Target, ctx);
    const stored = stage3Backend.metadata.get<AllArgsConstructorMetadata>(
      MetadataKeys.ALL_ARGS_CONSTRUCTOR,
      ctx.metadata,
    );
    expect(stored?.staticName).toBe('build');
  });

  it('rejects empty staticName under stage3', () => {
    class Target {}
    const ctx = makeClassContext('Target');
    expect(() => AllArgsConstructorS3({ staticName: '   ' })(Target, ctx)).toThrow(
      /non-empty string/,
    );
  });

  it('does not install anything on the prototype under stage3', () => {
    class Target {}
    AllArgsConstructorS3()(Target, makeClassContext('Target'));
    const proto = Target.prototype as unknown as Record<string, unknown>;
    expect('allArgs' in proto).toBe(false);
  });
});
