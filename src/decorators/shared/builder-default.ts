import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { PropertyName } from '../../core/types.js';
import { fieldMarkerLegacy, fieldMarkerStage3 } from './markers.js';

/**
 * Marks a field so `@Builder` keeps the field's initializer as the default when the
 * builder does not set it. The field must have an initializer (e.g. `role = 'user'`).
 */
export function builderDefaultFieldLegacy(
  backend: Backend,
  targetPrototype: object,
  propertyKey: PropertyName,
): void {
  fieldMarkerLegacy(backend, targetPrototype, propertyKey, MetadataKeys.BUILDER_DEFAULT);
}

export function builderDefaultFieldStage3(
  backend: Backend,
  context: ClassFieldDecoratorContext,
): void {
  fieldMarkerStage3(backend, context, MetadataKeys.BUILDER_DEFAULT);
}
