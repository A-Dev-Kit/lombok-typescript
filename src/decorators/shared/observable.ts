import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { AnyClass } from '../../legacy/decorate.js';
import type { PropertyName } from '../../core/types.js';

export type ObservableListener = (next: unknown, prev: unknown) => void;
export type ObservableWildcardListener = (
  key: string | symbol,
  next: unknown,
  prev: unknown,
) => void;

const LISTENERS = Symbol('lombok-ts:observable-listeners');

type ListenerMap = Map<string | symbol, Set<ObservableListener>>;
type WildcardSet = Set<ObservableWildcardListener>;

interface ObservableInternals {
  listeners: ListenerMap;
  wildcards: WildcardSet;
  derivedKeys: Set<string | symbol>;
  derivedCache: Map<string | symbol, unknown>;
}

function findGetter(proto: object, key: string | symbol): (() => unknown) | undefined {
  let current: object | null = proto;
  while (current) {
    const desc = Object.getOwnPropertyDescriptor(current, key);
    if (desc?.get) return desc.get as () => unknown;
    current = Object.getPrototypeOf(current);
  }
  return undefined;
}

function getInternals(target: object): ObservableInternals {
  const bag = target as Record<symbol, ObservableInternals>;
  if (!bag[LISTENERS]) {
    bag[LISTENERS] = {
      listeners: new Map(),
      wildcards: new Set(),
      derivedKeys: new Set(),
      derivedCache: new Map(),
    };
  }
  return bag[LISTENERS];
}

function notify(
  internals: ObservableInternals,
  key: string | symbol,
  next: unknown,
  prev: unknown,
): void {
  const keyListeners = internals.listeners.get(key);
  if (keyListeners) {
    for (const listener of keyListeners) {
      listener(next, prev);
    }
  }
  for (const listener of internals.wildcards) {
    listener(key, next, prev);
  }

  if (internals.derivedKeys.size > 0) {
    const instance = targetWithInternals(internals);
    for (const derivedKey of internals.derivedKeys) {
      const prevDerived = internals.derivedCache.get(derivedKey);
      internals.derivedCache.delete(derivedKey);
      const getter = findGetter(Object.getPrototypeOf(instance), derivedKey);
      if (!getter) continue;
      const newDerived = getter.call(instance);
      internals.derivedCache.set(derivedKey, newDerived);
      if (prevDerived !== newDerived) {
        const derivedListeners = internals.listeners.get(derivedKey);
        if (derivedListeners) {
          for (const listener of derivedListeners) {
            listener(newDerived, prevDerived);
          }
        }
      }
    }
  }
}

// Weak reference hack: store instance on internals object
const INSTANCE = Symbol('lombok-ts:observable-instance');

function targetWithInternals(internals: ObservableInternals): object {
  return (internals as unknown as Record<symbol, object>)[INSTANCE] ?? {};
}

function installSubscribe(proto: object): void {
  Object.defineProperty(proto, 'subscribe', {
    configurable: true,
    enumerable: false,
    writable: true,
    value: function subscribe(
      this: object,
      key: string | symbol,
      listener: ObservableListener | ObservableWildcardListener,
    ): () => void {
      const internals = getInternals(this);
      (internals as unknown as Record<symbol, object>)[INSTANCE] = this;

      if (key === '*') {
        const wildcardListener = listener as ObservableWildcardListener;
        internals.wildcards.add(wildcardListener);
        return () => internals.wildcards.delete(wildcardListener);
      }

      const keyListener = listener as ObservableListener;
      let set = internals.listeners.get(key);
      if (!set) {
        set = new Set();
        internals.listeners.set(key, set);
      }
      set.add(keyListener);

      const proto = Object.getPrototypeOf(this);
      if (findGetter(proto, key)) {
        internals.derivedKeys.add(key);
      }

      return () => set!.delete(keyListener);
    },
  });
}

function wrapObservableInstance<T extends object>(instance: T): T {
  const internals = getInternals(instance);
  (internals as unknown as Record<symbol, object>)[INSTANCE] = instance;

  return new Proxy(instance, {
    set(target, prop, value, receiver) {
      if (typeof prop === 'symbol') {
        return Reflect.set(target, prop, value, receiver);
      }
      const prev = Reflect.get(target, prop, receiver);
      const result = Reflect.set(target, prop, value, receiver);
      if (prev !== value) {
        notify(internals, prop, value, prev);
      }
      return result;
    },
  });
}

function wrapObservableClass(target: AnyClass): AnyClass {
  installSubscribe(target.prototype as object);

  const ObservableClass = class extends target {
    constructor(...args: unknown[]) {
      super(...args);
      return wrapObservableInstance(this);
    }
  };

  return ObservableClass as AnyClass;
}

export function observableClassLegacy(backend: Backend, target: AnyClass): AnyClass {
  backend.metadata.set(MetadataKeys.OBSERVABLE, target, undefined, true);
  return wrapObservableClass(target);
}

export function observableClassStage3(
  backend: Backend,
  value: AnyClass,
  context: ClassDecoratorContext,
): AnyClass {
  backend.metadata.set(MetadataKeys.OBSERVABLE, context.metadata as object, undefined, true);
  return wrapObservableClass(value);
}

export function observableDerivedLegacy(
  backend: Backend,
  targetPrototype: object,
  propertyKey: PropertyName,
  descriptor: PropertyDescriptor,
): PropertyDescriptor | void {
  backend.metadata.set(MetadataKeys.OBSERVABLE, targetPrototype, propertyKey, { derived: true });
  const originalGet = descriptor.get;
  if (!originalGet) return;

  const key = propertyKey;
  return {
    ...descriptor,
    get(this: object) {
      const internals = getInternals(this);
      (internals as unknown as Record<symbol, object>)[INSTANCE] = this;
      internals.derivedKeys.add(key);

      if (internals.derivedCache.has(key)) {
        return internals.derivedCache.get(key);
      }
      const value = originalGet.call(this);
      internals.derivedCache.set(key, value);
      return value;
    },
  };
}

export function observableDerivedStage3<This>(
  backend: Backend,
  value: (this: This) => unknown,
  context: ClassGetterDecoratorContext<This, unknown>,
): (this: This) => unknown {
  backend.metadata.set(MetadataKeys.OBSERVABLE, context.metadata as object, context.name, {
    derived: true,
  });

  const key = context.name;
  return function derivedGetter(this: This): unknown {
    const internals = getInternals(this as object);
    (internals as unknown as Record<symbol, object>)[INSTANCE] = this as object;
    internals.derivedKeys.add(key);

    if (internals.derivedCache.has(key)) {
      return internals.derivedCache.get(key);
    }
    const result = value.call(this);
    internals.derivedCache.set(key, result);
    return result;
  };
}

/** Alias for `@Observable` (GoF naming). */
export function observerClassLegacy(backend: Backend, target: AnyClass): AnyClass {
  return observableClassLegacy(backend, target);
}

export function observerClassStage3(
  backend: Backend,
  value: AnyClass,
  context: ClassDecoratorContext,
): AnyClass {
  return observableClassStage3(backend, value, context);
}
