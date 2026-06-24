import { MetadataKeys } from '../../core/metadata-keys.js';
import {
  defineClassDecorator,
  defineFieldDecorator,
  defineMethodDecorator,
  defineGetterDecorator,
} from '../../stage3/decorate.js';
import {
  codegenClassMarkerStage3,
  factoryClassStage3,
  createFromFactory,
  getFactoryRegistry,
  registerFactory,
} from '../shared/factory.js';
import {
  memoizeMethodStage3,
  nonNullFieldStage3,
  prototypeClassStage3,
  singletonClassStage3,
} from '../shared/index.js';
import type { MemoizeOptions } from '../shared/memoize.js';
import type { AccessorsOptions } from '../shared/accessors.js';
import { accessorsClassStage3 } from '../shared/accessors.js';
import { delegateFieldStage3, parseDelegateMethods } from '../shared/delegate.js';
import { equalsClassStage3, equalsExcludeFieldStage3 } from '../shared/equals.js';
import type { FieldDefaultsOptions } from '../shared/field-defaults.js';
import { fieldDefaultsClassStage3 } from '../shared/field-defaults.js';
import { getterFieldStage3 } from '../shared/getter.js';
import type { LogOptions } from '../shared/log.js';
import { logClassStage3, logMethodStage3 } from '../shared/log.js';
import { setterFieldStage3 } from '../shared/setter.js';
import { utilityClassStage3 } from '../shared/utility-class.js';
import { valueClassStage3 } from '../shared/value.js';
import { withClassStage3, withFieldStage3 } from '../shared/with.js';
import {
  getStrategyFromRegistry,
  getStrategyRegistry,
  listStrategies,
  registerStrategy,
  strategyClassStage3,
  StrategyRegistry,
} from '../shared/strategy.js';
import type { StateOptions } from '../shared/state.js';
import { stateClassStage3 } from '../shared/state.js';
import type { TransitionOptions } from '../shared/transition.js';
import { transitionMethodStage3 } from '../shared/transition.js';
import { commandClassStage3 } from '../shared/command.js';
import { CommandHistory } from '../shared/command-history.js';
import { mementoClassStage3, mementoExcludeFieldStage3 } from '../shared/memento.js';
import {
  observableClassStage3,
  observableDerivedStage3,
  observerClassStage3,
} from '../shared/observable.js';
import {
  chainOfResponsibilityClassStage3,
  handlerMethodStage3,
} from '../shared/chain-of-responsibility.js';
import type { HandlerOptions } from '../shared/chain-of-responsibility.js';
import { iterableClassStage3, iterateOverFieldStage3 } from '../shared/iterable.js';
import type { FlyweightOptions } from '../shared/flyweight.js';
import { flyweightClassStage3 } from '../shared/flyweight.js';
import { compositeClassStage3 } from '../shared/composite.js';
import type { ProxyHooks } from '../shared/proxy.js';
import { proxyClassStage3 } from '../shared/proxy.js';
import type { AnyClass } from '../../legacy/decorate.js';
import { wrapsClassStage3 } from '../shared/wraps.js';
import type { TemplateMethodOptions } from '../shared/template-method.js';
import { templateMethodClassStage3 } from '../shared/template-method.js';
import type { HookOptions } from '../shared/hook.js';
import { hookMethodStage3 } from '../shared/hook.js';
import { abstractFactoryClassStage3 } from '../shared/abstract-factory.js';
import type { VisitorOptions } from '../shared/visitor.js';
import {
  getVisitableRegistry,
  visitableClassStage3,
  visitorClassStage3,
} from '../shared/visitor.js';
import type { RetryOptions } from '../shared/retry.js';
import type { DebounceOptions } from '../shared/debounce.js';
import type { TraceOptions } from '../shared/trace.js';
import {
  debounceMethodStage3,
  retryMethodStage3,
  throttleMethodStage3,
  traceClassStage3,
  traceMethodStage3,
} from '../shared/phase5-logic.js';
import { deepFreezeClassStage3 } from '../shared/deep-freeze-logic.js';
import {
  validateClassStage3,
  validateFieldStage3,
  type ValidateOptions,
} from '../shared/validate-logic.js';
import {
  serializableAliasFieldStage3,
  serializableClassStage3,
  serializableExcludeFieldStage3,
  serializableTransformFieldStage3,
} from '../shared/serializable.js';
import {
  adapterClassStage3,
  bridgeClassStage3,
  facadeClassStage3,
  interpreterClassStage3,
  mediatorClassStage3,
  type AdapterOptions,
  type FacadeOptions,
} from '../shared/markers-gof.js';

