import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { AnyClass } from '../../legacy/decorate.js';
import { deepFreezeInstance } from './deep-freeze.js';

export function deepFreezeClassLegacy(backend: Backend, target: AnyClass): AnyClass {
  backend.metadata.set(MetadataKeys.DEEP_FREEZE, target, undefined, true);
  const Frozen = class extends target {
    constructor(...args: unknown[]) {
      super(...args);
      deepFreezeInstance(this);
    }
  };
  return Frozen as AnyClass;
}

export function deepFreezeClassStage3(
  backend: Backend,
  value: AnyClass,
  context: ClassDecoratorContext,
): AnyClass {
  backend.metadata.set(MetadataKeys.DEEP_FREEZE, context.metadata as object, undefined, true);
  const Original = value;
  return class extends Original {
    constructor(...args: unknown[]) {
      super(...args);
      deepFreezeInstance(this);
    }
  } as AnyClass;
}
