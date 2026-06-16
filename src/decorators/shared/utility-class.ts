import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { AnyClass } from '../../legacy/decorate.js';
import { codegenClassMarkerLegacy, codegenClassMarkerStage3 } from './factory.js';

export function utilityClassLegacy(backend: Backend, target: AnyClass): AnyClass {
  backend.metadata.set(MetadataKeys.UTILITY_CLASS, target, undefined, true);
  codegenClassMarkerLegacy(backend, target, MetadataKeys.UTILITY_CLASS);

  const Wrapped = class extends target {
    constructor(...args: unknown[]) {
      if (new.target !== Wrapped) {
        return Reflect.construct(target, args, new.target as new (...a: unknown[]) => object);
      }
      super(...args);
      throw new TypeError(`Utility class ${target.name} cannot be instantiated`);
    }
  };
  Object.defineProperty(Wrapped, 'name', { value: target.name });
  return Wrapped as AnyClass;
}

export function utilityClassStage3(
  backend: Backend,
  value: AnyClass,
  context: ClassDecoratorContext,
): AnyClass {
  backend.metadata.set(MetadataKeys.UTILITY_CLASS, context.metadata as object, undefined, true);
  codegenClassMarkerStage3(backend, value, context, MetadataKeys.UTILITY_CLASS);

  const Wrapped = class extends value {
    constructor(...args: unknown[]) {
      if (new.target !== Wrapped) {
        return Reflect.construct(value, args, new.target as new (...a: unknown[]) => object);
      }
      super(...args);
      throw new TypeError(`Utility class ${value.name} cannot be instantiated`);
    }
  };
  Object.defineProperty(Wrapped, 'name', { value: value.name });
  return Wrapped as AnyClass;
}