/** Validates field initial values are not null or undefined. */
export const NonNull = defineFieldDecorator(nonNullFieldStage3);

/** Ensures only one instance of the class exists. */
export const Singleton = defineClassDecorator(singletonClassStage3);

/** Returns a deep clone on every `new` call. */
export const Prototype = defineClassDecorator(prototypeClassStage3);

/** Caches method return values. Optional TTL in milliseconds. */
export function Memoize(options: MemoizeOptions = {}) {
  return defineMethodDecorator((backend, value, context) =>
    memoizeMethodStage3(backend, value, context, options),
  );
}

/** Registers the class in the global factory registry under `key`. */
export function Factory(key: string) {
  return defineClassDecorator((backend, value, context) => {
    factoryClassStage3(backend, value, context, key);
  });
}

/** Composite Lombok `@Data` — codegen generates getters, setters, toString, equals. */
export const Data = defineClassDecorator((backend, value, context) =>
  codegenClassMarkerStage3(backend, value, context, MetadataKeys.DATA),
);

/** Immutable value class — codegen generates getters, with*, toString, equals. */
export const Value = defineClassDecorator((backend, value, context) =>
  valueClassStage3(backend, value, context),
);

/** Fluent builder — codegen generates a companion builder class. */
export const Builder = defineClassDecorator((backend, value, context) =>
  codegenClassMarkerStage3(backend, value, context, MetadataKeys.BUILDER),
);

/** Auto `toString()` — codegen generates the method body. */
export const ToString = defineClassDecorator((backend, value, context) =>
  codegenClassMarkerStage3(backend, value, context, MetadataKeys.TO_STRING),
);

/** Structural `equals()` — codegen generates instance and static helpers. */
export const Equals = defineClassDecorator((backend, value, context) =>
  equalsClassStage3(backend, value, context),
);

/** Immutable copy helpers — class or field level `with*` methods. */
const withClassDec = defineClassDecorator(withClassStage3);
const withFieldDec = defineFieldDecorator(withFieldStage3);

export function With() {
  return function decorator(
    value: unknown,
    context: ClassDecoratorContext | ClassFieldDecoratorContext,
  ): unknown {
    if (context.kind === 'class') {
      return withClassDec(
        value as new (...args: unknown[]) => unknown,
        context as ClassDecoratorContext,
      );
    }
    return withFieldDec(value as undefined, context as ClassFieldDecoratorContext);
  };
}

/** Field getter — codegen generates `getField()`. */
export const Getter = defineFieldDecorator(getterFieldStage3);

/** Field setter — codegen generates `setField()`. */
export const Setter = defineFieldDecorator(setterFieldStage3);

/** Logs method entry via the configured provider (default `console`). */
export function Log(options: LogOptions = {}) {
  return function decorator(
    value: unknown,
    context: ClassDecoratorContext | ClassMethodDecoratorContext,
  ): unknown {
    if (context.kind === 'class') {
      return defineClassDecorator((backend, ctor, ctx) =>
        logClassStage3(backend, ctor, ctx, options),
      )(value as new (...args: unknown[]) => unknown, context as ClassDecoratorContext);
    }
    return defineMethodDecorator((backend, method, ctx) =>
      logMethodStage3(backend, method, ctx, options),
    )(value as (...args: unknown[]) => unknown, context as ClassMethodDecoratorContext);
  };
}

/** Fluent/chained accessor style for generated setters. */
export function Accessors(options: AccessorsOptions = {}) {
  return defineClassDecorator((backend, value, context) =>
    accessorsClassStage3(backend, value, context, options),
  );
}

/** Uninstantiable utility holder — constructor throws. */
export const UtilityClass = defineClassDecorator((backend, value, context) =>
  utilityClassStage3(backend, value, context),
);

