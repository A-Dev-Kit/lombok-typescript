import { MetadataKeys } from '../../core/metadata-keys.js';
import {
  defineClassDecorator,
  defineFieldDecorator,
  defineMethodDecorator,
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

/** Fluent builder — codegen generates a companion builder class. */
export const Builder = defineClassDecorator((backend, value, context) =>
  codegenClassMarkerStage3(backend, value, context, MetadataKeys.BUILDER),
);

/** Auto `toString()` — codegen generates the method body. */
export const ToString = defineClassDecorator((backend, value, context) =>
  codegenClassMarkerStage3(backend, value, context, MetadataKeys.TO_STRING),
);

export { createFromFactory, getFactoryRegistry, registerFactory };
