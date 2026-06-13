import { describe, expect, it } from 'vitest';
import {
  capitalize,
  deepClone,
  deepEquals,
  deepFreeze,
  hashCode,
  toCamelCase,
  toPascalCase,
} from './index.js';

describe('deepClone', () => {
  it('clones primitives by returning them as-is', () => {
    expect(deepClone(1)).toBe(1);
    expect(deepClone('a')).toBe('a');
    expect(deepClone(true)).toBe(true);
    expect(deepClone(null)).toBe(null);
    expect(deepClone(undefined)).toBeUndefined();
  });

  it('clones objects recursively', () => {
    const src = { a: 1, b: { c: [1, 2] } };
    const cloned = deepClone(src);
    expect(cloned).toEqual(src);
    expect(cloned).not.toBe(src);
    expect(cloned.b).not.toBe(src.b);
    expect(cloned.b.c).not.toBe(src.b.c);
  });

  it('clones arrays', () => {
    const src = [1, [2, 3], { x: 'y' }];
    const cloned = deepClone(src);
    expect(cloned).toEqual(src);
    expect(cloned).not.toBe(src);
    expect(cloned[1]).not.toBe(src[1]);
    expect(cloned[2]).not.toBe(src[2]);
  });

  it('mutating the clone does not affect the source', () => {
    const src = { items: [1, 2, 3] };
    const cloned = deepClone(src);
    cloned.items.push(4);
    expect(src.items).toEqual([1, 2, 3]);
    expect(cloned.items).toEqual([1, 2, 3, 4]);
  });
});

describe('deepFreeze', () => {
  it('freezes the top-level object', () => {
    const obj = deepFreeze({ a: 1 });
    expect(Object.isFrozen(obj)).toBe(true);
  });

  it('freezes nested objects', () => {
    const obj = deepFreeze({ a: { b: { c: 1 } } });
    expect(Object.isFrozen(obj.a)).toBe(true);
    expect(Object.isFrozen(obj.a.b)).toBe(true);
  });

  it('freezes arrays', () => {
    const obj = deepFreeze({ list: [1, 2, 3] });
    expect(Object.isFrozen(obj.list)).toBe(true);
  });

  it('returns the input reference', () => {
    const obj = { a: 1 };
    expect(deepFreeze(obj)).toBe(obj);
  });
});

describe('deepEquals', () => {
  it('considers two primitives equal iff they are === equal', () => {
    expect(deepEquals(1, 1)).toBe(true);
    expect(deepEquals('a', 'a')).toBe(true);
    expect(deepEquals(true, true)).toBe(true);
    expect(deepEquals(1, 2)).toBe(false);
    expect(deepEquals('a', 'b')).toBe(false);
  });

  it('handles null and undefined', () => {
    expect(deepEquals(null, null)).toBe(true);
    expect(deepEquals(undefined, undefined)).toBe(true);
    expect(deepEquals(null, undefined)).toBe(false);
    expect(deepEquals(null, 0)).toBe(false);
  });

  it('compares objects structurally', () => {
    expect(deepEquals({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
    expect(deepEquals({ a: 1 }, { a: 2 })).toBe(false);
    expect(deepEquals({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });

  it('compares nested objects deeply', () => {
    expect(deepEquals({ a: { b: { c: 1 } } }, { a: { b: { c: 1 } } })).toBe(true);
    expect(deepEquals({ a: { b: { c: 1 } } }, { a: { b: { c: 2 } } })).toBe(false);
  });

  it('compares arrays element-wise', () => {
    expect(deepEquals([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(deepEquals([1, 2, 3], [1, 2])).toBe(false);
    expect(deepEquals([1, 2], [1, 2, 3])).toBe(false);
  });

  it('arrays vs object are not equal', () => {
    expect(deepEquals([1, 2], { 0: 1, 1: 2, length: 2 })).toBe(false);
  });
});

describe('hashCode', () => {
  it('returns the same hash for equivalent inputs', () => {
    expect(hashCode({ a: 1, b: 2 })).toBe(hashCode({ a: 1, b: 2 }));
  });

  it('returns different hashes for different inputs (best-effort)', () => {
    expect(hashCode('foo')).not.toBe(hashCode('bar'));
    expect(hashCode(1)).not.toBe(hashCode(2));
  });

  it('returns a 32-bit integer', () => {
    const h = hashCode({ x: Math.random() });
    expect(Number.isInteger(h)).toBe(true);
    expect(h).toBeGreaterThanOrEqual(-(2 ** 31));
    expect(h).toBeLessThan(2 ** 31);
  });
});

describe('capitalize / toCamelCase / toPascalCase', () => {
  it('capitalizes the first letter only', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('')).toBe('');
    expect(capitalize('h')).toBe('H');
  });

  it('toCamelCase strips dashes/underscores and capitalizes following letters', () => {
    expect(toCamelCase('hello-world')).toBe('helloWorld');
    expect(toCamelCase('foo_bar_baz')).toBe('fooBarBaz');
    expect(toCamelCase('alreadyCamel')).toBe('alreadyCamel');
  });

  it('toPascalCase capitalizes the first letter and camelCases the rest', () => {
    expect(toPascalCase('hello-world')).toBe('HelloWorld');
    expect(toPascalCase('foo_bar')).toBe('FooBar');
    expect(toPascalCase('hello')).toBe('Hello');
  });
});
