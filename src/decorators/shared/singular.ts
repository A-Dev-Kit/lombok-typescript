import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { PropertyName } from '../../core/types.js';
import { fieldMarkerLegacy, fieldMarkerStage3 } from './markers.js';

/**
 * Marks an array field so `@Builder` generates add-one / add-all / clear accumulator
 * methods instead of a plain setter. An optional `name` overrides the auto-singularized
 * add-one method name (e.g. `@Singular('person')` for `people`).
 */
export function singularFieldLegacy(
  backend: Backend,
  targetPrototype: object,
  propertyKey: PropertyName,
  name?: string,
): void {
  fieldMarkerLegacy(backend, targetPrototype, propertyKey, MetadataKeys.SINGULAR, name ?? true);
}

export function singularFieldStage3(
  backend: Backend,
  context: ClassFieldDecoratorContext,
  name?: string,
): void {
  fieldMarkerStage3(backend, context, MetadataKeys.SINGULAR, name ?? true);
}
