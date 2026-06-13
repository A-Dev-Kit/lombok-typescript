import type { Backend } from '../core/backend.js';
import type { AnyClass } from '../legacy/decorate.js';
import { stage3Backend } from './backend.js';

/**
 * Logic shapes for Stage 3 decorator authoring.
 *
 * Stage 3 contexts are richer than legacy: `context.metadata` holds per-class
 * storage, `context.addInitializer(fn)` hooks into instance construction, and
 * `context.access` exposes get/set helpers. Logic functions get the full
 * context so they can use any of it.
 */
export type Stage3ClassLogic = (
  backend: Backend,
  value: AnyClass,
  context: ClassDecoratorContext,
) => AnyClass | void;

export type Stage3FieldLogic<This = unknown, Value = unknown> = (
  backend: Backend,
  context: ClassFieldDecoratorContext<This, Value>,
) => ((this: This, initialValue: Value) => Value) | void;

export type Stage3MethodLogic<
  This = unknown,
  Args extends unknown[] = unknown[],
  Return = unknown,
> = (
  backend: Backend,
  value: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
) => ((this: This, ...args: Args) => Return) | void;

export type Stage3GetterLogic<This = unknown, Value = unknown> = (
  backend: Backend,
  value: (this: This) => Value,
  context: ClassGetterDecoratorContext<This, Value>,
) => ((this: This) => Value) | void;

export type Stage3SetterLogic<This = unknown, Value = unknown> = (
  backend: Backend,
  value: (this: This, v: Value) => void,
  context: ClassSetterDecoratorContext<This, Value>,
) => ((this: This, v: Value) => void) | void;

/**
 * Build a Stage 3 class decorator.
 *
 * @example
 * const Tracked = defineClassDecorator((backend, _value, context) => {
 *   backend.metadata.set('tracked', context.metadata as object, undefined, true);
 * });
 */
export function defineClassDecorator(
  logic: Stage3ClassLogic,
): <T extends AnyClass>(value: T, context: ClassDecoratorContext) => T | void {
  return function decorator<T extends AnyClass>(
    value: T,
    context: ClassDecoratorContext,
  ): T | void {
    return logic(stage3Backend, value, context) as T | void;
  };
}

/**
 * Build a Stage 3 field decorator. The logic can return an initializer
 * transformer that receives the field's initial value and returns the value
 * to store. Returning `void` leaves the initializer alone.
 */
export function defineFieldDecorator<This = unknown, Value = unknown>(
  logic: Stage3FieldLogic<This, Value>,
) {
  return function decorator(
    _value: undefined,
    context: ClassFieldDecoratorContext<This, Value>,
  ): ((this: This, initialValue: Value) => Value) | void {
    return logic(stage3Backend, context);
  };
}

/** Build a Stage 3 method decorator. The logic may return a wrapping function. */
export function defineMethodDecorator<
  This = unknown,
  Args extends unknown[] = unknown[],
  Return = unknown,
>(logic: Stage3MethodLogic<This, Args, Return>) {
  return function decorator(
    value: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
  ): ((this: This, ...args: Args) => Return) | void {
    return logic(stage3Backend, value, context);
  };
}

/** Build a Stage 3 getter decorator. */
export function defineGetterDecorator<This = unknown, Value = unknown>(
  logic: Stage3GetterLogic<This, Value>,
) {
  return function decorator(
    value: (this: This) => Value,
    context: ClassGetterDecoratorContext<This, Value>,
  ): ((this: This) => Value) | void {
    return logic(stage3Backend, value, context);
  };
}

/** Build a Stage 3 setter decorator. */
export function defineSetterDecorator<This = unknown, Value = unknown>(
  logic: Stage3SetterLogic<This, Value>,
) {
  return function decorator(
    value: (this: This, v: Value) => void,
    context: ClassSetterDecoratorContext<This, Value>,
  ): ((this: This, v: Value) => void) | void {
    return logic(stage3Backend, value, context);
  };
}
