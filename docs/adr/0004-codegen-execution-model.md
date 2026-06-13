# ADR-04: Codegen execution model

- **Status:** Open
- **Context:** Once codegen decorators exist, when does ts-morph actually run? The [src/codegen/transformer.ts](../../src/codegen/transformer.ts) shell hints at a TS compiler transformer, but those require ts-patch/ttypescript and are notoriously fragile.
- **Options:**
  1. **Standalone CLI** — `lombok-ts generate` runs before `tsc`/`tsup`
  2. **TS compiler transformer** — uses ts-patch/ttypescript
  3. **Tsup/Vite plugin** — integrates with the bundler
  4. **Watch mode writing `.lombok/` companion files** — opt-in for dev
- **Trade-offs:**

  | Option         | DX                    | Tool fragility       | Cross-bundler compat |
  | -------------- | --------------------- | -------------------- | -------------------- |
  | CLI            | Two-step but explicit | None                 | Universal            |
  | TS transformer | One-step              | High (patches `tsc`) | tsc-only             |
  | Bundler plugin | One-step              | Medium               | Per-bundler          |
  | Watch mode     | Live                  | Medium               | Universal            |

- **Recommendation:** Standalone CLI in v0.1 (`lombok-ts generate` writes to `.lombok/`). Add watch mode (`lombok-ts watch`) in Phase 2. Add tsup plugin in Phase 5+. Avoid the TS transformer route entirely — too brittle for an OSS library.
- **Phase 0 status:** Recommendation provisionally adopted: the [src/cli/](../../src/cli/) module ships `lombok-ts generate` / `init` / `clean` (and a Phase 2 placeholder for `watch`). [src/codegen/transformer.ts](../../src/codegen/transformer.ts) is a stub that throws a clear "not yet" error.
- **Decision:** _<blank>_
- **Date decided:** _<blank>_
