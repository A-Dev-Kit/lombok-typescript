import type { ValidateProvider } from '../../validators/adapter.js';
import { runValidation } from '../../validators/adapter.js';
import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { PropertyName } from '../../core/types.js';
import type { AnyClass } from '../../legacy/decorate.js';

export interface ValidateOptions {
  provider?: ValidateProvider;
  throwOnError?: boolean;
}

const VALIDATION_ERRORS = Symbol('lombok.validationErrors');

export function getValidationErrors(instance: object): unknown[] {
  return ((instance as Record<symbol, unknown[]>)[VALIDATION_ERRORS] as unknown[]) ?? [];
}

function installValidationErrorsAccessor(proto: object): void {
  if (Object.getOwnPropertyDescriptor(proto, 'validationErrors')) return;
  Object.defineProperty(proto, 'validationErrors', {
    get(this: object) {
      return getValidationErrors(this);
    },
    enumerable: false,
    configurable: true,
  });
}

function setValidationErrors(instance: object, errors: unknown[]): void {
  Object.defineProperty(instance, VALIDATION_ERRORS, {
    value: errors,
    enumerable: false,
    configurable: true,
    writable: true,
  });
}

function handleValidationFailure(
  instance: object,
  error: unknown,
  throwOnError: boolean,
  label: string,
): void {
  if (throwOnError) {
    throw error;
  }
  const existing = getValidationErrors(instance);
  setValidationErrors(instance, [...existing, { field: label, error }]);
}

export function validateFieldLegacy(
  backend: Backend,
  targetPrototype: object,
  propertyKey: PropertyName,
  schema: unknown,
  options: ValidateOptions = {},
): void {
  const provider = options.provider ?? 'zod';
  const throwOnError = options.throwOnError ?? true;
  backend.metadata.set(MetadataKeys.VALIDATE, targetPrototype, propertyKey, {
    schema,
    provider,
    throwOnError,
  });
  installValidationErrorsAccessor(targetPrototype);
  const key = String(propertyKey);
  let stored: unknown;

  Object.defineProperty(targetPrototype, propertyKey, {
    configurable: true,
    enumerable: true,
    get() {
      return stored;
    },
    set(value: unknown) {
      try {
        runValidation(schema, value, provider);
        stored = value;
        if (!throwOnError) {
          setValidationErrors(this as object, []);
        }
      } catch (error) {
        handleValidationFailure(this as object, error, throwOnError, key);
      }
    },
  });
}

export function validateClassLegacy(
  backend: Backend,
  target: AnyClass,
  schema: unknown,
  options: ValidateOptions = {},
): AnyClass {
  const provider = options.provider ?? 'zod';
  const throwOnError = options.throwOnError ?? true;
  backend.metadata.set(MetadataKeys.VALIDATE, target, undefined, {
    schema,
    provider,
    throwOnError,
  });

  const Validated = class extends target {
    constructor(...args: unknown[]) {
      super(...args);
      try {
        runValidation(schema, this, provider);
      } catch (error) {
        handleValidationFailure(this, error, throwOnError, target.name);
      }
    }
  };
  installValidationErrorsAccessor(Validated.prototype);
  return Validated as AnyClass;
}

export function validateFieldStage3<This, Value>(
  backend: Backend,
  context: ClassFieldDecoratorContext<This, Value>,
  schema: unknown,
  options: ValidateOptions = {},
): ((this: This, initialValue: Value) => Value) | void {
  const provider = options.provider ?? 'zod';
  const throwOnError = options.throwOnError ?? true;
  backend.metadata.set(MetadataKeys.VALIDATE, context.metadata as object, context.name, {
    schema,
    provider,
    throwOnError,
  });
  const name = String(context.name);
  return function (this: This, initialValue: Value): Value {
    try {
      runValidation(schema, initialValue, provider);
      return initialValue;
    } catch (error) {
      handleValidationFailure(this as object, error, throwOnError, name);
      return initialValue;
    }
  };
}

export function validateClassStage3(
  backend: Backend,
  value: AnyClass,
  context: ClassDecoratorContext,
  schema: unknown,
  options: ValidateOptions = {},
): AnyClass {
  const provider = options.provider ?? 'zod';
  const throwOnError = options.throwOnError ?? true;
  backend.metadata.set(MetadataKeys.VALIDATE, context.metadata as object, undefined, {
    schema,
    provider,
    throwOnError,
  });

  const Validated = class extends value {
    constructor(...args: unknown[]) {
      super(...args);
      try {
        runValidation(schema, this, provider);
      } catch (error) {
        handleValidationFailure(this, error, throwOnError, value.name);
      }
    }
  };
  installValidationErrorsAccessor(Validated.prototype);
  return Validated as AnyClass;
}
