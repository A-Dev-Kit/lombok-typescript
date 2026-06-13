import { describe, expect, it, beforeEach } from 'vitest';
import { Stage3Backend, stage3Backend } from './backend.js';

describe('Stage3Backend', () => {
  let backend: Stage3Backend;

  beforeEach(() => {
    backend = new Stage3Backend();
  });

  it('declares kind="stage3"', () => {
    expect(backend.kind).toBe('stage3');
  });

  it('exposes a metadata store', () => {
    expect(backend.metadata).toBeDefined();
    expect(typeof backend.metadata.set).toBe('function');
    expect(typeof backend.metadata.get).toBe('function');
  });

  it('roundtrips class-level metadata via the WeakMap store', () => {
    const target = {};
    backend.metadata.set('k', target, undefined, 'v');
    expect(backend.metadata.get<string>('k', target)).toBe('v');
  });

  it('roundtrips member-level metadata via the WeakMap store', () => {
    const metadataObj = {};
    backend.metadata.set('k', metadataObj, 'fieldA', 1);
    expect(backend.metadata.get<number>('k', metadataObj, 'fieldA')).toBe(1);
  });

  it('two different metadata objects are isolated', () => {
    const m1 = {};
    const m2 = {};
    backend.metadata.set('k', m1, undefined, 'm1-value');
    backend.metadata.set('k', m2, undefined, 'm2-value');
    expect(backend.metadata.get<string>('k', m1)).toBe('m1-value');
    expect(backend.metadata.get<string>('k', m2)).toBe('m2-value');
  });

  describe('exported singleton', () => {
    it('stage3Backend is an instance of Stage3Backend', () => {
      expect(stage3Backend).toBeInstanceOf(Stage3Backend);
      expect(stage3Backend.kind).toBe('stage3');
    });
  });
});
