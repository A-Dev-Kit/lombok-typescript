import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { analyzeSourceString } from '../../codegen/analyzer.js';
import { emitCompanionFile } from '../../codegen/emitters/index.js';
import { arrayElementType, singularize } from '../../codegen/emitters/helpers.js';
import { Builder, Singular } from '../../legacy/index.js';
import { Singular as SingularS3 } from '../../stage3/index.js';
import { legacyBackend } from '../../legacy/backend.js';
import { stage3Backend } from '../../stage3/backend.js';
import { singularFieldLegacy, singularFieldStage3 } from './singular.js';

function emitTs(src: string): string {
  const classes = analyzeSourceString(src);
  return emitCompanionFile('/proj/src/u.ts', '/proj/.lombok/src/u.lombok.ts', classes, '/proj').ts;
}

describe('@Singular', () => {
  it('is a field decorator on both backends', () => {
    @Builder
    class User {
      @Singular() roles: string[] = [];
      name!: string;
    }
    expect(User).toBeDefined();
    expect(typeof Singular).toBe('function');
    expect(typeof SingularS3).toBe('function');
  });

  it('exposes marker functions for both backends', () => {
    class A {
      roles: string[] = [];
    }
    expect(() => singularFieldLegacy(legacyBackend, A.prototype, 'roles', 'role')).not.toThrow();
    const ctx = { kind: 'field', name: 'roles', metadata: {} } as ClassFieldDecoratorContext;
    expect(() => singularFieldStage3(stage3Backend, ctx)).not.toThrow();
  });

  it('generates add-one / add-all / clear with an auto-singularized name', () => {
    const ts = emitTs(`
      @Builder
      class User {
        @Singular() roles: string[] = [];
        name!: string;
      }
    `);
    expect(ts).toContain('private _roles: string[] = [];');
    expect(ts).toContain('role(value: string):');
    expect(ts).toContain('this._roles.push(value);');
    expect(ts).toContain('roles(values: string[]):');
    expect(ts).toContain('this._roles.push(...values);');
    expect(ts).toContain('clearRoles():');
    expect(ts).toContain('instance.roles = this._roles;');
    // A @Singular field replaces the plain setter, not augments it.
    expect(ts).not.toContain('roles(value: string[])');
  });

  it('honors an explicit @Singular name for irregular plurals', () => {
    const ts = emitTs(`
      @Builder
      class Team {
        @Singular('person') people: string[] = [];
      }
    `);
    expect(ts).toContain('person(value: string):');
    expect(ts).toContain('people(values: string[]):');
    expect(ts).toContain('clearPeople():');
  });

  it('throws on a non-array @Singular field', () => {
    expect(() => emitTs(`@Builder class B { @Singular() count: number = 0; }`)).toThrow(
      /array field type/,
    );
  });

  it('throws when the singular name cannot be derived', () => {
    expect(() => emitTs(`@Builder class B { @Singular() data: string[] = []; }`)).toThrow(
      /cannot derive a singular name/,
    );
  });

  it('rejects @Singular combined with @BuilderDefault', () => {
    expect(() =>
      emitTs(`@Builder class B { @Singular() @BuilderDefault xs: string[] = []; }`),
    ).toThrow(/cannot combine/);
  });

  it('singularizes common English plurals', () => {
    expect(singularize('roles')).toBe('role');
    expect(singularize('categories')).toBe('category');
    expect(singularize('boxes')).toBe('box');
    expect(singularize('addresses')).toBe('address');
    expect(singularize('status')).toBeNull();
    expect(singularize('data')).toBeNull();
  });

  it('extracts array element types', () => {
    expect(arrayElementType('string[]')).toBe('string');
    expect(arrayElementType('readonly number[]')).toBe('number');
    expect(arrayElementType('Set<string>')).toBeNull();
  });
});
