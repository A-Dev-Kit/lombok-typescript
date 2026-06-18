import type { Backend } from '../../core/backend.js';
import type { PropertyName } from '../../core/types.js';

export function fieldMarkerLegacy(
  backend: Backend,
  targetPrototype: object,
  propertyKey: PropertyName,
  metadataKey: string,
  value: unknown = true,
): void {
  backend.metadata.set(metadataKey, targetPrototype, propertyKey, value);
}

export function fieldMarkerStage3(
  backend: Backend,
  context: ClassFieldDecoratorContext,
  metadataKey: string,
  value: unknown = true,
): void {
  backend.metadata.set(metadataKey, context.metadata as object, context.name, value);
}
