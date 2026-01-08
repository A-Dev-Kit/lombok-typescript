/**
 * Decorators Module
 *
 * All decorators for lombok-typescript.
 * These decorators can be used at runtime for metadata marking,
 * and are consumed by the code generator for compile-time code generation.
 */

// Tier 1 - Must Have
export { Builder } from './core/builder.decorator';
export { Data } from './core/data.decorator';
export { Value } from './core/value.decorator';
export { NonNull } from './core/non-null.decorator';
export { ToString } from './core/to-string.decorator';
export { Log } from './core/log.decorator';
export { With } from './core/with.decorator';

// Tier 2 - Should Have
export { Getter, Setter } from './core/accessor.decorator';
export { Accessors } from './core/accessors.decorator';
export { UtilityClass } from './core/utility-class.decorator';
export { Delegate } from './core/delegate.decorator';
export { Equals } from './core/equals.decorator';
export { FieldDefaults } from './core/field-defaults.decorator';

// Tier 3 - TypeScript Unique
export { Memoize } from './unique/memoize.decorator';
export { Debounce, Throttle } from './unique/rate-limit.decorator';
export { Trace } from './unique/trace.decorator';
export { Retry } from './unique/retry.decorator';
export { Validate } from './unique/validate.decorator';
export { Observable } from './unique/observable.decorator';
export { Serializable } from './unique/serializable.decorator';
export { DeepFreeze } from './unique/deep-freeze.decorator';

// Metadata keys used by decorators
export * from './metadata/keys';

