import { describe, expect, it } from 'vitest';
import { analyzeSourceString } from '../analyzer.js';
import { emitBuilderClass, emitBuilderStaticMethod } from './builder.js';
import { emitDataAccessors, emitDataConstructor, emitDataEquals, emitDataMethods } from './data.js';
import { emitCompanionFile } from './index.js';
import { emitToStringMethod, emitToStringMixin } from './toString.js';

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
});
