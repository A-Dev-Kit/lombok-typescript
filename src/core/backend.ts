import type { BackendKind } from './types.js';
import type { MetadataStore } from './metadata-store.js';

/**
 * Abstraction over a TypeScript decorator standard.
 *
 * Two implementations: `LegacyBackend` (wraps `reflect-metadata` for
 * `experimentalDecorators`) and `Stage3Backend` (uses `Symbol.metadata`).
 * Decorator authors target this interface so the same logic can be exposed
 * under both standards.
 */
export interface Backend {
  readonly kind: BackendKind;
  readonly metadata: MetadataStore;
}
