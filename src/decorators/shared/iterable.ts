import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { AnyClass } from '../../legacy/decorate.js';
import type { PropertyName } from '../../core/types.js';

const ITERATE_FIELD = Symbol('lombok-ts:iterate-over-field');
const legacyIterateFields = new WeakMap<object, (string | symbol)[]>();
const stage3IterateFields = new WeakMap<object, (string | symbol)[]>();

function registerLegacyIterateField(proto: object, field: string | symbol): void {
  const existing = legacyIterateFields.get(proto) ?? [];
  existing.push(field);
  legacyIterateFields.set(proto, existing);
}

function registerStage3IterateField(classMetadata: object, field: string | symbol): void {
  const existing = stage3IterateFields.get(classMetadata) ?? [];
  existing.push(field);
  stage3IterateFields.set(classMetadata, existing);
}

function resolveIterateField(
  backend: Backend,
  proto: object,
  classMetadata?: object,
): string | symbol {
  const fields: (string | symbol)[] = [];

  for (const key of [
    ...Object.getOwnPropertyNames(proto),
    ...Object.getOwnPropertySymbols(proto),
  ]) {
    if (key === 'constructor') continue;
    if (
      backend.metadata.has(MetadataKeys.ITERATE_OVER, proto, key) ||
      (classMetadata && backend.metadata.has(MetadataKeys.ITERATE_OVER, classMetadata, key))
    ) {
      fields.push(key);
    }
  }

  if (classMetadata) {
    fields.push(...(stage3IterateFields.get(classMetadata) ?? []));
  }

  fields.push(...(legacyIterateFields.get(proto) ?? []));

  if (fields.length === 0) {
    throw new Error('@Iterable requires exactly one @IterateOver field');
  }
  if (fields.length > 1) {
    throw new Error('@Iterable allows only one @IterateOver field');
  }

  return fields[0]!;
}

function installIterator(target: AnyClass, fieldKey: string | symbol): void {
  Object.defineProperty(target.prototype, Symbol.iterator, {
    configurable: true,
    enumerable: false,
    writable: true,
    value: function* iterateOver(this: Record<string | symbol, Iterable<unknown>>) {
      const collection = this[fieldKey];
      if (collection == null) return;
      yield* collection;
    },
  });
}

export function iterableClassLegacy(backend: Backend, target: AnyClass): void {
  backend.metadata.set(MetadataKeys.ITERABLE, target, undefined, true);
  const fieldKey = resolveIterateField(backend, target.prototype as object);
  (target as unknown as Record<symbol, string | symbol>)[ITERATE_FIELD] = fieldKey;
  installIterator(target, fieldKey);
}

export function iterableClassStage3(
  backend: Backend,
  value: AnyClass,
  context: ClassDecoratorContext,
): void {
  backend.metadata.set(MetadataKeys.ITERABLE, context.metadata as object, undefined, true);
  const fieldKey = resolveIterateField(
    backend,
    value.prototype as object,
    context.metadata as object,
  );
  (value as unknown as Record<symbol, string | symbol>)[ITERATE_FIELD] = fieldKey;
  installIterator(value, fieldKey);
}

export function iterateOverFieldLegacy(
  backend: Backend,
  targetPrototype: object,
  propertyKey: PropertyName,
): void {
  backend.metadata.set(MetadataKeys.ITERATE_OVER, targetPrototype, propertyKey, true);
  registerLegacyIterateField(targetPrototype, propertyKey);
}

export function iterateOverFieldStage3<This, Value>(
  backend: Backend,
  context: ClassFieldDecoratorContext<This, Value>,
): void {
  backend.metadata.set(MetadataKeys.ITERATE_OVER, context.metadata as object, context.name, true);
  registerStage3IterateField(context.metadata as object, context.name);
}
