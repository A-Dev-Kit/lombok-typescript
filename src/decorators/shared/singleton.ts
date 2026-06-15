import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { AnyClass } from '../../legacy/decorate.js';

export function singletonClassLegacy(backend: Backend, target: AnyClass): AnyClass {
  backend.metadata.set(MetadataKeys.SINGLETON, target, undefined, true);

  const Singleton = class extends target {
    static #instance: object | undefined;

    constructor(...args: unknown[]) {
      if (Singleton.#instance) {
        return Singleton.#instance;
      }
      super(...args);
      Singleton.#instance = this as object;
    }
  };

  return Singleton as AnyClass;
}

export function singletonClassStage3(
  backend: Backend,
  value: AnyClass,
  context: ClassDecoratorContext,
): AnyClass {
  backend.metadata.set(MetadataKeys.SINGLETON, context.metadata as object, undefined, true);

  const Singleton = class extends value {
    static #instance: object | undefined;

    constructor(...args: unknown[]) {
      if (Singleton.#instance) {
        return Singleton.#instance;
      }
      super(...args);
      Singleton.#instance = this as object;
    }
  };

  return Singleton as AnyClass;
}
