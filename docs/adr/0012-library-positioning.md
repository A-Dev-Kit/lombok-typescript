# ADR-12: Library positioning

- **Status:** Open
- **Context:** With ~42 decorators (Lombok + GoF + TS-only) the library is broader than Lombok alone. Should it ship as one package or split?
- **Options:**
  1. Single unified package: `lombok-typescript` with sub-paths (`lombok-typescript/legacy`, `/stage3`, `/codegen`, `/cli`, `/core`).
  2. Core plus satellites: `lombok-typescript` (Lombok features) + `@lombok-typescript/patterns` (GoF) + `@lombok-typescript/nestjs`.
  3. Three peer packages from day one, fully separated.
- **Trade-offs:**

  | Option            | Discoverability    | Bundle size          | Maintenance               |
  | ----------------- | ------------------ | -------------------- | ------------------------- |
  | Single            | High (one install) | All-or-nothing       | Simplest                  |
  | Core + satellites | Medium             | Pay-for-what-you-use | 2-3x                      |
  | Three peers       | Low (which one?)   | Tightest             | 3x + version coordination |

- **Recommendation:** Option 1 for v0.1 through v1.0. Single unified package with sub-path exports for tree-shaking. Split into satellites later if package size exceeds ~50 KB minified or if features develop independent release cadences. `@lombok-typescript/nestjs` lives as a satellite from Phase 7 onward (per ADR-14).
- **Phase 0 status:** Provisionally adopted. [package.json](../../package.json) ships `lombok-typescript` with sub-path exports `./core`, `./legacy`, `./stage3`, `./codegen`.
- **Decision:** _<blank>_
- **Date decided:** _<blank>_
