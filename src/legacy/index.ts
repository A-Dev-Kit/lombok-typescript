/**
 * Legacy decorator backend, for `experimentalDecorators: true`. Used by NestJS,
 * TypeORM, class-validator, and most existing decorator-based libraries.
 *
 * @example
 * import { defineClassDecorator } from 'lombok-typescript/legacy';
 *
 * const Tracked = defineClassDecorator((backend, target) => {
 *   backend.metadata.set('tracked', target, undefined, true);
 * });
 */

export { LegacyBackend, legacyBackend } from './backend.js';
export {
  defineClassDecorator,
  defineFieldDecorator,
  defineMethodDecorator,
  defineParameterDecorator,
} from './decorate.js';
export type {
  ClassDecoratorLogic,
  FieldDecoratorLogic,
  MethodDecoratorLogic,
  ParameterDecoratorLogic,
} from './decorate.js';
export {
  NonNull,
  NonNullParam,
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
  Flyweight,
  Composite,
  Proxy,
  Wraps,
  TemplateMethod,
  Hook,
  AbstractFactory,
  Visitor,
  Visitable,
  getVisitableRegistry,
  Retry,
  Debounce,
  Throttle,
  Trace,
  DeepFreeze,
  Validate,
  Serializable,
  SerializableAlias,
  SerializableTransform,
  Adapter,
  Bridge,
  Facade,
  Mediator,
  Interpreter,
} from '../decorators/legacy/index.js';
export type { AdapterOptions, FacadeOptions } from '../decorators/shared/markers-gof.js';
export { getGoFMarkerMetadata } from '../decorators/shared/markers-gof.js';
