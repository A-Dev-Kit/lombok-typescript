import { Logger } from '@nestjs/common';
import { defineClassDecorator, defineMethodDecorator } from '@a-dev-kit/lombok-typescript/legacy';
import type { PropertyName } from '@a-dev-kit/lombok-typescript/core';

export interface LogNestOptions {
  /** Logger context. Defaults to the class name. */
  context?: string;
}

function nestLogLevel(
  logger: Logger,
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  ...optionalParams: unknown[]
): void {
  switch (level) {
    case 'debug':
      logger.debug(message, ...optionalParams);
      break;
    case 'warn':
      logger.warn(message, ...optionalParams);
      break;
    case 'error':
      logger.error(message, ...optionalParams);
      break;
    default:
      logger.log(message, ...optionalParams);
  }
}

function wrapClassWithNestLogger(
  target: new (...args: unknown[]) => unknown,
  options: LogNestOptions = {},
): void {
  const logger = new Logger(options.context ?? target.name);
  const proto = target.prototype as Record<string, unknown>;

  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key === 'constructor') continue;
    const desc = Object.getOwnPropertyDescriptor(proto, key);
    if (!desc || typeof desc.value !== 'function') continue;
    const original = desc.value as (...args: unknown[]) => unknown;
    desc.value = function logNestWrapper(this: unknown, ...args: unknown[]) {
      nestLogLevel(logger, 'info', `${key}()`, ...args);
      return original.apply(this, args);
    };
    Object.defineProperty(proto, key, desc);
  }
}

function wrapMethodWithNestLogger(
  targetPrototype: object,
  propertyKey: PropertyName,
  descriptor: PropertyDescriptor,
  options: LogNestOptions = {},
): PropertyDescriptor {
  const original = descriptor.value;
  if (typeof original !== 'function') return descriptor;
  const className =
    (targetPrototype as { constructor?: { name?: string } }).constructor?.name ?? 'Method';
  const logger = new Logger(options.context ?? className);
  const methodName = String(propertyKey);
  return {
    ...descriptor,
    value: function logNestWrapper(this: unknown, ...args: unknown[]) {
      nestLogLevel(logger, 'info', `${methodName}()`, ...args);
      return (original as (...a: unknown[]) => unknown).apply(this, args);
    },
  };
}

/** `@Log` adapter using NestJS built-in `Logger` (ADR-09 BYOL). */
export function LogNest(options: LogNestOptions = {}): ClassDecorator & MethodDecorator {
  const classDec = defineClassDecorator((backend, target) => {
    backend.metadata.set('log:nest', target, undefined, options);
    wrapClassWithNestLogger(target, options);
  });
  const methodDec = defineMethodDecorator((backend, target, key, descriptor) => {
    backend.metadata.set('log:nest', target, key, options);
    return wrapMethodWithNestLogger(target, key, descriptor, options);
  });
  return ((target: object, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => {
    if (propertyKey !== undefined && descriptor !== undefined) {
      return methodDec(target, propertyKey, descriptor);
    }
    return classDec(target as new (...args: unknown[]) => unknown);
  }) as ClassDecorator & MethodDecorator;
}
