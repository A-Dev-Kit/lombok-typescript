# ADR-01: Decorator standard

- **Status:** Decided (Dual API)
- **Context:** TypeScript supports two decorator standards. Legacy `experimentalDecorators` plus `emitDecoratorMetadata` is what the existing ecosystem uses (NestJS, TypeORM, class-validator). TypeScript 5.0+ also ships Stage 3 ECMAScript decorators with a different signature and a different metadata story (no `emitDecoratorMetadata`). The two are not interoperable: a decorator written for one doesn't work with the other.
- **Options:**
  1. Stay legacy (`experimentalDecorators`). Matches the existing ecosystem.
  2. Migrate to Stage 3. Future-proof, aligns with the JS standard track.
  3. Dual API. Ship both, let the user pick via sub-package import path.
- **Trade-offs:**

  | Option  | Ecosystem fit         | Future-proof                | Implementation cost   |
  | ------- | --------------------- | --------------------------- | --------------------- |
  | Legacy  | High (NestJS/TypeORM) | Low (eventually deprecated) | Low                   |
  | Stage 3 | Low currently         | High                        | Medium                |
  | Dual    | Best of both          | High                        | High (2x maintenance) |

- **Recommendation:** Originally option 1 (legacy first, Stage 3 later as a v2.0 milestone). On reflection, the dual API is worth the extra surface area: NestJS users keep working without changes, and adopters on TS 5.0+ can opt into Stage 3 without waiting two years.
- **Decision:** Option 3, Dual API. Both backends ship from Phase 0 onward.
  - `lombok-typescript/legacy` exposes legacy-shape decorator factories (NestJS / TypeORM compatibility)
  - `lombok-typescript/stage3` exposes Stage 3-shape decorator factories
  - The shared abstraction in `src/core/` lets each Phase 1+ decorator be authored once
- **Date decided:** 2026-06-12

## Notes

- `src/core/backend.ts` defines the abstract `Backend` interface
- `src/core/metadata-store.ts` defines `MetadataStore`, used by both backends
- `src/legacy/backend.ts` wraps `reflect-metadata`
- `src/stage3/backend.ts` uses a WeakMap-backed store keyed by `context.metadata`
- Each backend's `decorate.ts` exposes `defineClassDecorator`, `defineFieldDecorator`, `defineMethodDecorator` factories with the appropriate per-standard signatures
- Stage 3 has no parameter decorators in the spec; `defineParameterDecorator` is legacy-only
- Stage 3 also has separate getter/setter decorator kinds, exposed as `defineGetterDecorator` and `defineSetterDecorator`
