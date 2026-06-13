import { describe, expect, it } from 'vitest';
import { METADATA_KEY_PREFIX, MetadataKeys } from './metadata-keys.js';

describe('MetadataKeys', () => {
  const entries = Object.entries(MetadataKeys) as ReadonlyArray<readonly [string, string]>;

  it('all keys start with the shared prefix', () => {
    for (const [name, value] of entries) {
      expect(value, `${name} should start with the prefix`).toMatch(
        new RegExp(`^${METADATA_KEY_PREFIX}`),
      );
    }
  });

  it('all key values are unique (no collisions)', () => {
    const values = entries.map(([, v]) => v);
    const seen = new Set<string>();
    for (const v of values) {
      expect(seen.has(v), `duplicate key value: ${v}`).toBe(false);
      seen.add(v);
    }
  });

  it('exposes the expected baseline Lombok keys', () => {
    expect(MetadataKeys.DATA).toBe('lombok-ts:data');
    expect(MetadataKeys.BUILDER).toBe('lombok-ts:builder');
    expect(MetadataKeys.NON_NULL).toBe('lombok-ts:nonNull');
  });

  it('exposes the expected baseline GoF keys', () => {
    expect(MetadataKeys.SINGLETON).toBe('lombok-ts:singleton');
    expect(MetadataKeys.STRATEGY).toBe('lombok-ts:strategy');
    expect(MetadataKeys.OBSERVABLE).toBe('lombok-ts:observable');
  });

  it('METADATA_KEY_PREFIX is "lombok-ts:"', () => {
    expect(METADATA_KEY_PREFIX).toBe('lombok-ts:');
  });

  it('keys object is read-only at the type level', () => {
    type AssertAsConst = (typeof MetadataKeys)['DATA'] extends 'lombok-ts:data' ? true : false;
    const _check: AssertAsConst = true;
    expect(_check).toBe(true);
  });
});
