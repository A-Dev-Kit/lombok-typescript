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
