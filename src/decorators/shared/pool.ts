import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { AnyClass } from '../../legacy/decorate.js';

export interface PoolOptions<T = unknown> {
  /** Maximum number of live instances (available + leased). */
  size: number;
  /** Build a fresh instance. Defaults to `new target()` (zero-arg constructor). */
  factory?: () => T;
  /** Cleanup callback invoked on `release` before returning the instance to the pool. */
  reset?: (instance: T) => void;
}

/**
 * Type of a `@Pool`-decorated class: the original constructor plus the two runtime statics
 * `acquire` / `release`. `experimentalDecorators` does not propagate the wrapper's static
 * additions, so cast when you want typed access: `(Connection as Pooled<typeof Connection>).acquire()`.
 */
export type Pooled<T extends new (...args: never[]) => object> = T & {
  acquire(): InstanceType<T>;
  release(instance: InstanceType<T>): void;
};

/** Thrown by `Class.acquire()` when the pool is at capacity and every instance is leased. */
export class PoolExhaustedError extends Error {
  readonly className: string;
  readonly size: number;
  constructor(className: string, size: number) {
    super(
      `@Pool exhausted for ${className} (size=${size}); release() an instance before acquiring another`,
    );
    this.name = 'PoolExhaustedError';
    this.className = className;
    this.size = size;
  }
}

function assertOptions(options: PoolOptions): void {
  if (!options || typeof options.size !== 'number' || options.size < 1) {
    throw new Error('@Pool requires a positive integer `size` in options');
  }
}

function wrapPoolClass(target: AnyClass, options: PoolOptions): AnyClass {
  const available: object[] = [];
  const leased = new Set<object>();

  const PoolClass = class extends target {} as AnyClass;

  const build = (): object => {
    if (options.factory) return options.factory() as object;
    // Construct via the wrapper so `instance instanceof DecoratedClass` holds.
    return new (PoolClass as new () => object)();
  };

  Object.defineProperty(PoolClass, 'acquire', {
    value: function acquire(): object {
      const reused = available.pop();
      if (reused) {
        leased.add(reused);
        return reused;
      }
      if (leased.size >= options.size) {
        throw new PoolExhaustedError(target.name || 'anonymous', options.size);
      }
      const fresh = build();
      leased.add(fresh);
      return fresh;
    },
    writable: false,
    enumerable: false,
    configurable: false,
  });

  Object.defineProperty(PoolClass, 'release', {
    value: function release(instance: object): void {
      if (!leased.has(instance)) return;
      leased.delete(instance);
      if (options.reset) {
        try {
          options.reset(instance);
        } catch {
          // Reset failed — discard the instance rather than return a broken one to the pool.
          return;
        }
      }
      available.push(instance);
    },
    writable: false,
    enumerable: false,
    configurable: false,
  });

  return PoolClass;
}

export function poolClassLegacy(
  backend: Backend,
  target: AnyClass,
  options: PoolOptions,
): AnyClass {
  assertOptions(options);
  backend.metadata.set(MetadataKeys.POOL, target, undefined, options);
  return wrapPoolClass(target, options);
}

export function poolClassStage3(
  backend: Backend,
  value: AnyClass,
  context: ClassDecoratorContext,
  options: PoolOptions,
): AnyClass {
  assertOptions(options);
  backend.metadata.set(MetadataKeys.POOL, context.metadata as object, undefined, options);
  return wrapPoolClass(value, options);
}
