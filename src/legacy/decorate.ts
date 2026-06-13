import type { Backend } from '../core/backend.js';
import type { PropertyName } from '../core/types.js';
import { legacyBackend } from './backend.js';

/** A class constructor, used in place of bare `Function` in decorator signatures. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyClass = new (...args: any[]) => any;

/** Logic shapes for legacy decorator authoring. */
export interface ClassDecoratorLogic {
  (backend: Backend, target: AnyClass): AnyClass | void;
}

export interface FieldDecoratorLogic {
  (backend: Backend, targetPrototype: object, propertyKey: PropertyName): void;
}

export interface MethodDecoratorLogic<T = unknown> {
  (
    backend: Backend,
    targetPrototype: object,
    propertyKey: PropertyName,
    descriptor: TypedPropertyDescriptor<T>,
  ): TypedPropertyDescriptor<T> | void;
}

export interface ParameterDecoratorLogic {
  (
    backend: Backend,
    targetPrototype: object,
    propertyKey: PropertyName | undefined,
    parameterIndex: number,
  ): void;
}

/**
 * Build a class decorator with the legacy signature. The constructor comes in
 * as `target`; an optional replacement constructor can be returned.
 *
 * @example
 * const Tracked = defineClassDecorator((backend, target) => {
 *   backend.metadata.set('tracked', target, undefined, true);
 * });
 */
export function defineClassDecorator(logic: ClassDecoratorLogic): ClassDecorator {
  return ((target: AnyClass) => logic(legacyBackend, target)) as ClassDecorator;
}

/**
 * Build a field/property decorator with the legacy signature. Field decorators
 * can't return a replacement value here; use a method decorator or the codegen
 * path for that.
 */
export function defineFieldDecorator(logic: FieldDecoratorLogic): PropertyDecorator {
  return ((target: object, propertyKey: string | symbol) => {
    logic(legacyBackend, target, propertyKey);
  }) as PropertyDecorator;
}

/** Build a method decorator with the legacy signature. */
export function defineMethodDecorator<T = unknown>(
  logic: MethodDecoratorLogic<T>,
): MethodDecorator {
  return ((
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ) => {
    return logic(legacyBackend, target, propertyKey, descriptor);
  }) as MethodDecorator;
}

/** Build a parameter decorator with the legacy signature. */
export function defineParameterDecorator(logic: ParameterDecoratorLogic): ParameterDecorator {
  return ((target: object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    logic(legacyBackend, target, propertyKey, parameterIndex);
  }) as ParameterDecorator;
}
