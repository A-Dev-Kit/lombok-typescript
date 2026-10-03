export {
  assertNonNull,
  nonNullFieldLegacy,
  nonNullParameterLegacy,
  nonNullFieldStage3,
} from './non-null.js';
export { singletonClassLegacy, singletonClassStage3 } from './singleton.js';
export { prototypeClassLegacy, prototypeClassStage3 } from './prototype.js';
export { memoizeMethod, type MemoizeOptions } from './memoize.js';
export { memoizeMethodLegacy, memoizeMethodStage3 } from './memoize-logic.js';
export {
  extensionMethodClassLegacy,
  extensionMethodClassStage3,
  installExtensionMethods,
  type ExtensionHelper,
  type ExtensionConflictPolicy,
  type ExtensionMethodOptions,
} from './extension-method.js';
export {
  allArgsConstructorClassLegacy,
  allArgsConstructorClassStage3,
  DEFAULT_ALL_ARGS_STATIC_NAME,
  type AllArgsConstructorOptions,
  type AllArgsConstructorAccess,
  type AllArgsConstructorMetadata,
} from './all-args-constructor.js';
export {
  noArgsConstructorClassLegacy,
  noArgsConstructorClassStage3,
  DEFAULT_NO_ARGS_STATIC_NAME,
  type NoArgsConstructorOptions,
  type NoArgsConstructorAccess,
  type NoArgsConstructorMetadata,
} from './no-args-constructor.js';
