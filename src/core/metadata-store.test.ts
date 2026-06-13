import { describe, expect, it, beforeEach } from 'vitest';
import { WeakMapMetadataStore } from './metadata-store.js';

describe('WeakMapMetadataStore', () => {
  let store: WeakMapMetadataStore;
  let target: object;

  beforeEach(() => {
    store = new WeakMapMetadataStore();
    target = { name: 'TestClass' };
  });

  describe('class-level scope (no propertyKey)', () => {
    it('roundtrips a value via set/get', () => {
      store.set('k', target, undefined, 'v');
      expect(store.get<string>('k', target)).toBe('v');
    });

    it('has() returns true after set, false before', () => {
      expect(store.has('k', target)).toBe(false);
      store.set('k', target, undefined, 1);
      expect(store.has('k', target)).toBe(true);
    });

    it('overwrites an existing value', () => {
      store.set('k', target, undefined, 1);
      store.set('k', target, undefined, 2);
      expect(store.get<number>('k', target)).toBe(2);
    });

    it('list() returns all class-level keys', () => {
      store.set('a', target, undefined, 1);
      store.set('b', target, undefined, 2);
      const keys = store.list(target);
      expect(keys).toHaveLength(2);
      expect(new Set(keys)).toEqual(new Set(['a', 'b']));
    });

    it('delete() returns true for existing key, false for absent', () => {
      store.set('k', target, undefined, 1);
      expect(store.delete('k', target)).toBe(true);
      expect(store.delete('k', target)).toBe(false);
      expect(store.has('k', target)).toBe(false);
    });
  });

  describe('member-level scope (with propertyKey)', () => {
    it('roundtrips a value via set/get with string propertyKey', () => {
      store.set('k', target, 'fieldA', 'v');
      expect(store.get<string>('k', target, 'fieldA')).toBe('v');
    });

    it('roundtrips a value via set/get with symbol propertyKey', () => {
      const sym = Symbol('fieldA');
      store.set('k', target, sym, 'v');
      expect(store.get<string>('k', target, sym)).toBe('v');
    });

    it('class-level and member-level scopes do not collide', () => {
      store.set('k', target, undefined, 'class-value');
      store.set('k', target, 'fieldA', 'member-value');
      expect(store.get<string>('k', target)).toBe('class-value');
      expect(store.get<string>('k', target, 'fieldA')).toBe('member-value');
    });

    it('two different propertyKeys do not collide', () => {
      store.set('k', target, 'fieldA', 1);
      store.set('k', target, 'fieldB', 2);
      expect(store.get<number>('k', target, 'fieldA')).toBe(1);
      expect(store.get<number>('k', target, 'fieldB')).toBe(2);
    });

    it('list(target, propertyKey) returns only that member scope keys', () => {
      store.set('a', target, 'fieldA', 1);
      store.set('b', target, 'fieldA', 2);
      store.set('c', target, 'fieldB', 3);
      expect(new Set(store.list(target, 'fieldA'))).toEqual(new Set(['a', 'b']));
      expect(new Set(store.list(target, 'fieldB'))).toEqual(new Set(['c']));
    });

    it('delete() removes only the specific member-scope entry', () => {
      store.set('k', target, 'fieldA', 1);
      store.set('k', target, 'fieldB', 2);
      store.delete('k', target, 'fieldA');
      expect(store.has('k', target, 'fieldA')).toBe(false);
      expect(store.has('k', target, 'fieldB')).toBe(true);
    });
  });

  describe('absent target handling', () => {
    it('get() on never-set target returns undefined', () => {
      expect(store.get('any', target)).toBeUndefined();
      expect(store.get('any', target, 'field')).toBeUndefined();
    });

    it('list() on never-set target returns empty array', () => {
      expect(store.list(target)).toEqual([]);
      expect(store.list(target, 'field')).toEqual([]);
    });

    it('delete() on never-set target returns false', () => {
      expect(store.delete('k', target)).toBe(false);
      expect(store.delete('k', target, 'field')).toBe(false);
    });

    it('has() on never-set target returns false', () => {
      expect(store.has('k', target)).toBe(false);
      expect(store.has('k', target, 'field')).toBe(false);
    });
  });

  describe('different targets are isolated', () => {
    it('two targets have independent storage', () => {
      const t1 = { id: 1 };
      const t2 = { id: 2 };
      store.set('k', t1, undefined, 'v1');
      store.set('k', t2, undefined, 'v2');
      expect(store.get<string>('k', t1)).toBe('v1');
      expect(store.get<string>('k', t2)).toBe('v2');
    });
  });
});
