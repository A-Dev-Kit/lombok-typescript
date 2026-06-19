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
};
