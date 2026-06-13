/** Backend-agnostic primitives shared by both decorator backends. */

export type { Backend } from './backend.js';
export type { MetadataStore } from './metadata-store.js';
export { WeakMapMetadataStore } from './metadata-store.js';
export type {
  BackendKind,
  DecoratorKind,
  PropertyName,
  MetadataScope,
  MetadataKeyList,
} from './types.js';
export { MetadataKeys, METADATA_KEY_PREFIX } from './metadata-keys.js';
export type { MetadataKey } from './metadata-keys.js';
