import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { PropertyName } from '../../core/types.js';

export interface HookOptions {
  name: string;
}

export function hookMethodLegacy(
  backend: Backend,
  targetPrototype: object,
  propertyKey: PropertyName,
  options: HookOptions,
): void {
  backend.metadata.set(MetadataKeys.HOOK, targetPrototype, propertyKey, options);
}

export function hookMethodStage3(
  backend: Backend,
  _value: unknown,
  context: ClassMethodDecoratorContext,
  options: HookOptions,
): void {
  backend.metadata.set(MetadataKeys.HOOK, context.metadata as object, context.name, options);
}
