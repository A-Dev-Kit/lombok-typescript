import { describe, expect, it } from 'vitest';
import { singletonClassLegacy } from './singleton.js';
import { legacyBackend } from '../../legacy/backend.js';

describe('singleton', () => {
  it('returns the same instance', () => {
    class Service {
      id = Math.random();
    }
    const Wrapped = singletonClassLegacy(legacyBackend, Service);
    const a = new Wrapped();
    const b = new Wrapped();
    expect(a).toBe(b);
    expect(a.id).toBe(b.id);
  });
});
