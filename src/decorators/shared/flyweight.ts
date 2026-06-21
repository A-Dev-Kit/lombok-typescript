import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { AnyClass } from '../../legacy/decorate.js';

export interface FlyweightOptions {
  key: (...args: unknown[]) => string;
}

const pools = new WeakMap<AnyClass, Map<string, object>>();

function getPool(ctor: AnyClass): Map<string, object> {
  let pool = pools.get(ctor);
  if (!pool) {
    pool = new Map();
    pools.set(ctor, pool);
  }
  return pool;
}

function wrapFlyweightClass(target: AnyClass, options: FlyweightOptions): AnyClass {
  const pool = getPool(target);

  const FlyweightClass = class extends target {
    constructor(...args: unknown[]) {
      const key = options.key(...args);
      const existing = pool.get(key);
      if (existing) {
        return existing;
      }
      super(...args);
      pool.set(key, this as object);
    }
  };

  return FlyweightClass as AnyClass;
}

export function flyweightClassLegacy(
  backend: Backend,
  target: AnyClass,
  options: FlyweightOptions,
): AnyClass {
  if (typeof options?.key !== 'function') {
    throw new Error('@Flyweight requires a `key` function in options');
  }
  backend.metadata.set(MetadataKeys.FLYWEIGHT, target, undefined, options);
  return wrapFlyweightClass(target, options);
}

export function flyweightClassStage3(
  backend: Backend,
  value: AnyClass,
  context: ClassDecoratorContext,
  options: FlyweightOptions,
): AnyClass {
  if (typeof options?.key !== 'function') {
    throw new Error('@Flyweight requires a `key` function in options');
  }
  backend.metadata.set(MetadataKeys.FLYWEIGHT, context.metadata as object, undefined, options);
  return wrapFlyweightClass(value, options);
}