/** Default field visibility and finality for codegen. */
export function FieldDefaults(options: FieldDefaultsOptions = {}) {
  return defineClassDecorator((backend, value, context) =>
    fieldDefaultsClassStage3(backend, value, context, options),
  );
}

/** Delegates methods to a field. Pass method names as decorator arguments. */
export function Delegate(...methods: string[]) {
  return defineFieldDecorator((backend, context) =>
    delegateFieldStage3(backend, context, parseDelegateMethods(methods)),
  );
}

/** Exclude a field from generated `equals()`. */
export const EqualsExclude = defineFieldDecorator(equalsExcludeFieldStage3);

/** Registers a swappable strategy under `family` and `name`. */
export function Strategy(family: string, name: string) {
  return defineClassDecorator((backend, value, context) => {
    strategyClassStage3(backend, value, context, family, name);
  });
}

/** Finite state machine with `@Transition`-guarded methods. */
export function State(options: StateOptions) {
  return defineClassDecorator((backend, value, context) =>
    stateClassStage3(backend, value, context, options),
  );
}

/** Declares an allowed state transition on a method. */
export function Transition(options: TransitionOptions) {
  return defineMethodDecorator((backend, value, context) =>
    transitionMethodStage3(backend, value, context, options),
  );
}

/** Command object marker — class must define `execute()`. */
export const Command = defineClassDecorator(commandClassStage3);

const observableClassDec = defineClassDecorator(observableClassStage3);
const observableDerivedDec = defineGetterDecorator(observableDerivedStage3);

/** Reactive property changes with a subscription API. */
export function Observable() {
  return observableClassDec;
}
Observable.Derived = observableDerivedDec;

/** Alias for `@Observable` (GoF naming). */
export const Observer = defineClassDecorator(observerClassStage3);

const mementoClassDec = defineClassDecorator(mementoClassStage3);

/** Snapshot and restore instance state. */
export function Memento() {
  return mementoClassDec;
}
Memento.Exclude = defineFieldDecorator(mementoExcludeFieldStage3);

/** Chain-of-responsibility handler dispatch via `handle()`. */
export const ChainOfResponsibility = defineClassDecorator(chainOfResponsibilityClassStage3);

/** Marks a method as a chain handler with sort `order`. */
export function Handler(options: HandlerOptions) {
  return defineMethodDecorator((backend, value, context) =>
    handlerMethodStage3(backend, value, context, options),
  );
}

/** Auto-implements `Symbol.iterator` over an `@IterateOver` field. */
export const Iterable = defineClassDecorator(iterableClassStage3);

/** Marks the collection field iterated by `@Iterable`. */
export const IterateOver = defineFieldDecorator(iterateOverFieldStage3);

/** Shared instance pool keyed by constructor arguments. */
export function Flyweight(options: FlyweightOptions) {
  return defineClassDecorator((backend, value, context) =>
    flyweightClassStage3(backend, value, context, options),
  );
}

/** Tree composite API — add, remove, traverse children. */
export const Composite = defineClassDecorator(compositeClassStage3);

/** Runtime method interception via Proxy. */
export function Proxy(hooks: ProxyHooks = {}) {
  return defineClassDecorator((backend, value, context) =>
    proxyClassStage3(backend, value, context, hooks),
  );
}

/**
 * GoF Decorator — wraps an inner instance as `protected inner`.
 * @see GoF Decorator Pattern (ADR-15)
 */
export function Wraps(InnerClass: AnyClass) {
  return defineClassDecorator((backend, value, context) =>
    wrapsClassStage3(backend, value, context, InnerClass),
  );
}

/** Codegen template method with ordered `@Hook` steps. */
export function TemplateMethod(options: TemplateMethodOptions) {
  return defineClassDecorator((backend, value, context) =>
    templateMethodClassStage3(backend, value, context, options),
  );
}

/** Marks a method as a template hook step. */
export function Hook(options?: Partial<HookOptions>) {
  return defineMethodDecorator((backend, value, context) => {
    const name = options?.name ?? String(context.name);
    hookMethodStage3(backend, value, context, { name });
  });
}

