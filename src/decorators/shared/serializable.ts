import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { PropertyName } from '../../core/types.js';
import type { AnyClass } from '../../legacy/decorate.js';

export interface SerializableTransform {
  serialize: (value: unknown) => unknown;
  deserialize: (value: unknown) => unknown;
}

export function serializableClassLegacy(backend: Backend, target: AnyClass): void {
  backend.metadata.set(MetadataKeys.SERIALIZABLE, target, undefined, true);
}

export function serializableClassStage3(
  backend: Backend,
  _value: AnyClass,
  context: ClassDecoratorContext,
): void {
  backend.metadata.set(MetadataKeys.SERIALIZABLE, context.metadata as object, undefined, true);
}

export function serializableExcludeFieldLegacy(
  backend: Backend,
  targetPrototype: object,
  propertyKey: PropertyName,
): void {
  backend.metadata.set(MetadataKeys.SERIALIZABLE_EXCLUDE, targetPrototype, propertyKey, true);
}

export function serializableExcludeFieldStage3<This, Value>(
  backend: Backend,
  context: ClassFieldDecoratorContext<This, Value>,
): void {
  backend.metadata.set(
    MetadataKeys.SERIALIZABLE_EXCLUDE,
    context.metadata as object,
    context.name,
    true,
  );
}

export function serializableAliasFieldLegacy(
  backend: Backend,
  targetPrototype: object,
  propertyKey: PropertyName,
  alias: string,
): void {
  backend.metadata.set(MetadataKeys.SERIALIZABLE_ALIAS, targetPrototype, propertyKey, alias);
}

export function serializableAliasFieldStage3<This, Value>(
  backend: Backend,
  context: ClassFieldDecoratorContext<This, Value>,
  alias: string,
): void {
  backend.metadata.set(
    MetadataKeys.SERIALIZABLE_ALIAS,
    context.metadata as object,
    context.name,
    alias,
  );
}

export function serializableTransformFieldLegacy(
  backend: Backend,
  targetPrototype: object,
  propertyKey: PropertyName,
  transform: SerializableTransform,
): void {
  backend.metadata.set(
    MetadataKeys.SERIALIZABLE_TRANSFORM,
    targetPrototype,
    propertyKey,
    transform,
  );
}

export function serializableTransformFieldStage3<This, Value>(
  backend: Backend,
  context: ClassFieldDecoratorContext<This, Value>,
  transform: SerializableTransform,
): void {
  backend.metadata.set(
    MetadataKeys.SERIALIZABLE_TRANSFORM,
    context.metadata as object,
    context.name,
    transform,
  );
}
