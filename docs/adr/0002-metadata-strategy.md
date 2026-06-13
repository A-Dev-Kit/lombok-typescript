# ADR-02: Metadata strategy

- **Status:** Open
- **Context:** Legacy decorators rely on `reflect-metadata` (a polyfill of the now-stalled Stage 1 metadata proposal). Stage 3 decorators have a different metadata system (`Symbol.metadata` + `context.metadata`). A custom `WeakMap`-based store is also viable. This decision pairs with [ADR-01](./0001-decorator-standard.md).
- **Options:**
  1. **`reflect-metadata`** — what the current package.json already declares
  2. **Stage 3 `Symbol.metadata`** — pairs with ADR-01 Option 2
  3. **Custom `WeakMap` store** — avoids both polyfills, full control
  4. **Per-backend storage** (effectively chosen by Dual API decision in ADR-01) — legacy uses reflect-metadata, Stage 3 uses Symbol.metadata + WeakMap fallback
- **Trade-offs:**

  | Option           | Ergonomics         | Bundle cost       | Compat with NestJS |
  | ---------------- | ------------------ | ----------------- | ------------------ |
  | reflect-metadata | High (familiar)    | ~3 KB polyfill    | Native             |
  | Symbol.metadata  | High (no polyfill) | 0 KB              | Requires Stage 3   |
  | Custom WeakMap   | Medium (verbose)   | Tiny              | Manual interop     |
  | Per-backend      | Best per side      | Backend-dependent | Backend-dependent  |

- **Recommendation:** Option 4 (per-backend), reflecting the Dual API choice in ADR-01. The internal `MetadataStore` interface in [src/core/metadata-store.ts](../../src/core/metadata-store.ts) lets backends swap implementations without changing call sites.
- **Decision:** _<blank>_
- **Date decided:** _<blank>_
