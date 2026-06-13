# ADR-01: Decorator standard

- **Status:** Decided (Dual API)
- **Context:** TypeScript supports two decorator standards. The current [tsconfig.json](../../tsconfig.json) uses legacy `experimentalDecorators: true` + `emitDecoratorMetadata: true`. TypeScript 5.0+ also ships **Stage 3 ECMAScript decorators** with a different signature and a different metadata story (no `emitDecoratorMetadata`). The two are NOT interoperable — a decorator written for one standard does not work with the other.
- **Options:**
  1. **Stay legacy (`experimentalDecorators`)** — matches NestJS, TypeORM, class-validator ecosystem
  2. **Migrate to Stage 3** — future-proof, aligns with the JS standard track
  3. **Dual API** — ship both, let user pick via sub-package import path
- **Trade-offs:**

  | Option  | Ecosystem fit         | Future-proof                | Implementation cost   |
  | ------- | --------------------- | --------------------------- | --------------------- |
  | Legacy  | High (NestJS/TypeORM) | Low (eventually deprecated) | Low                   |
  | Stage 3 | Low currently         | High                        | Medium                |
  | Dual    | Best of both          | High                        | High (2x maintenance) |

- **Recommendation (initial):** Option 1 (legacy) for v0.1-v0.5, with Stage 3 plugged in later as a v2.0 milestone.
- **Decision:** **Option 3 — Dual API.** Ship both backends from Phase 0 onward.
  - `lombok-typescript/legacy` exposes legacy-shape decorator factories (NestJS / TypeORM compatibility).
  - `lombok-typescript/stage3` exposes Stage 3-shape decorator factories (modern, future-proof).
  - Internal abstraction in `src/core/` lets each Phase 1+ decorator's logic be authored once.
- **Date decided:** 2026-06-12

## Implementation notes

- `src/core/backend.ts` defines the abstract `Backend` interface
- `src/core/metadata-store.ts` defines `MetadataStore` (used by both backends)
- `src/legacy/backend.ts` wraps `reflect-metadata` for the legacy backend
- `src/stage3/backend.ts` uses a WeakMap-backed store keyed by `context.metadata` for Stage 3
- Each backend's `decorate.ts` exposes `defineClassDecorator`, `defineFieldDecorator`, `defineMethodDecorator` factories with the appropriate per-standard signatures
- Stage 3 has no parameter decorators in the spec; `defineParameterDecorator` is legacy-only
- Stage 3 also exposes `defineGetterDecorator` and `defineSetterDecorator` (separate decorator kinds in the spec)
