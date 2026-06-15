import { describe, expect, it } from 'vitest';
import { assertNonNull, nonNullFieldLegacy } from './non-null.js';
import { legacyBackend } from '../../legacy/backend.js';

describe('non-null', () => {
  it('assertNonNull throws on null and undefined', () => {
    expect(() => assertNonNull(null, 'x')).toThrow(TypeError);
    expect(() => assertNonNull(undefined, 'x')).toThrow(TypeError);
  });

  it('assertNonNull passes for defined values', () => {
    expect(() => assertNonNull('ok', 'x')).not.toThrow();
    expect(() => assertNonNull(0, 'x')).not.toThrow();
  });

  it('nonNullFieldLegacy rejects null via prototype setter', () => {
    class Box {}
    nonNullFieldLegacy(legacyBackend, Box.prototype, 'name');
    const box = new Box();
    const desc = Object.getOwnPropertyDescriptor(Box.prototype, 'name');
    expect(desc?.set).toBeDefined();
    desc!.set!.call(box, 'a');
    expect(desc!.get!.call(box)).toBe('a');
    expect(() => desc!.set!.call(box, null)).toThrow(TypeError);
  });
});
