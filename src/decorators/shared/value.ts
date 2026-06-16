import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { AnyClass } from '../../legacy/decorate.js';
import { codegenClassMarkerLegacy, codegenClassMarkerStage3 } from './factory.js';

export function valueClassLegacy(backend: Backend, target: AnyClass): void {
  codegenClassMarkerLegacy(backend, target, MetadataKeys.VALUE);
}

export function valueClassStage3(
  backend: Backend,
  value: AnyClass,
  context: ClassDecoratorContext,
): void {
  codegenClassMarkerStage3(backend, value, context, MetadataKeys.VALUE);
}
