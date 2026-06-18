import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { AnyClass } from '../../legacy/decorate.js';
import type { PropertyName } from '../../core/types.js';

export interface LogOptions {
  /** Logger name shown in output. Defaults to the class name. */
  name?: string;
  /** Log level prefix. Default `'info'`. */
  level?: 'debug' | 'info' | 'warn' | 'error';
}

function wrapPrototypeMethods(target: AnyClass, options: LogOptions = {}): void {
  const proto = target.prototype as Record<string, unknown>;
  const loggerName = options.name ?? target.name;
  const level = options.level ?? 'info';
  const logFn = level === 'warn' ? console.warn : level === 'error' ? console.error : console.info;

  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key === 'constructor') continue;
    const desc = Object.getOwnPropertyDescriptor(proto, key);
    if (!desc || typeof desc.value !== 'function') continue;
    const original = desc.value as (...args: unknown[]) => unknown;
    desc.value = function logWrapper(this: unknown, ...args: unknown[]) {
      logFn.call(console, `[${loggerName}] ${key}`, ...args);
      return original.apply(this, args);
    };
    Object.defineProperty(proto, key, desc);
  }
}

export function logClassLegacy(backend: Backend, target: AnyClass, options: LogOptions = {}): void {
  backend.metadata.set(MetadataKeys.LOG, target, undefined, options);
  wrapPrototypeMethods(target, options);
}

export function logClassStage3(
  backend: Backend,
  value: AnyClass,
  context: ClassDecoratorContext,
  options: LogOptions = {},
): void {
  backend.metadata.set(MetadataKeys.LOG, context.metadata as object, undefined, options);
  wrapPrototypeMethods(value, options);
}

export function logMethodLegacy(
  backend: Backend,
  targetPrototype: object,
  propertyKey: PropertyName,
  descriptor: PropertyDescriptor,
  options: LogOptions = {},
): PropertyDescriptor | void {
  backend.metadata.set(MetadataKeys.LOG, targetPrototype, propertyKey, options);
  const original = descriptor.value;
  if (typeof original !== 'function') return;
  const methodName = String(propertyKey);
  const loggerName = options.name ?? 'Method';
  const level = options.level ?? 'info';
  const logFn = level === 'warn' ? console.warn : level === 'error' ? console.error : console.info;
  return {
    ...descriptor,
    value: function logWrapper(this: unknown, ...args: unknown[]) {
      logFn.call(console, `[${loggerName}] ${methodName}`, ...args);
      return (original as (...a: unknown[]) => unknown).apply(this, args);
    },
  };
}

export function logMethodStage3<This, Args extends unknown[], Return>(
  backend: Backend,
  value: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
  options: LogOptions = {},
): (this: This, ...args: Args) => Return {
  backend.metadata.set(MetadataKeys.LOG, context.metadata as object, context.name, options);
  const methodName = String(context.name);
  const loggerName = options.name ?? 'Method';
  const level = options.level ?? 'info';
  const logFn = level === 'warn' ? console.warn : level === 'error' ? console.error : console.info;
  return function logWrapper(this: This, ...args: Args): Return {
    logFn.call(console, `[${loggerName}] ${methodName}`, ...args);
    return value.apply(this, args);
  };
}
