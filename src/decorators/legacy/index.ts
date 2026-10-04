import { MetadataKeys } from '../../core/metadata-keys.js';
import {
  defineClassDecorator,
  defineFieldDecorator,
  defineMethodDecorator,
  defineParameterDecorator,
} from '../../legacy/decorate.js';
import { legacyBackend } from '../../legacy/backend.js';
import {
  codegenClassMarkerLegacy,
  factoryClassLegacy,
  createFromFactory,
  getFactoryRegistry,
  registerFactory,
} from '../shared/factory.js';
import {
  memoizeMethodLegacy,
  nonNullFieldLegacy,
  nonNullParameterLegacy,
  prototypeClassLegacy,
  singletonClassLegacy,
} from '../shared/index.js';
import type { MemoizeOptions } from '../shared/memoize.js';
import type { AccessorsOptions } from '../shared/accessors.js';
import { accessorsClassLegacy } from '../shared/accessors.js';
import { builderDefaultFieldLegacy } from '../shared/builder-default.js';
import { cleanupFieldLegacy, type CleanupOptions } from '../shared/cleanup.js';
import {
  extensionMethodClassLegacy,
  type ExtensionHelper,
  type ExtensionMethodOptions,
} from '../shared/extension-method.js';
import {
  allArgsConstructorClassLegacy,
  type AllArgsConstructorOptions,
} from '../shared/all-args-constructor.js';
import { delegateFieldLegacy, parseDelegateMethods } from '../shared/delegate.js';
import { singularFieldLegacy } from '../shared/singular.js';
import { equalsClassLegacy, equalsExcludeFieldLegacy } from '../shared/equals.js';
import type { FieldDefaultsOptions } from '../shared/field-defaults.js';
import { fieldDefaultsClassLegacy } from '../shared/field-defaults.js';
import { getterFieldLegacy } from '../shared/getter.js';
import type { LogOptions } from '../shared/log.js';
import { logClassLegacy, logMethodLegacy } from '../shared/log.js';
import { setterFieldLegacy } from '../shared/setter.js';
import { utilityClassLegacy } from '../shared/utility-class.js';
import { valueClassLegacy } from '../shared/value.js';
import { withClassLegacy, withFieldLegacy } from '../shared/with.js';
import {
  getStrategyFromRegistry,
  getStrategyRegistry,
  listStrategies,
  registerStrategy,
  strategyClassLegacy,
  StrategyRegistry,
} from '../shared/strategy.js';
import type { StateOptions } from '../shared/state.js';
import { stateClassLegacy } from '../shared/state.js';
import type { TransitionOptions } from '../shared/transition.js';
import { transitionMethodLegacy } from '../shared/transition.js';
import { commandClassLegacy } from '../shared/command.js';
import { CommandHistory } from '../shared/command-history.js';
import { mementoClassLegacy, mementoExcludeFieldLegacy } from '../shared/memento.js';
import {
  observableClassLegacy,
  observableDerivedLegacy,
  observerClassLegacy,
} from '../shared/observable.js';
import {
  chainOfResponsibilityClassLegacy,
  handlerMethodLegacy,
} from '../shared/chain-of-responsibility.js';
import type { HandlerOptions } from '../shared/chain-of-responsibility.js';
import { iterableClassLegacy, iterateOverFieldLegacy } from '../shared/iterable.js';
import type { FlyweightOptions } from '../shared/flyweight.js';
import { flyweightClassLegacy } from '../shared/flyweight.js';
import type { PoolOptions } from '../shared/pool.js';
import { poolClassLegacy } from '../shared/pool.js';
import { compositeClassLegacy } from '../shared/composite.js';
import type { ProxyHooks } from '../shared/proxy.js';
import { proxyClassLegacy } from '../shared/proxy.js';
import type { AnyClass } from '../../legacy/decorate.js';
import { wrapsClassLegacy } from '../shared/wraps.js';
import type { TemplateMethodOptions } from '../shared/template-method.js';
import { templateMethodClassLegacy } from '../shared/template-method.js';
import type { HookOptions } from '../shared/hook.js';
import { hookMethodLegacy } from '../shared/hook.js';
import { abstractFactoryClassLegacy } from '../shared/abstract-factory.js';
import type { VisitorOptions } from '../shared/visitor.js';
import {
  getVisitableRegistry,
  visitableClassLegacy,
  visitorClassLegacy,
} from '../shared/visitor.js';
import type { RetryOptions } from '../shared/retry.js';
import type { DebounceOptions } from '../shared/debounce.js';
import type { TraceOptions } from '../shared/trace.js';
import {
  debounceMethodLegacy,
  retryMethodLegacy,
  synchronizedMethodLegacy,
  throttleMethodLegacy,
  traceClassLegacy,
  traceMethodLegacy,
} from '../shared/phase5-logic.js';
import type { SynchronizedOptions } from '../shared/synchronized.js';
import { deepFreezeClassLegacy } from '../shared/deep-freeze-logic.js';
import {
  validateClassLegacy,
  validateFieldLegacy,
  type ValidateOptions,
} from '../shared/validate-logic.js';
import {
  serializableAliasFieldLegacy,
  serializableClassLegacy,
  serializableExcludeFieldLegacy,
  serializableTransformFieldLegacy,
} from '../shared/serializable.js';
import {
  adapterClassLegacy,
  bridgeClassLegacy,
  facadeClassLegacy,
  interpreterClassLegacy,
  mediatorClassLegacy,
  nullObjectClassLegacy,
  type AdapterOptions,
  type FacadeOptions,
  type NullObjectOptions,
} from '../shared/markers-gof.js';

