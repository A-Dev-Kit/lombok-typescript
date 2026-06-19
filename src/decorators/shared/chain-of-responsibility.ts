import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { AnyClass } from '../../legacy/decorate.js';
import type { PropertyName } from '../../core/types.js';

export interface HandlerOptions {
  order: number;
}

interface HandlerEntry {
  order: number;
  method: string;
  fn: (context: unknown) => unknown;
}

function collectHandlers(backend: Backend, proto: object, classMetadata?: object): HandlerEntry[] {
  const handlers: HandlerEntry[] = [];

  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key === 'constructor') continue;
    const options =
      backend.metadata.get<HandlerOptions>(MetadataKeys.HANDLER, proto, key) ??
      (classMetadata
        ? backend.metadata.get<HandlerOptions>(MetadataKeys.HANDLER, classMetadata, key)
        : undefined);
    if (!options) continue;
    const desc = Object.getOwnPropertyDescriptor(proto, key);
    if (!desc || typeof desc.value !== 'function') continue;
    handlers.push({
      order: options.order,
      method: key,
      fn: desc.value as (context: unknown) => unknown,
    });
  }

  handlers.sort((a, b) => a.order - b.order);
  return handlers;
}

function wrapChainClass(backend: Backend, target: AnyClass, classMetadata?: object): AnyClass {
  const handlers = collectHandlers(backend, target.prototype as object, classMetadata);

  const ChainClass = class extends target {
    handle(context: unknown): boolean {
      for (const handler of handlers) {
        const result = handler.fn.call(this, context);
        if (result === true || (result !== undefined && result !== false)) {
          return true;
        }
      }
      return false;
    }
  };

  return ChainClass as AnyClass;
}

export function chainOfResponsibilityClassLegacy(backend: Backend, target: AnyClass): AnyClass {
  backend.metadata.set(MetadataKeys.CHAIN_OF_RESPONSIBILITY, target, undefined, true);
  return wrapChainClass(backend, target);
}

export function chainOfResponsibilityClassStage3(
  backend: Backend,
  value: AnyClass,
  context: ClassDecoratorContext,
): AnyClass {
  backend.metadata.set(
    MetadataKeys.CHAIN_OF_RESPONSIBILITY,
    context.metadata as object,
    undefined,
    true,
  );
  return wrapChainClass(backend, value, context.metadata as object);
}

export function handlerMethodLegacy(
  backend: Backend,
  targetPrototype: object,
  propertyKey: PropertyName,
  descriptor: PropertyDescriptor,
  options: HandlerOptions,
): PropertyDescriptor | void {
  backend.metadata.set(MetadataKeys.HANDLER, targetPrototype, propertyKey, options);
  return descriptor;
}

export function handlerMethodStage3<This, Args extends unknown[], Return>(
  backend: Backend,
  value: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
  options: HandlerOptions,
): (this: This, ...args: Args) => Return {
  backend.metadata.set(MetadataKeys.HANDLER, context.metadata as object, context.name, options);
  return value;
}
