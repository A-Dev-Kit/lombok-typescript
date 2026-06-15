import { describe, expect, it } from 'vitest';
import { prototypeClassLegacy } from './prototype.js';
import { legacyBackend } from '../../legacy/backend.js';

describe('prototype', () => {
  it('clones on each new', () => {
    class Config {
      values = { a: 1 };
    }
    const Wrapped = prototypeClassLegacy(legacyBackend, Config);
    const a = new Wrapped();
    const b = new Wrapped();
    expect(a).not.toBe(b);
    expect(a.values).toEqual(b.values);
    a.values.a = 99;
    expect(b.values.a).toBe(1);
  });
});
