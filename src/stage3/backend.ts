import type { Backend } from '../core/backend.js';
import type { MetadataStore } from '../core/metadata-store.js';
import { WeakMapMetadataStore } from '../core/metadata-store.js';

/**
 * Backend for the Stage 3 ECMAScript decorator standard (TS 5.0+).
 *
 * Stage 3 doesn't use `reflect-metadata`. Each decorator's `context.metadata`
 * is a per-class `Record<PropertyKey, unknown>` accessible at runtime as
 * `MyClass[Symbol.metadata]`. We key the WeakMap on that object so all
 * decorators on the same class share storage and consumers can recover the
 * metadata at runtime via `Class[Symbol.metadata]`.
 *
 * @see https://github.com/tc39/proposal-decorators
 * @see https://github.com/tc39/proposal-decorator-metadata
 */
export class Stage3Backend implements Backend {
  readonly kind = 'stage3' as const;
  readonly metadata: MetadataStore = new WeakMapMetadataStore();
}

/** Shared instance. */
export const stage3Backend = new Stage3Backend();
