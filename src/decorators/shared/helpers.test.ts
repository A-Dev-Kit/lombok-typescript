import { describe, expect, it } from 'vitest';
import { nonNullParameterLegacy, wrapMethodWithNonNullParams } from './non-null.js';
import { legacyBackend } from '../../legacy/backend.js';
import { codegenClassMarkerLegacy, getFactoryRegistry } from './factory.js';
import { memoizeMethodLegacy } from './memoize-logic.js';

describe('shared decorator helpers', () => {
  it('nonNullParameterLegacy stores parameter index', () => {
    class Svc {
      run() {}
    }
    nonNullParameterLegacy(legacyBackend, Svc.prototype, 'run', 0);
    expect(
      legacyBackend.metadata.get<number>('lombok-ts:nonNull:param', Svc.prototype, 'run'),
    ).toBe(0);
  });

  it('wrapMethodWithNonNullParams validates args', () => {
    const fn = (a: string, b: number) => `${a}-${b}`;
    const wrapped = wrapMethodWithNonNullParams(fn as (...args: unknown[]) => unknown, [0], 'fn');
    expect(wrapped('x', 1)).toBe('x-1');
    expect(() => wrapped(null, 1)).toThrow(TypeError);
  });

  it('codegenClassMarkerLegacy sets metadata', () => {
    class X {}
    codegenClassMarkerLegacy(legacyBackend, X, 'lombok-ts:data');
    expect(legacyBackend.metadata.get('lombok-ts:data', X, undefined)).toBe(true);
  });

  it('memoizeMethodLegacy wraps descriptor', () => {
    class Svc {
      compute(n: number) {
        return n * 2;
      }
    }
    const desc = Object.getOwnPropertyDescriptor(Svc.prototype, 'compute')!;
    memoizeMethodLegacy(legacyBackend, Svc.prototype, 'compute', desc, {});
    const svc = new Svc();
    expect(svc.compute(2)).toBe(4);
    expect(svc.compute(2)).toBe(4);
  });

  it('getFactoryRegistry returns a map', () => {
    expect(getFactoryRegistry()).toBeInstanceOf(Map);
  });
});
