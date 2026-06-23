import { describe, expect, it } from 'vitest';
import '../../validators/yup.js';
import { runValidation } from '../../validators/adapter.js';
import * as yup from 'yup';
import { z } from 'zod';
import '../../validators/zod.js';
import {
  getValidationErrors,
  validateClassLegacy,
  validateClassStage3,
  validateFieldLegacy,
  validateFieldStage3,
} from './validate-logic.js';
import { legacyBackend } from '../../legacy/backend.js';
import { stage3Backend } from '../../stage3/backend.js';

function makeFieldContext(name: string): ClassFieldDecoratorContext {
  return {
    kind: 'field',
    name,
    static: false,
    private: false,
    metadata: {},
    addInitializer: (fn: (value: unknown) => void) => fn,
  } as unknown as ClassFieldDecoratorContext;
}

function makeClassContext(name: string): ClassDecoratorContext {
  return {
    kind: 'class',
    name,
    metadata: {},
    addInitializer: () => {},
  } as ClassDecoratorContext;
}

describe('validate-logic', () => {
  it('getValidationErrors returns an empty array by default', () => {
    expect(getValidationErrors({})).toEqual([]);
  });

  it('validateFieldLegacy throws on invalid assignment', () => {
    class Row {
      value!: string;
    }
    validateFieldLegacy(legacyBackend, Row.prototype, 'value', yup.string().min(3), {
      provider: 'yup',
    });
    const row = new Row();
    const desc = Object.getOwnPropertyDescriptor(Row.prototype, 'value')!;
    desc.set!.call(row, 'abcd');
    expect(desc.get!.call(row)).toBe('abcd');
    expect(() => desc.set!.call(row, 'ab')).toThrow();
  });

  it('collects validation errors when throwOnError is false', () => {
    class Row {
      value!: string;
    }
    validateFieldLegacy(legacyBackend, Row.prototype, 'value', yup.string().min(3), {
      provider: 'yup',
      throwOnError: false,
    });
    const row = new Row();
    const desc = Object.getOwnPropertyDescriptor(Row.prototype, 'value')!;
    desc.set!.call(row, 'ab');
    expect(getValidationErrors(row).length).toBeGreaterThan(0);
    expect(
      (row as unknown as { validationErrors: unknown[] }).validationErrors.length,
    ).toBeGreaterThan(0);
  });

  it('clears validation errors after successful assignment', () => {
    class Row {
      value!: string;
    }
    validateFieldLegacy(legacyBackend, Row.prototype, 'value', yup.string().min(3), {
      provider: 'yup',
      throwOnError: false,
    });
    const row = new Row();
    const desc = Object.getOwnPropertyDescriptor(Row.prototype, 'value')!;
    desc.set!.call(row, 'ab');
    desc.set!.call(row, 'abcd');
    expect(getValidationErrors(row)).toHaveLength(0);
  });

  it('validateClassLegacy validates instances and exposes validationErrors', () => {
    class Signup {
      email = 'not-an-email';
    }
    const Validated = validateClassLegacy(
      legacyBackend,
      Signup,
      z.object({ email: z.string().email() }),
      { throwOnError: false },
    );
    const signup = new Validated();
    expect(signup.validationErrors.length).toBeGreaterThan(0);
    expect(() =>
      validateClassLegacy(legacyBackend, Signup, z.object({ email: z.string().email() })),
    ).not.toThrow();
  });

  it('validateClassStage3 wraps constructors', () => {
    class Signup {
      email = 'john@example.com';
    }
    const Validated = validateClassStage3(
      stage3Backend,
      Signup,
      makeClassContext('Signup'),
      z.object({ email: z.string().email() }),
    );
    expect(new Validated()).toBeInstanceOf(Signup);
  });

  it('validateClassStage3 collects errors when throwOnError is false', () => {
    class Signup {
      email = 'not-an-email';
    }
    const Validated = validateClassStage3(
      stage3Backend,
      Signup,
      makeClassContext('Signup'),
      z.object({ email: z.string().email() }),
      { throwOnError: false },
    );
    const signup = new Validated();
    expect(signup.validationErrors.length).toBeGreaterThan(0);
  });

  it('validateFieldStage3 throws when throwOnError is true', () => {
    class Row {}
    const init = validateFieldStage3(
      stage3Backend,
      makeFieldContext('value') as ClassFieldDecoratorContext<Row, string>,
      yup.string().min(3),
      { provider: 'yup' },
    );
    const row = new Row();
    expect(() => init?.call(row, 'ab')).toThrow();
  });

  it('skips redefining validationErrors when accessor already exists', () => {
    class Row {
      value!: string;
    }
    validateFieldLegacy(legacyBackend, Row.prototype, 'value', yup.string().min(3), {
      provider: 'yup',
    });
    validateFieldLegacy(legacyBackend, Row.prototype, 'label', yup.string().min(1), {
      provider: 'yup',
    });
    expect(Object.getOwnPropertyDescriptor(Row.prototype, 'validationErrors')?.get).toBeDefined();
  });

  it('validateFieldStage3 validates initial values', () => {
    class Row {}
    const init = validateFieldStage3(
      stage3Backend,
      makeFieldContext('value') as ClassFieldDecoratorContext<Row, string>,
      yup.string().min(3),
      { provider: 'yup', throwOnError: false },
    );
    const row = new Row();
    expect(init?.call(row, 'ab')).toBe('ab');
    expect(getValidationErrors(row).length).toBeGreaterThan(0);
  });

  it('yup adapter validates schemas', () => {
    const schema = yup.string().email();
    expect(() => runValidation(schema, 'bad', 'yup')).toThrow();
    expect(() => runValidation(schema, 'a@b.com', 'yup')).not.toThrow();
  });
});
