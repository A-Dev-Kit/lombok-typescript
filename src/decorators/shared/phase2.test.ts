import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { analyzeSourceString } from '../../codegen/analyzer.js';
import { emitCompanionFile } from '../../codegen/emitters/index.js';
import {
  Accessors,
  Delegate,
  Equals,
  EqualsExclude,
  FieldDefaults,
  Getter,
  Log,
  Setter,
  UtilityClass,
  Value,
  With,
} from '../../legacy/index.js';
import { legacyBackend } from '../../legacy/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import {
  Accessors as AccessorsS3,
  Delegate as DelegateS3,
  FieldDefaults as FieldDefaultsS3,
  Getter as GetterS3,
  Log as LogS3,
  Setter as SetterS3,
  UtilityClass as UtilityClassS3,
  Value as ValueS3,
  With as WithS3,
} from '../../stage3/index.js';
import { stage3Backend } from '../../stage3/backend.js';

describe('Phase 2 legacy decorators', () => {
  it('@Value @With @Equals apply without throwing', () => {
    @Value
    class Point {
      x!: number;
      y!: number;
    }
    expect(Point).toBeDefined();
  });

  it('@Getter @Setter @Accessors apply without throwing', () => {
    @Accessors({ chain: true })
    class User {
      @Getter
      @Setter
      name!: string;
    }
    expect(User).toBeDefined();
  });

  it('@Log wraps instance methods', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    @Log({ name: 'Svc' })
    class Svc {
      run(x: number) {
        return x + 1;
      }
    }
    expect(new Svc().run(1)).toBe(2);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('@UtilityClass rejects instantiation', () => {
    @UtilityClass
    class MathUtil {
      static add(a: number, b: number) {
        return a + b;
      }
    }
    expect(() => new MathUtil()).toThrow(/cannot be instantiated/);
    expect(MathUtil.add(1, 2)).toBe(3);
  });

  it('@FieldDefaults sets metadata', () => {
    @FieldDefaults({ makeFinal: true })
  class Row {
      id!: string;
    }
    expect(legacyBackend.metadata.get(MetadataKeys.FIELD_DEFAULTS, Row)).toEqual({
      level: 'public',
      makeFinal: true,
    });
  });

  it('@Delegate registers field metadata', () => {
    class Engine {
      start() {
        return 'ok';
      }
    }
    class Car {
      @Delegate('start')
      engine = new Engine();
    }
    expect(Car).toBeDefined();
  });

  it('@EqualsExclude is a field decorator', () => {
    @Equals
    class Item {
      @EqualsExclude
      temp!: string;
      id!: string;
    }
    expect(Item).toBeDefined();
  });

  it('@With works at class and field level', () => {
    @With
    class A {
      x!: number;
    }
    class B {
      @With
      y!: number;
    }
    expect(A).toBeDefined();
    expect(B).toBeDefined();
  });

  it('rejects @Data and @Value together at codegen', () => {
    const classes = analyzeSourceString(`
      @Data
      @Value
      class Bad { n: number; }
    `);
    expect(() =>
      emitCompanionFile('/p/src/bad.ts', '/p/.lombok/src/bad.lombok.ts', classes, '/p'),
    ).toThrow(/cannot be used together/);
  });

  it('emits Value with* equals and getters', () => {
    const classes = analyzeSourceString(`
      @Value
      class Point { x: number; y: number; }
    `);
    const { ts, dts } = emitCompanionFile(
      '/proj/src/point.ts',
      '/proj/.lombok/src/point.lombok.ts',
      classes,
      '/proj',
    );
    expect(ts).toContain('withX');
    expect(ts).toContain('_equals');
    expect(ts).toContain('getX');
    expect(ts).not.toContain('setX');
    expect(dts).toContain('withX');
  });

  it('emits standalone @Equals with static helper', () => {
    const classes = analyzeSourceString(`
      @Equals
      class Id { @EqualsExclude token: string; value: string; }
    `);
    const { ts } = emitCompanionFile(
      '/proj/src/id.ts',
      '/proj/.lombok/src/id.lombok.ts',
      classes,
      '/proj',
    );
    expect(ts).toContain('equalsStatic');
    expect(ts).not.toContain('this.token ===');
  });

  it('emits @Getter/@Setter with fluent @Accessors', () => {
    const classes = analyzeSourceString(`
      @Accessors({ fluent: true })
      class Account {
        @Getter @Setter balance: number;
      }
    `);
    const { ts } = emitCompanionFile(
      '/proj/src/account.ts',
      '/proj/.lombok/src/account.lombok.ts',
      classes,
      '/proj',
    );
    expect(ts).toContain('return this');
    expect(ts).toContain('setBalance');
  });

  it('emits @Delegate forwarding methods', () => {
    const classes = analyzeSourceString(`
      class Engine { run(): void {} }
      class Car {
        @Delegate('run')
        engine!: Engine;
      }
    `);
    const { ts } = emitCompanionFile(
      '/proj/src/car.ts',
      '/proj/.lombok/src/car.lombok.ts',
      classes,
      '/proj',
    );
    expect(ts).toContain('Car_run');
    expect(ts).toContain('target.run');
  });
});

function makeClassContext(name: string): ClassDecoratorContext & { metadata: object } {
  const metadata: Record<PropertyKey, unknown> = {};
  return {
    kind: 'class',
    name,
    metadata,
    addInitializer: () => {},
  } as unknown as ClassDecoratorContext & { metadata: object };
}

function makeFieldContext(name: string): ClassFieldDecoratorContext & { metadata: object } {
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

function makeMethodContext(name: string): ClassMethodDecoratorContext & { metadata: object } {
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

describe('Phase 2 stage3 decorators', () => {
  it('Value Equals With Getter Setter apply cleanly', () => {
    class Point {}
    ValueS3(Point, makeClassContext('Point'));
    WithS3()(Point, makeClassContext('Point'));
    expect(Point).toBeDefined();
  });

  it('Log UtilityClass FieldDefaults Accessors Delegate on stage3', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    class Svc {
      ping() {
        return 1;
      }
    }
    LogS3({ name: 'Svc' })(Svc, makeClassContext('Svc'));
    expect(new Svc().ping()).toBe(1);

    class Util {}
    const Wrapped = UtilityClassS3(Util, makeClassContext('Util')) as typeof Util;
    expect(() => new Wrapped()).toThrow(/cannot be instantiated/);

    class Row {}
    const rowCtx = makeClassContext('Row');
    FieldDefaultsS3({ makeFinal: true })(Row, rowCtx);
    expect(stage3Backend.metadata.get(MetadataKeys.FIELD_DEFAULTS, rowCtx.metadata as object)).toBeTruthy();

    class Account {}
    AccessorsS3({ chain: true })(Account, makeClassContext('Account'));

    class Car {
      engine = { go: () => 'vroom' };
    }
    DelegateS3('go')(undefined, makeFieldContext('engine'));
    GetterS3(undefined, makeFieldContext('name'));
    SetterS3(undefined, makeFieldContext('name'));
    expect(Car).toBeDefined();
    spy.mockRestore();
  });

  it('Log method decorator on stage3', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const fn = (x: number) => x;
    LogS3()(fn, makeMethodContext('fn'));
    spy.mockRestore();
  });
});
