import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { AnyClass } from '../../legacy/decorate.js';

export interface ProxyHooks {
  before?: (method: string, args: unknown[]) => void;
  after?: (method: string, result: unknown) => void;
}

function isMethod(key: string | symbol, value: unknown): value is (...args: unknown[]) => unknown {
  return typeof key === 'string' && key !== 'constructor' && typeof value === 'function';
}

function wrapProxyInstance<T extends object>(instance: T, hooks: ProxyHooks): T {
  const proto = Object.getPrototypeOf(instance);

  return new Proxy(instance, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (!isMethod(prop, value)) {
        return value;
      }
      const original = (Object.getOwnPropertyDescriptor(proto, prop)?.value ?? value) as (
        ...args: unknown[]
      ) => unknown;
      return (...args: unknown[]) => {
        const methodName = String(prop);
        hooks.before?.(methodName, args);
        const result = original.apply(target, args);
        hooks.after?.(methodName, result);
        return result;
      };
    },
  });
}

function wrapProxyClass(target: AnyClass, hooks: ProxyHooks): AnyClass {
  const ProxyClass = class extends target {
    constructor(...args: unknown[]) {
      super(...args);
      return wrapProxyInstance(this, hooks);
    }
  };

  return ProxyClass as AnyClass;
}

export function proxyClassLegacy(
  backend: Backend,
  target: AnyClass,
  hooks: ProxyHooks = {},
): AnyClass {
  backend.metadata.set(MetadataKeys.PROXY, target, undefined, hooks);
  return wrapProxyClass(target, hooks);
}

export function proxyClassStage3(
  backend: Backend,
  value: AnyClass,
  context: ClassDecoratorContext,
  hooks: ProxyHooks = {},
): AnyClass {
  backend.metadata.set(MetadataKeys.PROXY, context.metadata as object, undefined, hooks);
  return wrapProxyClass(value, hooks);
}