/** Validates field assignments are not null or undefined. */
export const NonNull = defineFieldDecorator(nonNullFieldLegacy);

/** Validates method parameters marked with `@NonNull`. Legacy backend only. */
export function NonNullParam(): ParameterDecorator {
  return defineParameterDecorator(nonNullParameterLegacy);
}

/** Ensures only one instance of the class exists. */
export const Singleton = defineClassDecorator(singletonClassLegacy);

/** Returns a deep clone on every `new` call. */
export const Prototype = defineClassDecorator(prototypeClassLegacy);

/** Caches method return values. Optional TTL in milliseconds. */
export function Memoize(options: MemoizeOptions = {}): MethodDecorator {
  return defineMethodDecorator((backend, target, key, descriptor) =>
    memoizeMethodLegacy(backend, target, key, descriptor, options),
  );
}

/** Registers the class in the global factory registry under `key`. */
export function Factory(key: string): ClassDecorator {
  return defineClassDecorator((backend, target) => {
    factoryClassLegacy(backend, target, key);
  });
}

/** Composite Lombok `@Data` — codegen generates getters, setters, toString, equals. */
export const Data = defineClassDecorator((backend, target) =>
  codegenClassMarkerLegacy(backend, target, MetadataKeys.DATA),
);

/** Immutable value class — codegen generates getters, with*, toString, equals. */
export const Value = defineClassDecorator((backend, target) => valueClassLegacy(backend, target));

/** Fluent builder — codegen generates a companion builder class. */
export const Builder = defineClassDecorator((backend, target) =>
  codegenClassMarkerLegacy(backend, target, MetadataKeys.BUILDER),
);

/** Auto `toString()` — codegen generates the method body. */
export const ToString = defineClassDecorator((backend, target) =>
  codegenClassMarkerLegacy(backend, target, MetadataKeys.TO_STRING),
);

/** Structural `equals()` — codegen generates instance and static helpers. */
export const Equals = defineClassDecorator((backend, target) => equalsClassLegacy(backend, target));

/** Immutable copy helpers — class or field level `with*` methods. */
const withClassDecorator = defineClassDecorator((backend, target) =>
  withClassLegacy(backend, target),
);
const withFieldDecorator = defineFieldDecorator(withFieldLegacy);

export function With(): ClassDecorator & PropertyDecorator {
  return ((target: object, propertyKey?: string | symbol) => {
    if (propertyKey === undefined) {
      return withClassDecorator(target as new (...args: unknown[]) => unknown);
    }
    return withFieldDecorator(target, propertyKey);
  }) as ClassDecorator & PropertyDecorator;
}

/** Field getter — codegen generates `getField()`. */
export const Getter = defineFieldDecorator(getterFieldLegacy);

/** Field setter — codegen generates `setField()`. */
export const Setter = defineFieldDecorator(setterFieldLegacy);

