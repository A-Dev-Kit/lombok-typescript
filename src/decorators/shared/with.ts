import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { AnyClass } from '../../legacy/decorate.js';
import type { PropertyName } from '../../core/types.js';
import { codegenClassMarkerLegacy, codegenClassMarkerStage3 } from './factory.js';
import { fieldMarkerLegacy, fieldMarkerStage3 } from './markers.js';

export function withClassLegacy(backend: Backend, target: AnyClass): void {
  codegenClassMarkerLegacy(backend, target, MetadataKeys.WITH);
}

export function withClassStage3(
  backend: Backend,
  value: AnyClass,
  context: ClassDecoratorContext,
): void {
  codegenClassMarkerStage3(backend, value, context, MetadataKeys.WITH);
}

export function withFieldLegacy(
  backend: Backend,
  targetPrototype: object,
  propertyKey: PropertyName,
): void {
  fieldMarkerLegacy(backend, targetPrototype, propertyKey, MetadataKeys.WITH);
}

export function withFieldStage3(backend: Backend, context: ClassFieldDecoratorContext): void {
  fieldMarkerStage3(backend, context, MetadataKeys.WITH);
}
