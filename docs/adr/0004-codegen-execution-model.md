# ADR-04: Codegen execution model

- **Status:** Open
- **Context:** Once codegen decorators exist, when does ts-morph actually run? The placeholder [src/codegen/transformer.ts](../../src/codegen/transformer.ts) hints at a TS compiler transformer, but those need ts-patch / ttypescript and tend to break with each TS minor.
- **Options:**
  1. Standalone CLI: `lombok-ts generate` runs before `tsc` / `tsup`.
  2. TS compiler transformer via ts-patch / ttypescript.
  3. Tsup or Vite plugin.
  4. Watch mode writing `.lombok/` companion files in the dev loop.
- **Trade-offs:**

  | Option         | DX                    | Tool fragility       | Cross-bundler compat |
  | -------------- | --------------------- | -------------------- | -------------------- |
  | CLI            | Two-step but explicit | None                 | Universal            |
  | TS transformer | One-step              | High (patches `tsc`) | tsc-only             |
  | Bundler plugin | One-step              | Medium               | Per-bundler          |
  | Watch mode     | Live                  | Medium               | Universal            |

- **Recommendation:** CLI for v0.1. Watch mode in Phase 2. Tsup plugin in Phase 5+. Skip the TS transformer entirely; too brittle for an OSS library.
- **Phase 0 status:** Provisionally adopted. [src/cli/](../../src/cli/) ships `lombok-ts generate`, `init`, and `clean`, plus a Phase 2 placeholder for `watch`. [src/codegen/transformer.ts](../../src/codegen/transformer.ts) is a stub that throws a clear error.
- **Decision:** _<blank>_
- **Date decided:** _<blank>_
