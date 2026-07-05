import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { analyzeSourceString } from '../../codegen/analyzer.js';
import { emitCompanionFile } from '../../codegen/emitters/index.js';
import { Builder, BuilderDefault } from '../../legacy/index.js';
import { BuilderDefault as BuilderDefaultS3 } from '../../stage3/index.js';
import { legacyBackend } from '../../legacy/backend.js';
import { stage3Backend } from '../../stage3/backend.js';
import { builderDefaultFieldLegacy, builderDefaultFieldStage3 } from './builder-default.js';

function emitTs(src: string): string {
  const classes = analyzeSourceString(src);
  return emitCompanionFile(
    '/proj/src/user.ts',
    '/proj/.lombok/src/user.lombok.ts',
    classes,
    '/proj',
  ).ts;
}

describe('@BuilderDefault', () => {
  it('is a legacy field decorator that applies without throwing', () => {
    @Builder
    class User {
      @BuilderDefault role: string = 'user';
      name!: string;
    }
    expect(User).toBeDefined();
    expect(typeof BuilderDefault).toBe('function');
  });

  it('exposes the marker functions for both backends', () => {
    class A {
      role = 'user';
    }
    expect(() => builderDefaultFieldLegacy(legacyBackend, A.prototype, 'role')).not.toThrow();
    const ctx = { kind: 'field', name: 'role', metadata: {} } as ClassFieldDecoratorContext;
    expect(() => builderDefaultFieldStage3(stage3Backend, ctx)).not.toThrow();
    expect(typeof BuilderDefaultS3).toBe('function');
  });

  it('keeps the field initializer when the builder does not set the field', () => {
    const ts = emitTs(`
      @Builder
      class User {
        @BuilderDefault role: string = 'user';
        name!: string;
      }
    `);
    // Defaulted field: optional store + set flag + guarded assignment.
    expect(ts).toContain('private _roleSet = false;');
    expect(ts).toContain('this._roleSet = true;');
    expect(ts).toContain('if (this._roleSet) instance.role = this._role!;');
    // Non-defaulted field keeps the unconditional assignment.
    expect(ts).toContain('instance.name = this._name!;');
    expect(ts).not.toContain('if (this._nameSet)');
  });

  it('throws when @BuilderDefault marks a field with no initializer', () => {
    expect(() =>
      emitTs(`
        @Builder
        class Bad {
          @BuilderDefault role!: string;
        }
      `),
    ).toThrow(/no initializer/);
  });
});
