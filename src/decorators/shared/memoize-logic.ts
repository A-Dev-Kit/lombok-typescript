import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { PropertyName } from '../../core/types.js';
import { memoizeMethod, type MemoizeOptions } from './memoize.js';

export function memoizeMethodLegacy(
  backend: Backend,
  targetPrototype: object,
  propertyKey: PropertyName,
  descriptor: PropertyDescriptor,
  options: MemoizeOptions = {},
): PropertyDescriptor | void {
  backend.metadata.set(MetadataKeys.MEMOIZE, targetPrototype, propertyKey, options);
  const original = descriptor.value;
  if (typeof original !== 'function') return;
  return {
    ...descriptor,
    value: memoizeMethod(original as (...args: unknown[]) => unknown, options),
  };
}

export function memoizeMethodStage3<This, Args extends unknown[], Return>(
  backend: Backend,
  value: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
  options: MemoizeOptions = {},
): (this: This, ...args: Args) => Return {
  backend.metadata.set(MetadataKeys.MEMOIZE, context.metadata as object, context.name, options);
  return memoizeMethod(value as (...args: unknown[]) => unknown, options) as (
    this: This,
    ...args: Args
  ) => Return;
}
