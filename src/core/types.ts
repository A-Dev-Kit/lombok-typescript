/** Decorator target kind. */
export type DecoratorKind = 'class' | 'field' | 'method' | 'getter' | 'setter' | 'parameter';

/** Which decorator standard a backend implements. */
export type BackendKind = 'legacy' | 'stage3';

/** Property identifier (string or symbol). */
export type PropertyName = string | symbol;

/** Where metadata sits. `propertyKey` undefined means class-level. */
export interface MetadataScope {
  readonly target: object;
  readonly propertyKey?: PropertyName;
}

/** Returned from `MetadataStore.list()`. */
export type MetadataKeyList = readonly string[];
