import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { AnyClass } from '../../legacy/decorate.js';

const INNER = Symbol('lombok-ts:wraps-inner');

function wrapWrapsClass(target: AnyClass, InnerClass: AnyClass): AnyClass {
  if (typeof InnerClass !== 'function') {
    throw new TypeError('@Wraps requires a constructor function');
  }

  const WrapsClass = class extends target {
    protected inner: InstanceType<typeof InnerClass>;

    constructor(...args: unknown[]) {
      super();
      const inner = args[0];
      if (inner === undefined || !(inner instanceof InnerClass)) {
        throw new TypeError(`@Wraps(${InnerClass.name}) expects an instance as the first argument`);
      }
      this.inner = inner as InstanceType<typeof InnerClass>;
      (this as Record<symbol, unknown>)[INNER] = inner;
    }
  };

  return WrapsClass as AnyClass;
}

export function wrapsClassLegacy(
  backend: Backend,
  target: AnyClass,
  InnerClass: AnyClass,
): AnyClass {
  backend.metadata.set(MetadataKeys.WRAPS, target, undefined, InnerClass);
  return wrapWrapsClass(target, InnerClass);
}

export function wrapsClassStage3(
  backend: Backend,
  value: AnyClass,
  context: ClassDecoratorContext,
  InnerClass: AnyClass,
): AnyClass {
  backend.metadata.set(MetadataKeys.WRAPS, context.metadata as object, undefined, InnerClass);
  return wrapWrapsClass(value, InnerClass);
}
