import { describe, expect, it, vi } from 'vitest';
import { fieldMarkerLegacy, fieldMarkerStage3 } from './markers.js';
import { legacyBackend } from '../../legacy/backend.js';
import { stage3Backend } from '../../stage3/backend.js';
import { getterFieldLegacy, getterFieldStage3 } from './getter.js';
import { setterFieldLegacy, setterFieldStage3 } from './setter.js';
import { valueClassLegacy, valueClassStage3 } from './value.js';
import { withClassLegacy, withFieldLegacy, withClassStage3, withFieldStage3 } from './with.js';
import { equalsClassLegacy, equalsClassStage3, equalsExcludeFieldLegacy, equalsExcludeFieldStage3 } from './equals.js';
import { accessorsClassLegacy, normalizeAccessorsOptions } from './accessors.js';
import { fieldDefaultsClassLegacy, normalizeFieldDefaultsOptions } from './field-defaults.js';
import { delegateFieldLegacy, parseDelegateMethods } from './delegate.js';
import { logClassLegacy, logMethodLegacy, logMethodStage3, logClassStage3 } from './log.js';
import { utilityClassLegacy, utilityClassStage3 } from './utility-class.js';

describe('shared markers and phase2 logic', () => {
  it('fieldMarkerLegacy and fieldMarkerStage3 store metadata', () => {
    const proto = {};
    fieldMarkerLegacy(legacyBackend, proto, 'x', 'test:key', 42);
    expect(legacyBackend.metadata.get('test:key', proto, 'x')).toBe(42);

    const ctx = {
      kind: 'field',
      name: 'y',
      metadata: {},
    } as ClassFieldDecoratorContext;
    fieldMarkerStage3(stage3Backend, ctx, 'test:key2', true);
    expect(stage3Backend.metadata.get('test:key2', ctx.metadata as object, 'y')).toBe(true);
  });

  it('value with equals getter setter markers', () => {
    class A {}
    class B {
      x!: number;
    }
    valueClassLegacy(legacyBackend, A);
    withClassLegacy(legacyBackend, A);
    withFieldLegacy(legacyBackend, B.prototype, 'x');
    getterFieldLegacy(legacyBackend, B.prototype, 'x');
    setterFieldLegacy(legacyBackend, B.prototype, 'x');
    equalsClassLegacy(legacyBackend, A);
    equalsExcludeFieldLegacy(legacyBackend, B.prototype, 'x');
    expect(legacyBackend.metadata.get('lombok-ts:value', A)).toBe(true);
  });

  it('parseDelegateMethods handles array and spread forms', () => {
    expect(parseDelegateMethods([])).toEqual([]);
    expect(parseDelegateMethods(['a', 'b'])).toEqual(['a', 'b']);
    expect(parseDelegateMethods([['a', 'b']])).toEqual(['a', 'b']);
  });

  it('accessors and fieldDefaults normalize options', () => {
    class C {}
    accessorsClassLegacy(legacyBackend, C, { fluent: true });
    fieldDefaultsClassLegacy(legacyBackend, C, { makeFinal: true });
    expect(normalizeAccessorsOptions({ fluent: true }).chain).toBe(true);
    expect(normalizeFieldDefaultsOptions({}).makeFinal).toBe(false);
  });

  it('log and utilityClass runtime behavior', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    class Svc {
      run() {
        return 1;
      }
    }
    logClassLegacy(legacyBackend, Svc);
    expect(new Svc().run()).toBe(1);

    const desc = Object.getOwnPropertyDescriptor(Svc.prototype, 'run')!;
    logMethodLegacy(legacyBackend, Svc.prototype, 'run', desc);
    expect(typeof Svc.prototype.run).toBe('function');

    const badDesc = { value: 'not-a-fn', writable: true, enumerable: true, configurable: true };
    expect(logMethodLegacy(legacyBackend, Svc.prototype, 'noop', badDesc)).toBeUndefined();

    const Wrapped = utilityClassLegacy(legacyBackend, class Util {}) as new () => unknown;
    expect(() => new Wrapped()).toThrow();
    spy.mockRestore();
  });

  it('stage3 value and with markers', () => {
    class P {}
    const ctx = { kind: 'class', name: 'P', metadata: {} } as ClassDecoratorContext;
    valueClassStage3(stage3Backend, P, ctx);
    withClassStage3(stage3Backend, P, ctx);
    const fctx = { kind: 'field', name: 'x', metadata: {} } as ClassFieldDecoratorContext;
    withFieldStage3(stage3Backend, fctx);
    getterFieldStage3(stage3Backend, fctx);
    setterFieldStage3(stage3Backend, fctx);
    delegateFieldLegacy(legacyBackend, {}, 'f', ['m']);
    expect(stage3Backend.metadata.get('lombok-ts:value', ctx.metadata as object)).toBe(true);
  });

  it('log supports alternate levels', () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    class A {
      a() {
        return 1;
      }
    }
    class B {
      b() {
        return 2;
      }
    }
    class C {
      c() {
        return 3;
      }
    }

    logClassLegacy(legacyBackend, A, { level: 'debug' });
    logClassLegacy(legacyBackend, B, { level: 'warn' });
    logClassLegacy(legacyBackend, C, { level: 'error' });
    new A().a();
    new B().b();
    new C().c();
    expect(infoSpy).toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
    infoSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('utilityClass allows subclass construction path', () => {
    class Base {}
    const Wrapped = utilityClassLegacy(legacyBackend, Base) as typeof Base;
    class Child extends Wrapped {}
    expect(() => new Child()).not.toThrow();
  });

  it('equals stage3 markers', () => {
    class E {}
    const ctx = { kind: 'class', name: 'E', metadata: {} } as ClassDecoratorContext;
    equalsClassStage3(stage3Backend, E, ctx);
    const fctx = { kind: 'field', name: 'x', metadata: {} } as ClassFieldDecoratorContext;
    equalsExcludeFieldStage3(stage3Backend, fctx);
    expect(stage3Backend.metadata.get('lombok-ts:equals', ctx.metadata as object)).toBe(true);
  });

  it('stage3 log method levels and utility subclass path', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fn = function demo(this: unknown) {
      return this;
    };
    const wrapped = logMethodStage3(
      stage3Backend,
      fn,
      { kind: 'method', name: 'demo', metadata: {} } as ClassMethodDecoratorContext,
      { level: 'warn' },
    );
    wrapped.call({});
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();

    class Base {}
    const Wrapped = utilityClassStage3(
      stage3Backend,
      Base,
      { kind: 'class', name: 'Base', metadata: {} } as ClassDecoratorContext,
    ) as typeof Base;
    class Child extends Wrapped {}
    expect(() => new Child()).not.toThrow();

    logClassStage3(
      stage3Backend,
      class L {
        x() {
          return 1;
        }
      },
      { kind: 'class', name: 'L', metadata: {} } as ClassDecoratorContext,
      { level: 'error' },
    );

    const debugSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    logMethodStage3(
      stage3Backend,
      () => 1,
      { kind: 'method', name: 'd', metadata: {} } as ClassMethodDecoratorContext,
      { level: 'debug' },
    )();
    expect(debugSpy).toHaveBeenCalled();
    debugSpy.mockRestore();
  });
});