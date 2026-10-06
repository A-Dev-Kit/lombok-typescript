import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { NoArgsConstructor } from '../../legacy/index.js';
import { NoArgsConstructor as NoArgsConstructorS3 } from '../../stage3/index.js';
import { legacyBackend } from '../../legacy/backend.js';
import { stage3Backend } from '../../stage3/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import {
  DEFAULT_NO_ARGS_STATIC_NAME,
  type NoArgsConstructorMetadata,
} from './no-args-constructor.js';

function makeClassContext(name: string): ClassDecoratorContext & { metadata: object } {
  const metadata: Record<PropertyKey, unknown> = {};
  return {
    kind: 'class',
    name,
    metadata,
    addInitializer: () => {},
  } as unknown as ClassDecoratorContext & { metadata: object };
}

describe('@NoArgsConstructor (legacy)', () => {
  it('records default metadata with no options', () => {
    @NoArgsConstructor()
    class Marker {
      declare ready: boolean;
    }
    const stored = legacyBackend.metadata.get<NoArgsConstructorMetadata>(
      MetadataKeys.NO_ARGS_CONSTRUCTOR,
      Marker,
    );
    expect(stored).toEqual({
      staticName: DEFAULT_NO_ARGS_STATIC_NAME,
      access: 'public',
      force: false,
    });
  });

  it('honours the staticName option', () => {
    @NoArgsConstructor({ staticName: 'create' })
    class Token {
      declare id: string;
    }
    const stored = legacyBackend.metadata.get<NoArgsConstructorMetadata>(
      MetadataKeys.NO_ARGS_CONSTRUCTOR,
      Token,
    );
    expect(stored?.staticName).toBe('create');
  });

  it('honours the access option (recorded for tooling only, no runtime enforcement)', () => {
    @NoArgsConstructor({ access: 'private' })
    class Opaque {
      declare slug: string;
    }
    const stored = legacyBackend.metadata.get<NoArgsConstructorMetadata>(
      MetadataKeys.NO_ARGS_CONSTRUCTOR,
      Opaque,
    );
    expect(stored?.access).toBe('private');
  });

  it('records force: true for tooling and codegen', () => {
    @NoArgsConstructor({ force: true })
    class Draft {
      declare title: string;
    }
    const stored = legacyBackend.metadata.get<NoArgsConstructorMetadata>(
      MetadataKeys.NO_ARGS_CONSTRUCTOR,
      Draft,
    );
    expect(stored?.force).toBe(true);
  });

  it('rejects an empty staticName', () => {
    expect(() => {
      @NoArgsConstructor({ staticName: '' })
      class Bad {
        declare x: number;
      }
      void Bad;
    }).toThrow(/non-empty string/);
  });

  it('rejects a non-string staticName at decoration time', () => {
    expect(() => {
      @NoArgsConstructor({ staticName: 42 as unknown as string })
      class Bad {
        declare x: number;
      }
      void Bad;
    }).toThrow(/non-empty string/);
  });

  it('rejects a non-boolean force at decoration time', () => {
    expect(() => {
      @NoArgsConstructor({ force: 'yes' as unknown as boolean })
      class Bad {
        declare x: number;
      }
      void Bad;
    }).toThrow(/boolean/);
  });

  it('does not install any method on the prototype (codegen owns that)', () => {
    @NoArgsConstructor()
    class Marker {
      declare x: number;
    }
    const proto = Marker.prototype as unknown as Record<string, unknown>;
    expect('noArgs' in proto).toBe(false);
    expect(typeof (Marker as unknown as Record<string, unknown>).noArgs).toBe('undefined');
  });

  it('subclasses record their own independent metadata', () => {
    @NoArgsConstructor()
    class Base {
      declare x: number;
    }
    @NoArgsConstructor({ staticName: 'create', force: true })
    class Derived extends Base {
      declare y: number;
    }
    const baseStored = legacyBackend.metadata.get<NoArgsConstructorMetadata>(
      MetadataKeys.NO_ARGS_CONSTRUCTOR,
      Base,
    );
    const derivedStored = legacyBackend.metadata.get<NoArgsConstructorMetadata>(
      MetadataKeys.NO_ARGS_CONSTRUCTOR,
      Derived,
    );
    expect(baseStored?.staticName).toBe(DEFAULT_NO_ARGS_STATIC_NAME);
    expect(baseStored?.force).toBe(false);
    expect(derivedStored?.staticName).toBe('create');
    expect(derivedStored?.force).toBe(true);
  });
});

describe('@NoArgsConstructor (stage3)', () => {
  it('writes metadata on the stage3 context bag', () => {
    class Target {}
    const ctx = makeClassContext('Target');
    NoArgsConstructorS3()(Target, ctx);
    const stored = stage3Backend.metadata.get<NoArgsConstructorMetadata>(
      MetadataKeys.NO_ARGS_CONSTRUCTOR,
      ctx.metadata,
    );
    expect(stored).toEqual({
      staticName: DEFAULT_NO_ARGS_STATIC_NAME,
      access: 'public',
      force: false,
    });
  });

  it('honours staticName and force under stage3', () => {
    class Target {}
    const ctx = makeClassContext('Target');
    NoArgsConstructorS3({ staticName: 'build', force: true })(Target, ctx);
    const stored = stage3Backend.metadata.get<NoArgsConstructorMetadata>(
      MetadataKeys.NO_ARGS_CONSTRUCTOR,
      ctx.metadata,
    );
    expect(stored?.staticName).toBe('build');
    expect(stored?.force).toBe(true);
  });

  it('rejects empty staticName under stage3', () => {
    class Target {}
    const ctx = makeClassContext('Target');
    expect(() => NoArgsConstructorS3({ staticName: '   ' })(Target, ctx)).toThrow(
      /non-empty string/,
    );
  });

  it('does not install anything on the prototype under stage3', () => {
    class Target {}
    NoArgsConstructorS3()(Target, makeClassContext('Target'));
    const proto = Target.prototype as unknown as Record<string, unknown>;
    expect('noArgs' in proto).toBe(false);
  });
});