/** Helper scaffold — codegen emits abstract product factory methods. */
export function AbstractFactory(products: string[]) {
  return defineClassDecorator((backend, value, context) =>
    abstractFactoryClassStage3(backend, value, context, products),
  );
}

/** Double-dispatch visitor — calls `visit{ClassName}` on the visitor. */
export function Visitor(options: VisitorOptions) {
  return defineClassDecorator((backend, value, context) =>
    visitorClassStage3(backend, value, context, options),
  );
}

/** Registers a node type for visitor dispatch. */
export const Visitable = defineClassDecorator(visitableClassStage3);

export function Retry(options: RetryOptions = {}) {
  return defineMethodDecorator((backend, value, context) =>
    retryMethodStage3(backend, value, context, options),
  );
}

export function Debounce(waitMs: number, options: DebounceOptions = {}) {
  return defineMethodDecorator((backend, value, context) =>
    debounceMethodStage3(backend, value, context, waitMs, options),
  );
}

export function Throttle(intervalMs: number) {
  return defineMethodDecorator((backend, value, context) =>
    throttleMethodStage3(backend, value, context, intervalMs),
  );
}

export function Trace(options: TraceOptions = {}) {
  return function decorator(
    value: unknown,
    context: ClassDecoratorContext | ClassMethodDecoratorContext,
  ): unknown {
    if (context.kind === 'class') {
      return defineClassDecorator((backend, ctor, ctx) =>
        traceClassStage3(backend, ctor, ctx, options),
      )(value as new (...args: unknown[]) => unknown, context as ClassDecoratorContext);
    }
    return defineMethodDecorator((backend, method, ctx) =>
      traceMethodStage3(backend, method, ctx, options),
    )(value as (...args: unknown[]) => unknown, context as ClassMethodDecoratorContext);
  };
}

export const DeepFreeze = defineClassDecorator(deepFreezeClassStage3);

export function Validate(schema: unknown, options?: ValidateOptions) {
  return function decorator(
    value: unknown,
    context: ClassDecoratorContext | ClassFieldDecoratorContext,
  ): unknown {
    if (context.kind === 'class') {
      return defineClassDecorator((backend, ctor, ctx) =>
        validateClassStage3(backend, ctor, ctx, schema, options),
      )(value as new (...args: unknown[]) => unknown, context as ClassDecoratorContext);
    }
    return defineFieldDecorator((backend, ctx) =>
      validateFieldStage3(backend, ctx, schema, options),
    )(undefined, context as ClassFieldDecoratorContext);
  };
}

const serializableClassDec = defineClassDecorator(serializableClassStage3);
const serializableExcludeDec = defineFieldDecorator(serializableExcludeFieldStage3);

export function SerializableAlias(alias: string) {
  return defineFieldDecorator((backend, context) => {
    serializableAliasFieldStage3(backend, context, alias);
  });
}

export function SerializableTransform(
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports -- tsup DTS rollup requires import() type here
  transform: import('../shared/serializable.js').SerializableTransform,
) {
  return defineFieldDecorator((backend, context) => {
    serializableTransformFieldStage3(backend, context, transform);
  });
}

export const Serializable = Object.assign(serializableClassDec, {
  Exclude: serializableExcludeDec,
  Alias: SerializableAlias,
  Transform: SerializableTransform,
});

/** Marker-only — documents an adapter between two APIs (not `ValidatorAdapter`). */
export function Adapter(options: AdapterOptions) {
  return defineClassDecorator((backend, value, context) =>
    adapterClassStage3(backend, value, context, options),
  );
}

/** Marker-only — documents abstraction/implementation separation (Bridge pattern). */
export const Bridge = defineClassDecorator(bridgeClassStage3);

/** Marker-only — documents a simplified facade over subsystems. */
export function Facade(options: FacadeOptions = {}) {
  return defineClassDecorator((backend, value, context) =>
    facadeClassStage3(backend, value, context, options),
  );
}

/** Marker-only — documents a mediator coordination role. */
export const Mediator = defineClassDecorator(mediatorClassStage3);

/** Marker-only — documents an interpreter / DSL grammar role. */
export const Interpreter = defineClassDecorator(interpreterClassStage3);

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
