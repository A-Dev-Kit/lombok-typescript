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
  Cleanup,
  ExtensionMethod,
  AllArgsConstructor,
  NoArgsConstructor,
  EqualsExclude,
  BuilderDefault,
  Singular,
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
  Pool,
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
  Synchronized,
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
  NullObject,
} from '../decorators/legacy/index.js';
export type {
  AdapterOptions,
  FacadeOptions,
  NullObjectOptions,
} from '../decorators/shared/markers-gof.js';
export { getGoFMarkerMetadata } from '../decorators/shared/markers-gof.js';
export type { PoolOptions, Pooled } from '../decorators/shared/pool.js';
export { PoolExhaustedError } from '../decorators/shared/pool.js';
export type { SynchronizedOptions } from '../decorators/shared/synchronized.js';
export { SynchronizedTimeoutError } from '../decorators/shared/synchronized.js';
export type { CleanupOptions } from '../decorators/shared/cleanup.js';
export type {
  ExtensionHelper,
  ExtensionConflictPolicy,
  ExtensionMethodOptions,
} from '../decorators/shared/extension-method.js';
export type {
  AllArgsConstructorOptions,
  AllArgsConstructorAccess,
} from '../decorators/shared/all-args-constructor.js';
export type {
  NoArgsConstructorOptions,
  NoArgsConstructorAccess,
} from '../decorators/shared/no-args-constructor.js';
