import { MetadataKeys } from '../../core/metadata-keys.js';
import {
  defineClassDecorator,
  defineFieldDecorator,
  defineMethodDecorator,
  defineParameterDecorator,
} from '../../legacy/decorate.js';
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

export { createFromFactory, getFactoryRegistry, registerFactory };
