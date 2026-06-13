import { describe, expect, it } from 'vitest';
import { analyzeClass, analyzeSourceString } from './analyzer.js';

const SYNTHETIC_USER = `
@__TestClassMarker
@__OtherMarker(42, 'config')
class User {
  @__TestField
  name: string = '';

  @__TestField
  age?: number;

  readonly id: string = 'u1';

  greet(@__TestParam msg: string, count: number = 1): string {
    return msg.repeat(count);
  }

  @__TestMethod
  static create(): User {
    return new User();
  }

  async fetch(): Promise<void> {}
}

class Untouched {
  bare: string;
}
`;

describe('analyzeClass', () => {
  it('extracts the class name', () => {
    const info = analyzeClass(SYNTHETIC_USER, 'User');
    expect(info.name).toBe('User');
  });

  it('extracts class-level decorators with arguments', () => {
    const info = analyzeClass(SYNTHETIC_USER, 'User');
    expect(info.decorators).toHaveLength(2);

    const marker = info.decorators.find((d) => d.name === '__TestClassMarker');
    expect(marker).toBeDefined();
    expect(marker!.arguments).toEqual([]);

    const other = info.decorators.find((d) => d.name === '__OtherMarker');
    expect(other).toBeDefined();
    expect(other!.arguments).toEqual(['42', "'config'"]);
  });

  it('extracts fields with type, optional, readonly, decorators, and defaults', () => {
    const info = analyzeClass(SYNTHETIC_USER, 'User');
    expect(info.fields).toHaveLength(3);

    const name = info.fields.find((f) => f.name === 'name')!;
    expect(name.isOptional).toBe(false);
    expect(name.hasDefault).toBe(true);
    expect(name.defaultValue).toBe("''");
    expect(name.decorators.map((d) => d.name)).toEqual(['__TestField']);

    const age = info.fields.find((f) => f.name === 'age')!;
    expect(age.isOptional).toBe(true);
    expect(age.hasDefault).toBe(false);
    expect(age.decorators.map((d) => d.name)).toEqual(['__TestField']);

    const id = info.fields.find((f) => f.name === 'id')!;
    expect(id.isReadonly).toBe(true);
    expect(id.decorators).toEqual([]);
  });

  it('extracts methods with parameters, decorators, async, static flags', () => {
    const info = analyzeClass(SYNTHETIC_USER, 'User');
    const greet = info.methods.find((m) => m.name === 'greet');
    expect(greet).toBeDefined();
    expect(greet!.isAsync).toBe(false);
    expect(greet!.isStatic).toBe(false);
    expect(greet!.parameters.map((p) => p.name)).toEqual(['msg', 'count']);
    expect(greet!.parameters[0]!.decorators.map((d) => d.name)).toEqual(['__TestParam']);
    expect(greet!.parameters[1]!.isOptional).toBe(true);

    const create = info.methods.find((m) => m.name === 'create')!;
    expect(create.isStatic).toBe(true);
    expect(create.decorators.map((d) => d.name)).toEqual(['__TestMethod']);

    const fetchM = info.methods.find((m) => m.name === 'fetch')!;
    expect(fetchM.isAsync).toBe(true);
  });

  it('throws if the requested class is not present', () => {
    expect(() => analyzeClass(SYNTHETIC_USER, 'Missing')).toThrow(/No class named "Missing"/);
  });
});

describe('analyzeSourceString', () => {
  it('returns one entry per class declaration', () => {
    const all = analyzeSourceString(SYNTHETIC_USER);
    expect(all).toHaveLength(2);
    expect(all.map((c) => c.name)).toEqual(['User', 'Untouched']);
  });

  it('handles a file with no classes', () => {
    expect(analyzeSourceString('export const x = 1;')).toEqual([]);
  });

  it('handles a file with multiple decorated classes', () => {
    const src = `
@A
class One {}
@B
class Two {}
class Three {}
`;
    const result = analyzeSourceString(src);
    expect(result.map((c) => c.name)).toEqual(['One', 'Two', 'Three']);
    expect(result[0]!.decorators.map((d) => d.name)).toEqual(['A']);
    expect(result[1]!.decorators.map((d) => d.name)).toEqual(['B']);
    expect(result[2]!.decorators).toEqual([]);
  });
});
