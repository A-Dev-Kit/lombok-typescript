/**
 * Stage 3 decorator backend, for the modern ECMAScript decorator standard
 * (TS 5.0+, with `experimentalDecorators` set to false or unset).
 *
 * No `reflect-metadata` here. Each decorator's `context.metadata` holds
 * per-class storage, accessible at runtime as `MyClass[Symbol.metadata]`.
 *
 * Stage 3 has no parameter decorators. Reach for the legacy backend if you
 * need them.
 *
 * @example
 * import { defineClassDecorator } from 'lombok-typescript/stage3';
 *
 * const Tracked = defineClassDecorator((backend, _value, context) => {
 *   backend.metadata.set('tracked', context.metadata as object, undefined, true);
 * });
 */

export { Stage3Backend, stage3Backend } from './backend.js';
export {
  defineClassDecorator,
  defineFieldDecorator,
  defineMethodDecorator,
  defineGetterDecorator,
  defineSetterDecorator,
} from './decorate.js';
export type {
  Stage3ClassLogic,
  Stage3FieldLogic,
  Stage3MethodLogic,
  Stage3GetterLogic,
  Stage3SetterLogic,
} from './decorate.js';
export {
  NonNull,
  Singleton,
  Prototype,
  Memoize,
  Factory,
  Data,
  Value,
  Builder,
  ToString,
  Equals,
  With,
  Getter,
  Setter,
  Log,
  Accessors,
  UtilityClass,
  FieldDefaults,
  Delegate,
  EqualsExclude,
  createFromFactory,
  getFactoryRegistry,
  registerFactory,
  Strategy,
  StrategyRegistry,
  getStrategyFromRegistry,
  getStrategyRegistry,
  listStrategies,
  registerStrategy,
  State,
  Transition,
  Command,
  CommandHistory,
  Observable,
  Observer,
  Memento,
  ChainOfResponsibility,
  Handler,
  Iterable,
  IterateOver,
} from '../decorators/stage3/index.js';

/** Read the Stage 3 `Symbol.metadata` object from a class, if present. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getClassMetadata(cls: new (...args: any[]) => any): object | undefined {
  return (cls as { [Symbol.metadata]?: object })[Symbol.metadata];
}
