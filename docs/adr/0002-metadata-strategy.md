# ADR-02: Metadata strategy

- **Status:** Open
- **Context:** Legacy decorators rely on `reflect-metadata` (a polyfill for the now-stalled Stage 1 metadata proposal). Stage 3 decorators have a different mechanism (`Symbol.metadata` plus `context.metadata`). A custom `WeakMap` store is also viable. Pairs with [ADR-01](./0001-decorator-standard.md).
- **Options:**
  1. `reflect-metadata`. Already declared as a dependency.
  2. Stage 3 `Symbol.metadata`. Pairs with ADR-01 option 2.
  3. Custom `WeakMap` store. No polyfills, full control.
  4. Per-backend storage (effectively forced by the Dual API decision in ADR-01): legacy uses reflect-metadata, Stage 3 uses Symbol.metadata + WeakMap fallback.
- **Trade-offs:**

  | Option           | Ergonomics       | Bundle cost       | NestJS compat     |
  | ---------------- | ---------------- | ----------------- | ----------------- |
  | reflect-metadata | High (familiar)  | ~3 KB polyfill    | Native            |
  | Symbol.metadata  | High (no poly)   | 0 KB              | Requires Stage 3  |
  | Custom WeakMap   | Medium (verbose) | Tiny              | Manual interop    |
  | Per-backend      | Best per side    | Backend-dependent | Backend-dependent |

- **Recommendation:** Option 4, given the Dual API decision in ADR-01. The internal `MetadataStore` interface in [src/core/metadata-store.ts](../../src/core/metadata-store.ts) means swapping implementations later is a single-file change.
- **Decision:** _<blank>_
- **Date decided:** _<blank>_
