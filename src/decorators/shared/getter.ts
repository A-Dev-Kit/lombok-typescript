import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { PropertyName } from '../../core/types.js';
import { fieldMarkerLegacy, fieldMarkerStage3 } from './markers.js';

export function getterFieldLegacy(
  backend: Backend,
  targetPrototype: object,
  propertyKey: PropertyName,
): void {
  fieldMarkerLegacy(backend, targetPrototype, propertyKey, MetadataKeys.GETTER);
}

export function getterFieldStage3(backend: Backend, context: ClassFieldDecoratorContext): void {
  fieldMarkerStage3(backend, context, MetadataKeys.GETTER);
}
