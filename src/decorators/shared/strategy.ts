import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { AnyClass } from '../../legacy/decorate.js';

const strategyRegistry = new Map<string, Map<string, AnyClass>>();

function familyBucket(family: string, create = false): Map<string, AnyClass> | undefined {
  let bucket = strategyRegistry.get(family);
  if (!bucket && create) {
    bucket = new Map();
    strategyRegistry.set(family, bucket);
  }
  return bucket;
}

export function registerStrategy(family: string, name: string, ctor: AnyClass): void {
  const bucket = familyBucket(family, true)!;
  bucket.set(name, ctor);
}

export function getStrategyFromRegistry<T = unknown>(family: string, name: string): T {
  const ctor = familyBucket(family)?.get(name);
  if (!ctor) {
    throw new Error(`No strategy registered for family "${family}" and name "${name}"`);
  }
  return new ctor() as T;
}

export function listStrategies(family: string): string[] {
  const bucket = familyBucket(family);
  return bucket ? Array.from(bucket.keys()) : [];
}

export function getStrategyRegistry(): ReadonlyMap<string, ReadonlyMap<string, AnyClass>> {
  return strategyRegistry;
}

export const StrategyRegistry = {
  get: getStrategyFromRegistry,
  list: listStrategies,
};

export function strategyClassLegacy(
  backend: Backend,
  target: AnyClass,
  family: string,
  name: string,
): void {
  backend.metadata.set(MetadataKeys.STRATEGY, target, undefined, { family, name });
  registerStrategy(family, name, target);
}

export function strategyClassStage3(
  backend: Backend,
  value: AnyClass,
  context: ClassDecoratorContext,
  family: string,
  name: string,
): void {
  backend.metadata.set(MetadataKeys.STRATEGY, context.metadata as object, undefined, {
    family,
    name,
  });
  registerStrategy(family, name, value);
}
