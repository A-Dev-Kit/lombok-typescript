# ADR-14: NestJS compatibility strategy

- **Status:** Open
- **Context:** NestJS is a primary persona ([MVP.md §3](../MVP.md#3-personas)). How tightly do we couple to it?
- **Options:**
  1. **Framework-agnostic core only** — NestJS users wire integrations themselves
  2. **Built-in NestJS layer** — core package depends on `@nestjs/common` types
  3. **Framework-agnostic core + satellite `@lombok-typescript/nestjs`** — core has no Nest dep; satellite ships Nest-specific helpers
- **Trade-offs:**

  | Option           | Plain-TS UX                 | NestJS UX     | Coupling risk |
  | ---------------- | --------------------------- | ------------- | ------------- |
  | Agnostic only    | Clean                       | DIY           | None          |
  | Built-in Nest    | Bloated (unused Nest types) | Best          | Tight         |
  | Core + satellite | Clean                       | Best (opt-in) | Loose         |

- **Recommendation:** Option 3. Core stays framework-agnostic — no Nest in the core dep tree. Ship `@lombok-typescript/nestjs` from Phase 7 with: `LombokModule.forRoot()`, NestJS-Logger-compatible `@Log` adapter, interceptor-aware `@Memoize`/`@Retry` variants, request-scope-safe overrides. Plain-TS users never see NestJS imports.
- **Decision:** _<blank>_
- **Date decided:** _<blank>_
