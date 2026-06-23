import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { PropertyName } from '../../core/types.js';
import type { AnyClass } from '../../legacy/decorate.js';
import { debounceMethod, type DebounceOptions } from './debounce.js';
import { retryMethod, type RetryOptions } from './retry.js';
import { throttleMethod } from './throttle.js';
import { traceClassMethods, traceMethod, type TraceOptions } from './trace.js';

export function retryMethodLegacy(
  backend: Backend,
  targetPrototype: object,
  propertyKey: PropertyName,
  descriptor: PropertyDescriptor,
  options: RetryOptions = {},
): PropertyDescriptor | void {
  backend.metadata.set(MetadataKeys.RETRY, targetPrototype, propertyKey, options);
  const original = descriptor.value;
  if (typeof original !== 'function') return;
  return { ...descriptor, value: retryMethod(original as (...args: unknown[]) => Promise<unknown>, options) };
}

export function retryMethodStage3<This, Args extends unknown[], Return>(
  backend: Backend,
  value: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
  options: RetryOptions = {},
): (this: This, ...args: Args) => Return {
  backend.metadata.set(MetadataKeys.RETRY, context.metadata as object, context.name, options);
  return retryMethod(value as unknown as (...args: unknown[]) => Promise<unknown>, options) as unknown as (
    this: This,
    ...args: Args
  ) => Return;
}

export function debounceMethodLegacy(
  backend: Backend,
  targetPrototype: object,
  propertyKey: PropertyName,
  descriptor: PropertyDescriptor,
  waitMs: number,
  options: DebounceOptions = {},
): PropertyDescriptor | void {
  backend.metadata.set(MetadataKeys.DEBOUNCE, targetPrototype, propertyKey, { waitMs, ...options });
  const original = descriptor.value;
  if (typeof original !== 'function') return;
  return {
    ...descriptor,
    value: debounceMethod(original as (...args: unknown[]) => unknown, waitMs, options),
  };
}

export function debounceMethodStage3<This, Args extends unknown[], Return>(
  backend: Backend,
  value: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
  waitMs: number,
  options: DebounceOptions = {},
): (this: This, ...args: Args) => Return {
  backend.metadata.set(MetadataKeys.DEBOUNCE, context.metadata as object, context.name, {
    waitMs,
    ...options,
  });
  return debounceMethod(value as (...args: unknown[]) => unknown, waitMs, options) as unknown as (
    this: This,
    ...args: Args
  ) => Return;
}

export function throttleMethodLegacy(
  backend: Backend,
  targetPrototype: object,
  propertyKey: PropertyName,
  descriptor: PropertyDescriptor,
  intervalMs: number,
): PropertyDescriptor | void {
  backend.metadata.set(MetadataKeys.THROTTLE, targetPrototype, propertyKey, { intervalMs });
  const original = descriptor.value;
  if (typeof original !== 'function') return;
  return {
    ...descriptor,
    value: throttleMethod(original as (...args: unknown[]) => unknown, intervalMs),
  };
}

export function throttleMethodStage3<This, Args extends unknown[], Return>(
  backend: Backend,
  value: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
  intervalMs: number,
): (this: This, ...args: Args) => Return {
  backend.metadata.set(MetadataKeys.THROTTLE, context.metadata as object, context.name, { intervalMs });
  return throttleMethod(value as (...args: unknown[]) => unknown, intervalMs) as unknown as (
    this: This,
    ...args: Args
  ) => Return;
}

export function traceClassLegacy(backend: Backend, target: AnyClass, options: TraceOptions = {}): void {
  backend.metadata.set(MetadataKeys.TRACE, target, undefined, options);
  traceClassMethods(target, options);
}

export function traceClassStage3(
  backend: Backend,
  value: AnyClass,
  context: ClassDecoratorContext,
  options: TraceOptions = {},
): void {
  backend.metadata.set(MetadataKeys.TRACE, context.metadata as object, undefined, options);
  traceClassMethods(value, options);
}

export function traceMethodLegacy(
  backend: Backend,
  targetPrototype: object,
  propertyKey: PropertyName,
  descriptor: PropertyDescriptor,
  options: TraceOptions = {},
): PropertyDescriptor | void {
  backend.metadata.set(MetadataKeys.TRACE, targetPrototype, propertyKey, options);
  const original = descriptor.value;
  if (typeof original !== 'function') return;
  const contextName = `${options.name ?? 'Method'}.${String(propertyKey)}`;
  return {
    ...descriptor,
    value: traceMethod(original as (...args: unknown[]) => unknown, options, contextName),
  };
}

export function traceMethodStage3<This, Args extends unknown[], Return>(
  backend: Backend,
  value: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
  options: TraceOptions = {},
): (this: This, ...args: Args) => Return {
  backend.metadata.set(MetadataKeys.TRACE, context.metadata as object, context.name, options);
  const contextName = `${options.name ?? 'Method'}.${String(context.name)}`;
  return traceMethod(value as (...args: unknown[]) => unknown, options, contextName) as (
    this: This,
    ...args: Args
  ) => Return;
}
