import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { PropertyName } from '../../core/types.js';

export function assertNonNull(value: unknown, label: string): void {
  if (value === null || value === undefined) {
    throw new TypeError(`${label} must not be null or undefined`);
  }
}

export function nonNullFieldLegacy(
  backend: Backend,
  targetPrototype: object,
  propertyKey: PropertyName,
): void {
  backend.metadata.set(MetadataKeys.NON_NULL, targetPrototype, propertyKey, true);
  const key = String(propertyKey);
  let stored: unknown;

  Object.defineProperty(targetPrototype, propertyKey, {
    configurable: true,
    enumerable: true,
    get() {
      return stored;
    },
    set(value: unknown) {
      assertNonNull(value, key);
      stored = value;
    },
  });
}

export function nonNullParameterLegacy(
  backend: Backend,
  targetPrototype: object,
  propertyKey: PropertyName | undefined,
  parameterIndex: number,
): void {
  backend.metadata.set(MetadataKeys.NON_NULL_PARAM, targetPrototype, propertyKey, parameterIndex);
}

export function wrapMethodWithNonNullParams(
  original: (...args: unknown[]) => unknown,
  paramIndices: number[],
  methodName: string,
): (...args: unknown[]) => unknown {
  return function (this: unknown, ...args: unknown[]) {
    for (const index of paramIndices) {
      assertNonNull(args[index], `${methodName} argument at index ${index}`);
    }
    return original.apply(this, args);
  };
}

export function nonNullFieldStage3<This, Value>(
  backend: Backend,
  context: ClassFieldDecoratorContext<This, Value>,
): ((this: This, initialValue: Value) => Value) | void {
  backend.metadata.set(MetadataKeys.NON_NULL, context.metadata as object, context.name, true);
  const name = String(context.name);
  return function (initialValue: Value): Value {
    assertNonNull(initialValue, name);
    return initialValue;
  };
}
