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

/** Fluent builder — codegen generates a companion builder class. */
export const Builder = defineClassDecorator((backend, target) =>
  codegenClassMarkerLegacy(backend, target, MetadataKeys.BUILDER),
);

/** Auto `toString()` — codegen generates the method body. */
export const ToString = defineClassDecorator((backend, target) =>
  codegenClassMarkerLegacy(backend, target, MetadataKeys.TO_STRING),
);

export { createFromFactory, getFactoryRegistry, registerFactory };
