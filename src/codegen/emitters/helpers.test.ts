import { describe, expect, it } from 'vitest';
import { analyzeSourceString } from '../analyzer.js';
import {
  effectiveReadonly,
  formatFieldTypeForEmit,
  fieldExcludesEquals,
  fieldExcludesToString,
  getAbstractFactoryProducts,
  getDelegateMethods,
  getFieldDefaultsOptions,
  getHookMethodNames,
  hasFluentAccessors,
  parseDecoratorArrayArg,
  parseDecoratorObjectArg,
  wantsWithMethods,
} from './helpers.js';
import {
  emitAbstractFactoryApplyAssignment,
  emitAbstractFactoryMixin,
} from './abstract-factory-emit.js';
import { emitWithFns } from './with-emit.js';
import { emitEqualsStaticFn } from './equals-emit.js';

describe('emitter helpers (phase 2)', () => {
  it('formatFieldTypeForEmit strips redundant undefined from optional types', () => {
    expect(formatFieldTypeForEmit('number | undefined', true)).toBe('number');
    expect(formatFieldTypeForEmit('number', true)).toBe('number');
    expect(formatFieldTypeForEmit('string | undefined', false)).toBe('string | undefined');
  });

  it('fieldExcludesToString and fieldExcludesEquals accept dotted decorator aliases', () => {
    const field = {
      name: 'x',
      type: 'string',
      isOptional: false,
      isReadonly: false,
      hasDefault: false,
      decorators: [
        { name: 'ToString.Exclude', arguments: [] },
        { name: 'Equals.Exclude', arguments: [] },
      ],
    };
    expect(fieldExcludesToString(field)).toBe(true);
    expect(fieldExcludesEquals(field)).toBe(true);
  });

  it('getFieldDefaultsOptions returns defaults for non-object FieldDefaults args', () => {
    const [info] = analyzeSourceString(`
      @FieldDefaults('invalid')
      class Row { id: string; }
    `);
    expect(getFieldDefaultsOptions(info!)).toEqual({ level: 'public', makeFinal: false });
  });

  it('hasFluentAccessors detects fluent string config', () => {
    const [info] = analyzeSourceString(`
      @Accessors({ fluent: true })
      class User { name: string; }
    `);
    expect(hasFluentAccessors(info!)).toBe(true);
  });

  it('parses FieldDefaults decorator arguments', () => {
    const [info] = analyzeSourceString(`
      @FieldDefaults({ makeFinal: true })
      class Row { id: string; }
    `);
    expect(getFieldDefaultsOptions(info!)).toEqual({ level: 'public', makeFinal: true });
    expect(effectiveReadonly(info!, info!.fields[0]!)).toBe(true);
  });

  it('detects fluent accessors', () => {
    const [info] = analyzeSourceString(`
      @Accessors({ chain: true })
      class User { @Setter name: string; }
    `);
    expect(hasFluentAccessors(info!)).toBe(true);
  });

  it('hasFluentAccessors returns false without chain/fluent args', () => {
    const [info] = analyzeSourceString(`
      @Accessors()
      class Plain { name: string; }
    `);
    expect(hasFluentAccessors(info!)).toBe(false);
  });

  it('parses delegate method names from field decorator', () => {
    const [info] = analyzeSourceString(`
      class Car {
        @Delegate('run', 'stop')
        engine: unknown;
      }
    `);
    expect(getDelegateMethods(info!.fields[0]!)).toEqual(['run', 'stop']);
  });

  it('emitWithFns generates copy helpers', () => {
    const [info] = analyzeSourceString(`
      @With
      class Point { x: number; }
    `);
    expect(emitWithFns(info!)).toContain('withX');
    expect(wantsWithMethods(info!, info!.fields[0]!)).toBe(true);
  });

  it('parseDecoratorObjectArg handles malformed input', () => {
    expect(parseDecoratorObjectArg({ name: 'X', arguments: ['not-json'] })).toEqual({});
    expect(parseDecoratorObjectArg({ name: 'X', arguments: ['{ broken: }'] })).toEqual({});
  });

  it('emitEqualsStaticFn only for @Equals class', () => {
    const [eq] = analyzeSourceString(`@Equals class A { x: number; }`);
    const [data] = analyzeSourceString(`@Data class B { x: number; }`);
    expect(emitEqualsStaticFn(eq!)).toContain('equalsStatic');
    expect(emitEqualsStaticFn(data!)).toBe('');
  });

  it('getDelegateMethods parses bracket array argument', () => {
    const [info] = analyzeSourceString(`
      class X {
        @Delegate(['a', 'b'])
        inner: unknown;
      }
    `);
    expect(getDelegateMethods(info!.fields[0]!)).toEqual(['a', 'b']);
  });

  it('getDelegateMethods returns empty array for invalid JSON array literal', () => {
    const [info] = analyzeSourceString(`
      class X {
        @Delegate([broken])
        inner: unknown;
      }
    `);
    expect(getDelegateMethods(info!.fields[0]!)).toEqual([]);
  });

  it('parseDecoratorObjectArg parses object literal arguments', () => {
    expect(parseDecoratorObjectArg({ name: 'X', arguments: ['{ chain: true }'] })).toEqual({
      chain: true,
    });
  });

  it('getFieldDefaultsOptions handles invalid decorator object', () => {
    const [info] = analyzeSourceString(`
      @FieldDefaults({ broken })
      class X { n: number; }
    `);
    expect(getFieldDefaultsOptions(info!)).toEqual({ level: 'public', makeFinal: false });
  });

  it('parseDecoratorArrayArg returns empty array for malformed JSON', () => {
    expect(parseDecoratorArrayArg({ name: 'AbstractFactory', arguments: ['[broken]'] })).toEqual(
      [],
    );
  });

  it('getAbstractFactoryProducts reads products from object literal', () => {
    const [info] = analyzeSourceString(`
      @AbstractFactory({ products: ['Theme', 'Widget'] })
      abstract class Factory {}
    `);
    expect(getAbstractFactoryProducts(info!)).toEqual(['Theme', 'Widget']);
  });

  it('getHookMethodNames honors explicit hook names', () => {
    const [info] = analyzeSourceString(`
      @TemplateMethod({ steps: ['load', 'save'] })
      class Job {
        @Hook({ name: 'loadData' })
        load() {}
        @Hook()
        save() {}
      }
    `);
    expect(getHookMethodNames(info!)).toEqual(['loadData', 'save']);
  });

  it('abstract factory emit throws when product list is empty', () => {
    const [info] = analyzeSourceString(`
      @AbstractFactory([])
      abstract class Bad {}
    `);
    expect(() => emitAbstractFactoryMixin(info!)).toThrow(/product list is empty/);
    expect(emitAbstractFactoryApplyAssignment(info!)).toBeUndefined();
  });
});
