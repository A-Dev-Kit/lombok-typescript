# ADR-14: NestJS compatibility strategy

- **Status:** Open
- **Context:** NestJS is one of the primary audiences ([MVP.md "Who would use this"](../MVP.md#who-would-use-this)). How tightly do we couple to it?
- **Options:**
  1. Framework-agnostic core only. NestJS users wire integrations themselves.
  2. Built-in NestJS layer. Core package depends on `@nestjs/common` types.
  3. Framework-agnostic core plus a satellite `@lombok-typescript/nestjs`. Core has no Nest dep; the satellite ships Nest-specific helpers.
- **Trade-offs:**

  | Option           | Plain-TS UX                 | NestJS UX     | Coupling risk |
  | ---------------- | --------------------------- | ------------- | ------------- |
  | Agnostic only    | Clean                       | DIY           | None          |
  | Built-in Nest    | Bloated (unused Nest types) | Best          | Tight         |
  | Core + satellite | Clean                       | Best (opt-in) | Loose         |

- **Recommendation:** Option 3. Core stays framework-agnostic, no Nest in the core dep tree. From Phase 7, ship `@lombok-typescript/nestjs` with: `LombokModule.forRoot()`, a NestJS-Logger-compatible `@Log` adapter, interceptor-aware `@Memoize` / `@Retry` variants, and request-scope-safe overrides. Plain-TS users never see NestJS imports.
- **Decision:** _<blank>_
- **Date decided:** _<blank>_
