import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { AnyClass } from '../../legacy/decorate.js';
import type { PropertyName } from '../../core/types.js';
import { deepClone } from '../../utils/index.js';

export const MEMENTO_SNAPSHOT = Symbol('lombok-ts:memento-snapshot');

const stage3MementoExcluded = new WeakMap<object, Set<string>>();
const legacyMementoExcluded = new WeakMap<object, Set<string>>();

function registerLegacyMementoExclude(proto: object, field: string): void {
  const set = legacyMementoExcluded.get(proto) ?? new Set<string>();
  set.add(field);
  legacyMementoExcluded.set(proto, set);
}

function registerStage3MementoExclude(classMetadata: object, field: string): void {
  const set = stage3MementoExcluded.get(classMetadata) ?? new Set<string>();
  set.add(field);
  stage3MementoExcluded.set(classMetadata, set);
}

export interface MementoSnapshot {
  readonly [MEMENTO_SNAPSHOT]: true;
  readonly data: Record<string, unknown>;
}

function isMementoSnapshot(value: unknown): value is MementoSnapshot {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as MementoSnapshot)[MEMENTO_SNAPSHOT] === true
  );
}

function collectExcludedFields(
  metadata: Backend['metadata'],
  proto: object,
  classMetadata?: object,
): Set<string> {
  const excluded = new Set<string>();
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key === 'constructor') continue;
    if (
      metadata.has(MetadataKeys.MEMENTO_EXCLUDE, proto, key) ||
      (classMetadata && metadata.has(MetadataKeys.MEMENTO_EXCLUDE, classMetadata, key))
    ) {
      excluded.add(key);
    }
  }
  if (classMetadata) {
    for (const key of stage3MementoExcluded.get(classMetadata) ?? []) {
      excluded.add(key);
    }
  }
  for (const key of legacyMementoExcluded.get(proto) ?? []) {
    excluded.add(key);
  }
  return excluded;
}

function snapshotInstance(
  instance: Record<string, unknown>,
  excluded: Set<string>,
): MementoSnapshot {
  const data: Record<string, unknown> = {};
  for (const key of Object.keys(instance)) {
    if (excluded.has(key)) continue;
    if (key === 'save' || key === 'restore') continue;
    data[key] = deepClone(instance[key]);
  }
  return { [MEMENTO_SNAPSHOT]: true, data };
}

function applySnapshot(instance: Record<string, unknown>, snapshot: MementoSnapshot): void {
  for (const [key, value] of Object.entries(snapshot.data)) {
    instance[key] = deepClone(value);
  }
}

function wrapMementoClass(backend: Backend, target: AnyClass, classMetadata?: object): AnyClass {
  const excluded = collectExcludedFields(
    backend.metadata,
    target.prototype as object,
    classMetadata,
  );

  const MementoClass = class extends target {
    save(): MementoSnapshot {
      return snapshotInstance(this as Record<string, unknown>, excluded);
    }

    restore(snapshot: MementoSnapshot): void {
      if (!isMementoSnapshot(snapshot)) {
        throw new TypeError('restore() expects a snapshot returned from save()');
      }
      applySnapshot(this as Record<string, unknown>, snapshot);
    }
  };

  return MementoClass as AnyClass;
}

export function mementoClassLegacy(backend: Backend, target: AnyClass): AnyClass {
  backend.metadata.set(MetadataKeys.MEMENTO, target, undefined, true);
  return wrapMementoClass(backend, target);
}

export function mementoClassStage3(
  backend: Backend,
  value: AnyClass,
  context: ClassDecoratorContext,
): AnyClass {
  backend.metadata.set(MetadataKeys.MEMENTO, context.metadata as object, undefined, true);
  return wrapMementoClass(backend, value, context.metadata as object);
}

export function mementoExcludeFieldLegacy(
  backend: Backend,
  targetPrototype: object,
  propertyKey: PropertyName,
): void {
  backend.metadata.set(MetadataKeys.MEMENTO_EXCLUDE, targetPrototype, propertyKey, true);
  registerLegacyMementoExclude(targetPrototype, String(propertyKey));
}

export function mementoExcludeFieldStage3<This, Value>(
  backend: Backend,
  context: ClassFieldDecoratorContext<This, Value>,
): void {
  backend.metadata.set(
    MetadataKeys.MEMENTO_EXCLUDE,
    context.metadata as object,
    context.name,
    true,
  );
  registerStage3MementoExclude(context.metadata as object, String(context.name));
}
