import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { AnyClass } from '../../legacy/decorate.js';

export function singletonClassLegacy(backend: Backend, target: AnyClass): AnyClass {
  backend.metadata.set(MetadataKeys.SINGLETON, target, undefined, true);
  let instance: object | undefined;

  const Singleton = class extends target {
    constructor(...args: unknown[]) {
      if (instance) {
        return instance;
      }
      super(...args);
      instance = this;
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
  let instance: object | undefined;

  const Singleton = class extends value {
    constructor(...args: unknown[]) {
      if (instance) {
        return instance;
      }
      super(...args);
      instance = this;
    }
  };

  return Singleton as AnyClass;
}
