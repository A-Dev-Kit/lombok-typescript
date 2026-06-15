import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { AnyClass } from '../../legacy/decorate.js';
import { deepClone } from '../../utils/index.js';

export function prototypeClassLegacy(backend: Backend, target: AnyClass): AnyClass {
  backend.metadata.set(MetadataKeys.PROTOTYPE, target, undefined, true);

  const Prototype = class extends target {
    constructor(...args: unknown[]) {
      super(...args);
      const clone = deepClone(this) as object;
      return clone;
    }
  };

  return Prototype as AnyClass;
}

export function prototypeClassStage3(
  backend: Backend,
  value: AnyClass,
  context: ClassDecoratorContext,
): AnyClass {
  backend.metadata.set(MetadataKeys.PROTOTYPE, context.metadata as object, undefined, true);

  const Prototype = class extends value {
    constructor(...args: unknown[]) {
      super(...args);
      const clone = deepClone(this) as object;
      return clone;
    }
  };

  return Prototype as AnyClass;
}
