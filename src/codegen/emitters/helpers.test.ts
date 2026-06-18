import { describe, expect, it } from 'vitest';
import { analyzeSourceString } from '../analyzer.js';
import {
  effectiveReadonly,
  getDelegateMethods,
  getFieldDefaultsOptions,
  hasFluentAccessors,
  parseDecoratorObjectArg,
  wantsWithMethods,
} from './helpers.js';
import { emitWithFns } from './with-emit.js';
import { emitEqualsStaticFn } from './equals-emit.js';

describe('emitter helpers (phase 2)', () => {
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

  it('getFieldDefaultsOptions handles invalid decorator object', () => {
    const [info] = analyzeSourceString(`
      @FieldDefaults({ broken })
      class X { n: number; }
    `);
    expect(getFieldDefaultsOptions(info!)).toEqual({ level: 'public', makeFinal: false });
  });
});