/** Logs method entry via the configured provider (default `console`). */
export function Log(options: LogOptions = {}): ClassDecorator & MethodDecorator {
  const classDec = defineClassDecorator((backend, target) =>
    logClassLegacy(backend, target, options),
  );
  const methodDec = defineMethodDecorator((backend, target, key, descriptor) =>
    logMethodLegacy(backend, target, key, descriptor, options),
  );
  return ((target: object, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => {
    if (propertyKey !== undefined && descriptor !== undefined) {
      return methodDec(target, propertyKey, descriptor);
    }
    return classDec(target as new (...args: unknown[]) => unknown);
  }) as ClassDecorator & MethodDecorator;
}

/** Fluent/chained accessor style for generated setters. */
export function Accessors(options: AccessorsOptions = {}): ClassDecorator {
  return defineClassDecorator((backend, target) => accessorsClassLegacy(backend, target, options));
}

/** Uninstantiable utility holder — constructor throws. */
export const UtilityClass = defineClassDecorator((backend, target) =>
  utilityClassLegacy(backend, target),
);

/** Default field visibility and finality for codegen. */
export function FieldDefaults(options: FieldDefaultsOptions = {}): ClassDecorator {
  return defineClassDecorator((backend, target) =>
    fieldDefaultsClassLegacy(backend, target, options),
  );
}

/** Delegates methods to a field. Pass method names as decorator arguments. */
export function Delegate(...methods: string[]): PropertyDecorator {
  return defineFieldDecorator((backend, proto, key) =>
    delegateFieldLegacy(backend, proto, key, parseDelegateMethods(methods)),
  );
}

/** Auto-close a field at `[Symbol.dispose]()`. Default method `'close'`; also usable with `using`. */
export function Cleanup(nameOrOptions: string | CleanupOptions = {}): PropertyDecorator {
  const options: CleanupOptions =
    typeof nameOrOptions === 'string' ? { method: nameOrOptions } : nameOrOptions;
  return defineFieldDecorator((backend, proto, key) =>
    cleanupFieldLegacy(backend, proto, key, options),
  );
}

/**
 * Installs each helper class's static methods as instance methods on the
 * decorated class prototype, forwarding `this` as the first argument. TS
 * equivalent of Java Lombok's `@ExtensionMethod`, scoped to the decorated
 * class (no source rewriting; no built-in prototype pollution).
 */
export function ExtensionMethod(
  helpers: readonly ExtensionHelper[],
  options: ExtensionMethodOptions = {},
): ClassDecorator {
  return defineClassDecorator((backend, target) =>
    extensionMethodClassLegacy(backend, target, helpers, options),
  );
}

/**
 * Codegen a static factory on the decorated class that constructs an instance
 * and assigns all declared fields (declaration order), the TypeScript analogue
 * of Java Lombok's `@AllArgsConstructor`. The factory is additive, so the
 * user's own constructor stays intact and `instanceof` identity is preserved
 * (honest divergence from Java: not a constructor rewrite). Default factory
 * name is `allArgs`; pass `{ staticName: 'of' }` for `Class.of(...)`.
 */
export function AllArgsConstructor(options: AllArgsConstructorOptions = {}): ClassDecorator {
  return defineClassDecorator((backend, target) =>
    allArgsConstructorClassLegacy(backend, target, options),
  );
}

/** Exclude a field from generated `equals()`. */
export const EqualsExclude = defineFieldDecorator(equalsExcludeFieldLegacy);

/** Keep a field's initializer as the `@Builder` default when the builder omits it. */
export const BuilderDefault = defineFieldDecorator(builderDefaultFieldLegacy);

/** Generate add-one / add-all / clear `@Builder` methods for an array field. */
export function Singular(name?: string): PropertyDecorator {
  return defineFieldDecorator((backend, proto, key) =>
    singularFieldLegacy(backend, proto, key, name),
  );
}

/** Registers a swappable strategy under `family` and `name`. */
export function Strategy(family: string, name: string): ClassDecorator {
  return defineClassDecorator((backend, target) => {
    strategyClassLegacy(backend, target, family, name);
  });
}

/** Finite state machine with `@Transition`-guarded methods. */
export function State(options: StateOptions): ClassDecorator {
  return defineClassDecorator((backend, target) => stateClassLegacy(backend, target, options));
}

/** Declares an allowed state transition on a method. */
export function Transition(options: TransitionOptions): MethodDecorator {
  return defineMethodDecorator((backend, target, key, descriptor) =>
    transitionMethodLegacy(backend, target, key, descriptor, options),
  );
}

/** Command object marker — class must define `execute()`. */
export const Command = defineClassDecorator(commandClassLegacy);

/** Reactive property changes with a subscription API. */
export const Observable = defineClassDecorator(observableClassLegacy) as ClassDecorator & {
  Derived: PropertyDecorator;
};

Observable.Derived = ((
  target: object,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
): void => {
  if (descriptor === undefined || typeof descriptor.get !== 'function') {
    throw new TypeError('@Observable.Derived requires a getter');
  }
  observableDerivedLegacy(legacyBackend, target, propertyKey, descriptor);
}) as PropertyDecorator;

/** Alias for `@Observable` (GoF naming). */
export const Observer = defineClassDecorator(observerClassLegacy);

/** Snapshot and restore instance state. */
export const Memento = defineClassDecorator(mementoClassLegacy) as ClassDecorator & {
  Exclude: PropertyDecorator;
};

Memento.Exclude = defineFieldDecorator(mementoExcludeFieldLegacy);

/** Chain-of-responsibility handler dispatch via `handle()`. */
export const ChainOfResponsibility = defineClassDecorator(chainOfResponsibilityClassLegacy);

/** Marks a method as a chain handler with sort `order`. */
export function Handler(options: HandlerOptions): MethodDecorator {
  return defineMethodDecorator((backend, target, key, descriptor) =>
    handlerMethodLegacy(backend, target, key, descriptor, options),
  );
}

/** Auto-implements `Symbol.iterator` over an `@IterateOver` field. */
export const Iterable = defineClassDecorator(iterableClassLegacy);

/** Marks the collection field iterated by `@Iterable`. */
export const IterateOver = defineFieldDecorator(iterateOverFieldLegacy);

/** Shared instance pool keyed by constructor arguments. */
export function Flyweight(options: FlyweightOptions): ClassDecorator {
  return defineClassDecorator((backend, target) => flyweightClassLegacy(backend, target, options));
}

/** Object pool with `Class.acquire()` / `Class.release(x)` statics. */
export function Pool<T>(options: PoolOptions<T>): ClassDecorator {
  return defineClassDecorator((backend, target) =>
    poolClassLegacy(backend, target, options as PoolOptions),
  );
}

/** Tree composite API — add, remove, traverse children. */
export const Composite = defineClassDecorator(compositeClassLegacy);

/** Runtime method interception via Proxy. */
export function Proxy(hooks: ProxyHooks = {}): ClassDecorator {
  return defineClassDecorator((backend, target) => proxyClassLegacy(backend, target, hooks));
}

/**
 * GoF Decorator — wraps an inner instance as `protected inner`.
 * @see GoF Decorator Pattern (ADR-15)
 */
export function Wraps(InnerClass: AnyClass): ClassDecorator {
  return defineClassDecorator((backend, target) => wrapsClassLegacy(backend, target, InnerClass));
}

/** Codegen template method with ordered `@Hook` steps. */
export function TemplateMethod(options: TemplateMethodOptions): ClassDecorator {
  return defineClassDecorator((backend, target) =>
    templateMethodClassLegacy(backend, target, options),
  );
}

/** Marks a method as a template hook step. */
export function Hook(options?: Partial<HookOptions>): MethodDecorator {
  return defineMethodDecorator((backend, target, key) => {
    const name = options?.name ?? String(key);
    hookMethodLegacy(backend, target, key, { name });
  });
}

/** Helper scaffold — codegen emits abstract product factory methods. */
export function AbstractFactory(products: string[]): ClassDecorator {
  return defineClassDecorator((backend, target) =>
    abstractFactoryClassLegacy(backend, target, products),
  );
}

/** Double-dispatch visitor — calls `visit{ClassName}` on the visitor. */
export function Visitor(options: VisitorOptions): ClassDecorator {
  return defineClassDecorator((backend, target) => visitorClassLegacy(backend, target, options));
}

/** Registers a node type for visitor dispatch. */
export const Visitable = defineClassDecorator(visitableClassLegacy);

/** Retries async methods on failure. */
export function Retry(options: RetryOptions = {}): MethodDecorator {
  return defineMethodDecorator((backend, target, key, descriptor) =>
    retryMethodLegacy(backend, target, key, descriptor, options),
  );
}

/** Async mutex: overlapping calls queue FIFO. Instance methods share `'$lock'` by default. */
export function Synchronized(nameOrOptions: string | SynchronizedOptions = {}): MethodDecorator {
  const options = typeof nameOrOptions === 'string' ? { name: nameOrOptions } : nameOrOptions;
  return defineMethodDecorator((backend, target, key, descriptor) =>
    synchronizedMethodLegacy(backend, target, key, descriptor, options),
  );
}

/** Debounces method calls until invocations pause. */
export function Debounce(waitMs: number, options: DebounceOptions = {}): MethodDecorator {
  return defineMethodDecorator((backend, target, key, descriptor) =>
    debounceMethodLegacy(backend, target, key, descriptor, waitMs, options),
  );
}

/** Throttles method calls to once per interval. */
export function Throttle(intervalMs: number): MethodDecorator {
  return defineMethodDecorator((backend, target, key, descriptor) =>
    throttleMethodLegacy(backend, target, key, descriptor, intervalMs),
  );
}

/** Logs method entry, exit, timing, and arguments. */
export function Trace(options: TraceOptions = {}): ClassDecorator & MethodDecorator {
  const classDec = defineClassDecorator((backend, target) =>
    traceClassLegacy(backend, target, options),
  );
  const methodDec = defineMethodDecorator((backend, target, key, descriptor) =>
    traceMethodLegacy(backend, target, key, descriptor, options),
  );
  return ((target: object, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => {
    if (propertyKey !== undefined && descriptor !== undefined) {
      return methodDec(target, propertyKey, descriptor);
    }
    return classDec(target as new (...args: unknown[]) => unknown);
  }) as ClassDecorator & MethodDecorator;
}

/** Recursively freezes instances at construction. */
export const DeepFreeze = defineClassDecorator(deepFreezeClassLegacy);

/** Schema validation on fields or the whole class. */
export function Validate(
  schema: unknown,
  options?: ValidateOptions,
): ClassDecorator & PropertyDecorator {
  const classDec = defineClassDecorator((backend, target) =>
    validateClassLegacy(backend, target, schema, options),
  );
  const fieldDec = defineFieldDecorator((backend, target, key) =>
    validateFieldLegacy(backend, target, key, schema, options),
  );
  return ((target: object, propertyKey?: string | symbol) => {
    if (propertyKey === undefined) {
      return classDec(target as new (...args: unknown[]) => unknown);
    }
    return fieldDec(target, propertyKey);
  }) as ClassDecorator & PropertyDecorator;
}

const serializableClassDec = defineClassDecorator(serializableClassLegacy);
const serializableExcludeDec = defineFieldDecorator(serializableExcludeFieldLegacy);

export function SerializableAlias(alias: string): PropertyDecorator {
  return defineFieldDecorator((backend, target, key) =>
    serializableAliasFieldLegacy(backend, target, key, alias),
  );
}

export function SerializableTransform(
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports -- tsup DTS rollup requires import() type here
  transform: import('../shared/serializable.js').SerializableTransform,
): PropertyDecorator {
  return defineFieldDecorator((backend, target, key) =>
    serializableTransformFieldLegacy(backend, target, key, transform),
  );
}

/** JSON serialization helpers — codegen emits `toJSON` / `fromJSON`. */
export const Serializable = Object.assign(serializableClassDec, {
  Exclude: serializableExcludeDec,
  Alias: SerializableAlias,
  Transform: SerializableTransform,
});

/** Marker-only — documents an adapter between two APIs (not `ValidatorAdapter`). */
export function Adapter(options: AdapterOptions): ClassDecorator {
  return defineClassDecorator((backend, target) => adapterClassLegacy(backend, target, options));
}

/** Marker-only — documents abstraction/implementation separation (Bridge pattern). */
export const Bridge = defineClassDecorator(bridgeClassLegacy);

/** Marker-only — documents a simplified facade over subsystems. */
export function Facade(options: FacadeOptions = {}): ClassDecorator {
  return defineClassDecorator((backend, target) => facadeClassLegacy(backend, target, options));
}

/** Marker-only — documents a mediator coordination role. */
export const Mediator = defineClassDecorator(mediatorClassLegacy);

/** Marker-only — documents an interpreter / DSL grammar role. */
export const Interpreter = defineClassDecorator(interpreterClassLegacy);

/** Marker + type-aid — documents a null implementation of `options.of` (Null Object). */
export function NullObject(options: NullObjectOptions): ClassDecorator {
  return defineClassDecorator((backend, target) => nullObjectClassLegacy(backend, target, options));
}

export {
  createFromFactory,
  getFactoryRegistry,
  registerFactory,
  StrategyRegistry,
  getStrategyFromRegistry,
  getStrategyRegistry,
  listStrategies,
  registerStrategy,
  CommandHistory,
  getVisitableRegistry,
};
