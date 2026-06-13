import { describe, expect, it, beforeEach } from 'vitest';
import { LegacyBackend, legacyBackend } from './backend.js';

describe('LegacyBackend', () => {
  let backend: LegacyBackend;
  let target: object;

  beforeEach(() => {
    backend = new LegacyBackend();
    target = class IsolatedTarget {};
  });

  it('declares kind="legacy"', () => {
    expect(backend.kind).toBe('legacy');
  });

  it('exposes a metadata store', () => {
    expect(backend.metadata).toBeDefined();
    expect(typeof backend.metadata.set).toBe('function');
    expect(typeof backend.metadata.get).toBe('function');
  });

  describe('reflect-metadata-backed storage', () => {
    it('roundtrips class-level metadata', () => {
      backend.metadata.set('k', target, undefined, 'v');
      expect(backend.metadata.get<string>('k', target)).toBe('v');
      expect(backend.metadata.has('k', target)).toBe(true);
    });

    it('roundtrips field-level metadata with string key', () => {
      backend.metadata.set('k', target, 'name', 'v');
      expect(backend.metadata.get<string>('k', target, 'name')).toBe('v');
    });

    it('roundtrips field-level metadata with symbol key', () => {
      const sym = Symbol('field');
      backend.metadata.set('k', target, sym, 42);
      expect(backend.metadata.get<number>('k', target, sym)).toBe(42);
    });

    it('class and field scopes do not collide for the same key', () => {
      backend.metadata.set('k', target, undefined, 'class');
      backend.metadata.set('k', target, 'field', 'field');
      expect(backend.metadata.get('k', target)).toBe('class');
      expect(backend.metadata.get('k', target, 'field')).toBe('field');
    });

    it('list() enumerates class-level keys', () => {
      backend.metadata.set('a', target, undefined, 1);
      backend.metadata.set('b', target, undefined, 2);
      const keys = backend.metadata.list(target);
      expect(new Set(keys)).toEqual(new Set(['a', 'b']));
    });

    it('list(target, propertyKey) enumerates only that member-scope keys', () => {
      backend.metadata.set('a', target, 'fieldA', 1);
      backend.metadata.set('b', target, 'fieldA', 2);
      backend.metadata.set('c', target, 'fieldB', 3);
      expect(new Set(backend.metadata.list(target, 'fieldA'))).toEqual(new Set(['a', 'b']));
    });

    it('delete() removes class-level metadata and reports presence', () => {
      backend.metadata.set('k', target, undefined, 1);
      expect(backend.metadata.delete('k', target)).toBe(true);
      expect(backend.metadata.delete('k', target)).toBe(false);
      expect(backend.metadata.has('k', target)).toBe(false);
    });

    it('delete() removes member-level metadata and reports presence', () => {
      backend.metadata.set('k', target, 'field', 1);
      expect(backend.metadata.delete('k', target, 'field')).toBe(true);
      expect(backend.metadata.delete('k', target, 'field')).toBe(false);
      expect(backend.metadata.has('k', target, 'field')).toBe(false);
    });

    it('get() on absent key returns undefined', () => {
      expect(backend.metadata.get('absent', target)).toBeUndefined();
      expect(backend.metadata.get('absent', target, 'field')).toBeUndefined();
    });
  });

  describe('exported singleton', () => {
    it('legacyBackend is an instance of LegacyBackend', () => {
      expect(legacyBackend).toBeInstanceOf(LegacyBackend);
      expect(legacyBackend.kind).toBe('legacy');
    });
  });
});
