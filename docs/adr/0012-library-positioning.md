# ADR-12: Library positioning

- **Status:** Open
- **Context:** With ~42 decorators (Lombok + GoF + TS-unique) the library is broader than Lombok alone. Should it ship as one package or split?
- **Options:**
  1. **Single unified package** `lombok-typescript` with namespaced sub-paths (`lombok-typescript/legacy`, `lombok-typescript/stage3`, `lombok-typescript/codegen`, `lombok-typescript/cli`, `lombok-typescript/core`)
  2. **Core + satellites:** `lombok-typescript` (Lombok features only) + `@lombok-typescript/patterns` (GoF) + `@lombok-typescript/nestjs`
  3. **Three peer packages from day one** — fully separated
- **Trade-offs:**

  | Option            | Discoverability    | Bundle size          | Maintenance               |
  | ----------------- | ------------------ | -------------------- | ------------------------- |
  | Single            | High (one install) | All-or-nothing       | Simplest                  |
  | Core + satellites | Medium             | Pay-for-what-you-use | 2-3x                      |
  | Three peers       | Low (which one?)   | Tightest             | 3x + version coordination |

- **Recommendation:** Option 1 for v0.1 → v1.0. Single unified package with sub-path exports for tree-shaking. Split into satellites only if package size exceeds ~50 KB minified or if features develop independent release cadences. Keep `@lombok-typescript/nestjs` as a satellite from Phase 7 onward (per ADR-14).
- **Phase 0 status:** Recommendation provisionally adopted: [package.json](../../package.json) ships `lombok-typescript` with sub-path exports `./core`, `./legacy`, `./stage3`, `./codegen`.
- **Decision:** _<blank>_
- **Date decided:** _<blank>_
