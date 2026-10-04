import { describe, expect, it } from 'vitest';
import { analyzeSourceString } from '../analyzer.js';
import { emitBuilderClass, emitBuilderStaticMethod } from './builder.js';
import { emitDataAccessors, emitDataConstructor, emitDataEquals, emitDataMethods } from './data.js';
import { emitCompanionFile } from './index.js';
import { emitSerializableApplyAssignment, emitSerializableMethods } from './serializable-emit.js';
import { emitToStringMethod, emitToStringMixin } from './toString.js';
import {
  DEFAULT_ALL_ARGS_STATIC_NAME,
  emitAllArgsConstructorApplyAssignment,
  emitAllArgsConstructorFn,
  emitAllArgsConstructorNamespaceLines,
  getAllArgsStaticName,
  hasAllArgsConstructor,
} from './all-args-constructor-emit.js';
import {
  DEFAULT_NO_ARGS_STATIC_NAME,
  emitNoArgsConstructorApplyAssignment,
  emitNoArgsConstructorFn,
  emitNoArgsConstructorNamespaceLines,
  getNoArgsForce,
  getNoArgsStaticName,
  hasNoArgsConstructor,
} from './no-args-constructor-emit.js';

describe('codegen emitters', () => {
  it('emits builder and data mixins for decorated classes', () => {
    const classes = analyzeSourceString(`
      import { Data, Builder, ToString } from 'lombok-typescript/legacy';

      @Data
      @Builder
      @ToString
      class User {
        name: string;
        age: number;
      }
    `);

    expect(classes).toHaveLength(1);
    const { ts, dts } = emitCompanionFile(
      '/proj/src/user.ts',
      '/proj/.lombok/src/user.lombok.ts',
      classes,
      '/proj',
    );
    expect(ts).toContain("import { User } from '../../src/user.js'");
    expect(ts).toContain('UserBuilder');
    expect(ts).toContain('applyUserGenerated');
    expect(ts).toContain('User_toString');
    expect(dts).toContain("declare module '../../src/user.js'");
    expect(dts).toContain('UserBuilder');
  });

  it('emits data accessors and equals', () => {
    const classes = analyzeSourceString(`
      import { Data } from 'lombok-typescript/legacy';
      @Data
      class Account { id: string; balance: number; }
    `);
    const info = classes[0]!;
    expect(emitDataAccessors(info)).toContain('getId');
    expect(emitDataEquals(info)).toContain('equals');
    expect(emitDataMethods(info)).toContain('toString');
  });

  it('emits builder class and static builder method', () => {
    const classes = analyzeSourceString(`
      import { Builder } from 'lombok-typescript/legacy';
      @Builder
      class Order { item: string; qty: number; }
    `);
    const info = classes[0]!;
    expect(emitBuilderClass(info)).toContain('OrderBuilder');
    expect(emitBuilderStaticMethod(info)).toContain('static builder');
  });

  it('emitBuilderClass marks optional builder fields', () => {
    const classes = analyzeSourceString(`
      @Builder
      class Order { item?: string; }
    `);
    expect(emitBuilderClass(classes[0]!)).toContain('private _item?: string');
  });

  it('emitDataConstructor generates an all-args constructor', () => {
    const classes = analyzeSourceString(`
      @Data
      class User { name: string; age?: number; }
    `);
    expect(emitDataConstructor(classes[0]!)).toContain('constructor(name: string, age?: number)');
  });

  it('emitBuilderClass validates fields at build time', () => {
    const classes = analyzeSourceString(`
      import { Data, Builder, Validate } from 'lombok-typescript/legacy';
      import { z } from 'zod';
      @Data
      @Builder
      class Signup {
        @Validate(z.string().email())
        email: string;
      }
    `);
    const builder = emitBuilderClass(classes[0]!);
    expect(builder).toContain('runValidation(z.string().email(), instance.email');
  });

  it('emitBuilderClass validates class schema at build time', () => {
    const classes = analyzeSourceString(`
      import { Builder, Validate } from 'lombok-typescript/legacy';
      import { z } from 'zod';
      @Builder
      @Validate(z.object({ email: z.string().email() }))
      class Signup {
        email: string;
      }
    `);
    const builder = emitBuilderClass(classes[0]!);
    expect(builder).toContain('runValidation(z.object({ email: z.string().email() }), instance');
  });

  it('emitBuilderClass omits validation when schema argument is missing', () => {
    const classes = analyzeSourceString(`
      @Builder
      class Plain { name: string; }
    `);
    expect(emitBuilderClass(classes[0]!)).not.toContain('runValidation');
  });

  it('emitCompanionFile imports validation helpers for Builder+Validate', () => {
    const classes = analyzeSourceString(`
      import { Builder, Validate } from 'lombok-typescript/legacy';
      import { z } from 'zod';
      @Builder
      @Validate(z.object({ email: z.string().email() }))
      class Signup {
        email: string;
      }
    `);
    const { ts } = emitCompanionFile(
      '/proj/src/signup.ts',
      '/proj/.lombok/src/signup.lombok.ts',
      classes,
      '/proj',
    );
    expect(ts).toContain("import { runValidation } from 'lombok-typescript/validators/zod'");
    expect(ts).toContain("import { z } from 'zod'");
  });

  it('serializable emit helpers return empty without decorator', () => {
    const classes = analyzeSourceString(`class Plain { x: number; }`);
    const info = classes[0]!;
    expect(emitSerializableMethods(info)).toBe('');
    expect(emitSerializableApplyAssignment(info)).toBe('');
  });

  it('emitToStringMethod returns empty for undecorated classes', () => {
    const classes = analyzeSourceString(`class Plain { x: number; }`);
    expect(emitToStringMethod(classes[0]!)).toBe('');
  });

  it('emitToStringMixin generates toString for @Value', () => {
    const classes = analyzeSourceString(`
      @Value
      class Label { text: string; }
    `);
    expect(emitToStringMixin(classes[0]!)).toContain('toString');
  });

  it('emitDataMethods skips readonly setter', () => {
    const classes = analyzeSourceString(`
      import { Data } from 'lombok-typescript/legacy';
      @Data
      class Row { readonly id: string; }
    `);
    const accessors = emitDataAccessors(classes[0]!);
    expect(accessors).toContain('getId');
    expect(accessors).not.toContain('setId');
  });

  it('declaration shim covers ToString-only class', () => {
    const classes = analyzeSourceString(`
      import { ToString } from 'lombok-typescript/legacy';
      @ToString
      class Label { text: string; }
    `);
    const { dts } = emitCompanionFile(
      '/proj/src/label.ts',
      '/proj/.lombok/src/label.lombok.ts',
      classes,
      '/proj',
    );
    expect(dts).toContain('toString(): string');
  });

  it('declaration shim covers Phase 3 runtime decorators', () => {
    const classes = analyzeSourceString(`
      import { State, Memento, Observable, ChainOfResponsibility, Iterable } from 'lombok-typescript/legacy';
      @State({ states: ['a'], initial: 'a' })
      class Task {}
      @Memento
      class Editor {}
      @Observable
      class Counter {}
      @ChainOfResponsibility
      class Auth {}
      @Iterable
      class Playlist {}
    `);
    const { dts } = emitCompanionFile(
      '/proj/src/behavioral.ts',
      '/proj/.lombok/src/behavioral.lombok.ts',
      classes,
      '/proj',
    );
    expect(dts).toContain('interface Task');
    expect(dts).toContain('readonly state: string');
    expect(dts).toContain('interface Editor');
    expect(dts).toContain('save(): unknown');
    expect(dts).toContain('interface Counter');
    expect(dts).toContain('subscribe(');
    expect(dts).toContain('interface Auth');
    expect(dts).toContain('handle(context: unknown): boolean');
    expect(dts).toContain('interface Playlist');
    expect(dts).toContain('[Symbol.iterator]()');
  });

  it('declaration shim covers Phase 4a @Composite', () => {
    const classes = analyzeSourceString(`
      import { Composite } from 'lombok-typescript/legacy';
      @Composite
      class Node {}
    `);
    const { dts } = emitCompanionFile(
      '/proj/src/structural.ts',
      '/proj/.lombok/src/structural.lombok.ts',
      classes,
      '/proj',
    );
    expect(dts).toContain('interface Node');
    expect(dts).toContain('add(child: object): void');
    expect(dts).toContain('traverse(callback');
  });

  it('data helpers return empty string without @Data', () => {
    const classes = analyzeSourceString(`class Plain { x: number; }`);
    expect(emitDataAccessors(classes[0]!)).toBe('');
    expect(emitDataEquals(classes[0]!)).toBe('');
  });

  it('data equals handles empty field list', () => {
    const classes = analyzeSourceString(`
      import { Data } from 'lombok-typescript/legacy';
      @Data
      class Empty {}
    `);
    expect(emitDataEquals(classes[0]!)).toContain('return (');
    expect(emitDataEquals(classes[0]!)).toContain('true');
  });

  it('emits Phase 4 template method and visitor companions', () => {
    const classes = analyzeSourceString(`
      import { TemplateMethod, Hook, Visitable, AbstractFactory } from 'lombok-typescript/legacy';

      @TemplateMethod({ steps: ['fetch', 'write'], template: 'run' })
      class Exporter {
        @Hook()
        fetch() {}
        @Hook()
        write() {}
      }

      @Visitable
      class Circle { radius = 1; }

      @AbstractFactory(['Button', 'Dialog'])
      abstract class UIFactory {}
    `);

    const { ts, dts } = emitCompanionFile(
      '/proj/src/structural.ts',
      '/proj/.lombok/src/structural.lombok.ts',
      classes,
      '/proj',
    );
    expect(ts).toContain('Exporter_run');
    expect(ts).toContain('this.fetch(); this.write();');
    expect(ts).toContain('Circle_accept');
    expect(ts).toContain('visitCircle');
    expect(ts).toContain('UIFactoryMixin');
    expect(ts).toContain('createButton');
    expect(dts).toContain('accept(visitor: unknown): unknown');
    expect(dts).toContain('run(): void');
  });

  it('declaration shim covers Phase 4 runtime decorators', () => {
    const classes = analyzeSourceString(`
      import { Composite, Wraps } from 'lombok-typescript/legacy';
      class Inner {}
      @Composite
      class Node {}
      @Wraps(Inner)
      class Decorated {}
    `);
    const { dts } = emitCompanionFile(
      '/proj/src/wrap.ts',
      '/proj/.lombok/src/wrap.lombok.ts',
      classes,
      '/proj',
    );
    expect(dts).toContain('interface Node');
    expect(dts).toContain('traverse(callback');
    expect(dts).toContain('protected inner: Inner');
  });

  it('emitSerializable generates toJSON and fromJSON', () => {
    const classes = analyzeSourceString(`
      @Serializable
      class User {
        name: string;
        @Serializable.Exclude
        secret: string;
        @Serializable.Alias('user_email')
        email: string;
        @Serializable.Transform({ serialize: (d: Date) => d.toISOString(), deserialize: (s: string) => new Date(s) })
        createdAt: Date;
      }
    `);
    const { ts } = emitCompanionFile(
      '/proj/src/user.ts',
      '/proj/.lombok/src/user.lombok.ts',
      classes,
      '/proj',
    );
    expect(ts).toContain('User_toJSON');
    expect(ts).toContain('User_fromJSON');
    expect(ts).toContain("'user_email': this.email");
    expect(ts).not.toContain('this.secret');
    expect(ts).toContain('applyUserGenerated');
  });

  it('template method emit throws when hook step is missing', () => {
    const classes = analyzeSourceString(`
      @TemplateMethod({ steps: ['missing'] })
      class Bad {}
    `);
    expect(() =>
      emitCompanionFile('/proj/src/bad.ts', '/proj/.lombok/bad.lombok.ts', classes, '/proj'),
    ).toThrow(/missing @Hook method/);
  });

  it('@AllArgsConstructor emits a static-factory function via Object.create', () => {
    const classes = analyzeSourceString(`
      @AllArgsConstructor()
      class User { name: string; age: number; }
    `);
    const info = classes[0]!;
    expect(hasAllArgsConstructor(info)).toBe(true);
    expect(getAllArgsStaticName(info)).toBe(DEFAULT_ALL_ARGS_STATIC_NAME);

    const fn = emitAllArgsConstructorFn(info);
    expect(fn).toContain('function User_allArgs(name: string, age: number): User');
    expect(fn).toContain('Object.create(User.prototype)');
    expect(fn).toContain('instance.name = name');
    expect(fn).toContain('instance.age = age');
    expect(fn).toContain('return instance');
  });

  it('@AllArgsConstructor emit returns empty strings without the decorator', () => {
    const classes = analyzeSourceString(`class Plain { x: number; }`);
    const info = classes[0]!;
    expect(hasAllArgsConstructor(info)).toBe(false);
    expect(emitAllArgsConstructorFn(info)).toBe('');
    expect(emitAllArgsConstructorApplyAssignment(info)).toBe('');
    expect(emitAllArgsConstructorNamespaceLines(info)).toEqual([]);
  });

  it('@AllArgsConstructor honours staticName from the decorator arguments', () => {
    const classes = analyzeSourceString(`
      @AllArgsConstructor({ staticName: 'of' })
      class Order { item: string; qty: number; }
    `);
    const info = classes[0]!;
    expect(getAllArgsStaticName(info)).toBe('of');
    const apply = emitAllArgsConstructorApplyAssignment(info);
    expect(apply).toContain('.of = Order_allArgs');
    expect(apply).toContain('of(item: string, qty: number): Order');
  });

  it('@AllArgsConstructor falls back to the default when option shape is unrecognised', () => {
    const classes = analyzeSourceString(`
      @AllArgsConstructor({ /* intentionally no staticName */ })
      class Blank { x: number; }
    `);
    expect(getAllArgsStaticName(classes[0]!)).toBe(DEFAULT_ALL_ARGS_STATIC_NAME);
  });

  it('@AllArgsConstructor handles optional fields in the signature', () => {
    const classes = analyzeSourceString(`
      @AllArgsConstructor()
      class Patch { id: string; note?: string; }
    `);
    const info = classes[0]!;
    const fn = emitAllArgsConstructorFn(info);
    expect(fn).toContain('note?: string');
    expect(fn).not.toContain('note?: string | undefined');
  });

  it('@AllArgsConstructor on an empty class emits a parameter-less factory with no assignments', () => {
    const classes = analyzeSourceString(`
      @AllArgsConstructor()
      class Marker {}
    `);
    const fn = emitAllArgsConstructorFn(classes[0]!);
    expect(fn).toContain('function Marker_allArgs(): Marker');
    expect(fn).not.toContain('instance.');
    expect(fn).toContain('return instance');
  });

  it('@AllArgsConstructor emits the .d.ts namespace shim', () => {
    const classes = analyzeSourceString(`
      @AllArgsConstructor({ staticName: 'of' })
      class User { name: string; age: number; }
    `);
    const lines = emitAllArgsConstructorNamespaceLines(classes[0]!);
    expect(lines.join('\n')).toContain('namespace User {');
    expect(lines.join('\n')).toContain('export function of(name: string, age: number): User');
  });

  it('@AllArgsConstructor end-to-end: companion file wires function + apply + .d.ts', () => {
    const classes = analyzeSourceString(`
      import { AllArgsConstructor } from 'lombok-typescript/legacy';
      @AllArgsConstructor()
      class Point { x: number; y: number; }
    `);
    const { ts, dts } = emitCompanionFile(
      '/proj/src/point.ts',
      '/proj/.lombok/src/point.lombok.ts',
      classes,
      '/proj',
    );
    expect(ts).toContain("import { Point } from '../../src/point.js'");
    expect(ts).toContain('function Point_allArgs(x: number, y: number): Point');
    expect(ts).toContain('applyPointGenerated');
    expect(ts).toContain('.allArgs = Point_allArgs');
    expect(dts).toContain('namespace Point');
    expect(dts).toContain('export function allArgs(x: number, y: number): Point');
  });

  it('@AllArgsConstructor + @Builder compose cleanly (no conflict)', () => {
    const classes = analyzeSourceString(`
      import { AllArgsConstructor, Builder } from 'lombok-typescript/legacy';
      @AllArgsConstructor({ staticName: 'of' })
      @Builder
      class Order { item: string; qty: number; }
    `);
    const { ts } = emitCompanionFile(
      '/proj/src/order.ts',
      '/proj/.lombok/src/order.lombok.ts',
      classes,
      '/proj',
    );
    expect(ts).toContain('class OrderBuilder');
    expect(ts).toContain('function Order_allArgs(item: string, qty: number): Order');
    expect(ts).toContain('.of = Order_allArgs');
    expect(ts).toContain('.builder = Order_builder');
  });

  it('@AllArgsConstructor skips static fields and declare-static type shims', () => {
    const classes = analyzeSourceString(`
      @AllArgsConstructor({ staticName: 'of' })
      class Coord {
        x: number;
        y: number;
        static origin = 0;
        declare static of: (x: number, y: number) => Coord;
      }
    `);
    const info = classes[0]!;
    const fn = emitAllArgsConstructorFn(info);
    expect(fn).toContain('function Coord_allArgs(x: number, y: number): Coord');
    expect(fn).not.toContain('origin');
    expect(fn).not.toMatch(/instance\.of = of/);
    expect(emitAllArgsConstructorNamespaceLines(info)).toEqual([]);
  });

  it('@NoArgsConstructor emits a parameter-less Object.create factory', () => {
    const classes = analyzeSourceString(`
      @NoArgsConstructor()
      class Marker {}
    `);
    const info = classes[0]!;
    expect(hasNoArgsConstructor(info)).toBe(true);
    expect(getNoArgsStaticName(info)).toBe(DEFAULT_NO_ARGS_STATIC_NAME);
    expect(getNoArgsForce(info)).toBe(false);
    const fn = emitNoArgsConstructorFn(info);
    expect(fn).toContain('function Marker_noArgs(): Marker');
    expect(fn).toContain('Object.create(Marker.prototype)');
    expect(fn).not.toContain('instance.');
    expect(fn).toContain('return instance');
  });

  it('@NoArgsConstructor emit returns empty strings without the decorator', () => {
    const classes = analyzeSourceString(`class Plain { x = 1; }`);
    const info = classes[0]!;
    expect(hasNoArgsConstructor(info)).toBe(false);
    expect(emitNoArgsConstructorFn(info)).toBe('');
    expect(emitNoArgsConstructorApplyAssignment(info)).toBe('');
    expect(emitNoArgsConstructorNamespaceLines(info)).toEqual([]);
  });

  it('@NoArgsConstructor honours staticName from the decorator arguments', () => {
    const classes = analyzeSourceString(`
      @NoArgsConstructor({ staticName: 'create' })
      class Token { id = ''; }
    `);
    const info = classes[0]!;
    expect(getNoArgsStaticName(info)).toBe('create');
    const apply = emitNoArgsConstructorApplyAssignment(info);
    expect(apply).toContain('.create = Token_noArgs');
    expect(apply).toContain('create(): Token');
  });

  it('@NoArgsConstructor falls back to the default when option shape is unrecognised', () => {
    const classes = analyzeSourceString(`
      @NoArgsConstructor({ /* intentionally no staticName */ })
      class Blank {}
    `);
    expect(getNoArgsStaticName(classes[0]!)).toBe(DEFAULT_NO_ARGS_STATIC_NAME);
    expect(getNoArgsForce(classes[0]!)).toBe(false);
  });

  it('@NoArgsConstructor rejects required fields that have no initializer', () => {
    const classes = analyzeSourceString(`
      @NoArgsConstructor()
      class User { name: string; }
    `);
    expect(() => emitNoArgsConstructorFn(classes[0]!)).toThrow(
      /Class "User": @NoArgsConstructor requires \{ force: true \} because field "name" has no initializer/,
    );
  });

  it('@NoArgsConstructor names every required field when several lack initializers', () => {
    const classes = analyzeSourceString(`
      @NoArgsConstructor()
      class User { name: string; age: number; }
    `);
    expect(() => emitNoArgsConstructorFn(classes[0]!)).toThrow(
      /Class "User": @NoArgsConstructor requires \{ force: true \} because fields "name", "age" have no initializer/,
    );
  });

  it('@NoArgsConstructor with force emits a zero-assignment factory', () => {
    const classes = analyzeSourceString(`
      @NoArgsConstructor({ force: true })
      class User { name: string; age: number; }
    `);
    expect(getNoArgsForce(classes[0]!)).toBe(true);
    const fn = emitNoArgsConstructorFn(classes[0]!);
    expect(fn).toContain('function User_noArgs(): User');
    expect(fn).not.toContain('instance.name');
    expect(fn).not.toContain('instance.age');
  });

  it('@NoArgsConstructor allows optional fields and fields with initializers without force', () => {
    const classes = analyzeSourceString(`
      @NoArgsConstructor()
      class Patch { id = ''; note?: string; }
    `);
    expect(emitNoArgsConstructorFn(classes[0]!)).toContain('function Patch_noArgs(): Patch');
  });

  it('@NoArgsConstructor skips a static method that already uses the factory name', () => {
    const classes = analyzeSourceString(`
      @NoArgsConstructor()
      class Marker {
        static noArgs(): Marker {
          return new Marker();
        }
      }
    `);
    expect(emitNoArgsConstructorNamespaceLines(classes[0]!)).toEqual([]);
  });

  it('@NoArgsConstructor skips a declare-static type shim in the .d.ts namespace', () => {
    const classes = analyzeSourceString(`
      @NoArgsConstructor()
      class Marker {
        declare static noArgs: () => Marker;
      }
    `);
    expect(emitNoArgsConstructorNamespaceLines(classes[0]!)).toEqual([]);
    expect(emitNoArgsConstructorFn(classes[0]!)).toContain('function Marker_noArgs(): Marker');
  });

  it('@NoArgsConstructor emits the .d.ts namespace shim', () => {
    const classes = analyzeSourceString(`
      @NoArgsConstructor({ staticName: 'create' })
      class Marker {}
    `);
    const lines = emitNoArgsConstructorNamespaceLines(classes[0]!);
    expect(lines.join('\n')).toContain('namespace Marker {');
    expect(lines.join('\n')).toContain('export function create(): Marker');
  });

  it('@NoArgsConstructor end-to-end: companion file wires function + apply + .d.ts', () => {
    const classes = analyzeSourceString(`
      import { NoArgsConstructor } from 'lombok-typescript/legacy';
      @NoArgsConstructor()
      class Marker {}
    `);
    const { ts, dts } = emitCompanionFile(
      '/proj/src/marker.ts',
      '/proj/.lombok/src/marker.lombok.ts',
      classes,
      '/proj',
    );
    expect(ts).toContain("import { Marker } from '../../src/marker.js'");
    expect(ts).toContain('function Marker_noArgs(): Marker');
    expect(ts).toContain('applyMarkerGenerated');
    expect(ts).toContain('.noArgs = Marker_noArgs');
    expect(dts).toContain('namespace Marker');
    expect(dts).toContain('export function noArgs(): Marker');
  });

  it('@NoArgsConstructor + @AllArgsConstructor compose as two factories', () => {
    const classes = analyzeSourceString(`
      @NoArgsConstructor()
      @AllArgsConstructor()
      class Point { x = 0; y = 0; }
    `);
    const { ts } = emitCompanionFile(
      '/proj/src/point.ts',
      '/proj/.lombok/src/point.lombok.ts',
      classes,
      '/proj',
    );
    expect(ts).toContain('function Point_noArgs(): Point');
    expect(ts).toContain('function Point_allArgs(x: number, y: number): Point');
    expect(ts).toContain('.noArgs = Point_noArgs');
    expect(ts).toContain('.allArgs = Point_allArgs');
  });

  it('@NoArgsConstructor + @Builder compose cleanly', () => {
    const classes = analyzeSourceString(`
      @NoArgsConstructor({ staticName: 'create' })
      @Builder
      class Order { item = ''; }
    `);
    const { ts } = emitCompanionFile(
      '/proj/src/order.ts',
      '/proj/.lombok/src/order.lombok.ts',
      classes,
      '/proj',
    );
    expect(ts).toContain('class OrderBuilder');
    expect(ts).toContain('.create = Order_noArgs');
    expect(ts).toContain('.builder = Order_builder');
  });

  it('@NoArgsConstructor rejects a shared staticName with @AllArgsConstructor', () => {
    const classes = analyzeSourceString(`
      @NoArgsConstructor({ staticName: 'of' })
      @AllArgsConstructor({ staticName: 'of' })
      class Item { sku = ''; }
    `);
    expect(() => emitNoArgsConstructorFn(classes[0]!)).toThrow(
      /Class "Item": @NoArgsConstructor and @AllArgsConstructor cannot share staticName "of"/,
    );
  });

  it('@NoArgsConstructor on a subclass does not replace the parent factory', () => {
    const classes = analyzeSourceString(`
      @NoArgsConstructor()
      class Base {}
      @NoArgsConstructor({ staticName: 'create' })
      class Child extends Base {}
    `);
    const { ts } = emitCompanionFile(
      '/proj/src/tree.ts',
      '/proj/.lombok/src/tree.lombok.ts',
      classes,
      '/proj',
    );
    expect(ts).toContain('function Base_noArgs(): Base');
    expect(ts).toContain('function Child_noArgs(): Child');
    expect(ts).toContain('.noArgs = Base_noArgs');
    expect(ts).toContain('.create = Child_noArgs');
    expect(ts).not.toContain('Base.prototype.noArgs = Child_noArgs');
  });

  it('@NoArgsConstructor + @Data is rejected at codegen time (composition)', () => {
    const classes = analyzeSourceString(`
      import { NoArgsConstructor, Data } from 'lombok-typescript/legacy';
      @NoArgsConstructor()
      @Data
      class Bad { name: string; }
    `);
    expect(() =>
      emitCompanionFile('/proj/src/bad.ts', '/proj/.lombok/src/bad.lombok.ts', classes, '/proj'),
    ).toThrow(/Class "Bad": @NoArgsConstructor and @Data cannot be used together/);
  });

  it('@AllArgsConstructor + @Data is rejected at codegen time (composition)', () => {
    const classes = analyzeSourceString(`
      import { AllArgsConstructor, Data } from 'lombok-typescript/legacy';
      @AllArgsConstructor()
      @Data
      class Bad { name: string; }
    `);
    expect(() =>
      emitCompanionFile('/proj/src/bad.ts', '/proj/.lombok/src/bad.lombok.ts', classes, '/proj'),
    ).toThrow(/@AllArgsConstructor and @Data cannot be used together/);
  });
});
