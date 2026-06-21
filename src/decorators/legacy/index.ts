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
import { delegateFieldLegacy, parseDelegateMethods } from '../shared/delegate.js';
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

/** Exclude a field from generated `equals()`. */
export const EqualsExclude = defineFieldDecorator(equalsExcludeFieldLegacy);

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
