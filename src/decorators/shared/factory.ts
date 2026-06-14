import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { AnyClass } from '../../legacy/decorate.js';

/** Global factory registry keyed by `@Factory('key')` string. */
const factoryRegistry = new Map<string, AnyClass>();

export function registerFactory(key: string, ctor: AnyClass): void {
  factoryRegistry.set(key, ctor);
}

export function createFromFactory<T = unknown>(key: string, ...args: unknown[]): T {
  const ctor = factoryRegistry.get(key);
  if (!ctor) {
    throw new Error(`No factory registered for key "${key}"`);
  }
  return new ctor(...args) as T;
}

export function getFactoryRegistry(): ReadonlyMap<string, AnyClass> {
  return factoryRegistry;
}

export function factoryClassLegacy(backend: Backend, target: AnyClass, key: string): void {
  backend.metadata.set(MetadataKeys.FACTORY, target, undefined, key);
  registerFactory(key, target);
}

export function factoryClassStage3(
  backend: Backend,
  _value: AnyClass,
  context: ClassDecoratorContext,
  key: string,
): void {
  backend.metadata.set(MetadataKeys.FACTORY, context.metadata as object, undefined, key);
  registerFactory(key, _value);
}

export function codegenClassMarkerLegacy(
  backend: Backend,
  target: AnyClass,
  metadataKey: string,
): void {
  backend.metadata.set(metadataKey, target, undefined, true);
}

export function codegenClassMarkerStage3(
  backend: Backend,
  _value: AnyClass,
  context: ClassDecoratorContext,
  metadataKey: string,
): void {
  backend.metadata.set(metadataKey, context.metadata as object, undefined, true);
}
