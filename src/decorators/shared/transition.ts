import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { PropertyName } from '../../core/types.js';

export interface TransitionOptions {
  from: string | string[];
  to: string;
}

export function normalizeFromStates(from: string | string[]): string[] {
  return Array.isArray(from) ? from : [from];
}

export function transitionMethodLegacy(
  backend: Backend,
  targetPrototype: object,
  propertyKey: PropertyName,
  descriptor: PropertyDescriptor,
  options: TransitionOptions,
): PropertyDescriptor | void {
  backend.metadata.set(MetadataKeys.TRANSITION, targetPrototype, propertyKey, options);
  return descriptor;
}

export function transitionMethodStage3<This, Args extends unknown[], Return>(
  backend: Backend,
  value: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
  options: TransitionOptions,
): (this: This, ...args: Args) => Return {
  backend.metadata.set(MetadataKeys.TRANSITION, context.metadata as object, context.name, options);
  return value;
}
