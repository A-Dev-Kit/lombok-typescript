# DECISIONS — Open Architectural Questions for `lombok-typescript`

> ADR-lite (Architecture Decision Record) log of the open questions blocking implementation.
> Each entry has a recommendation; the **Decision** line is intentionally blank for you to fill in.
>
> Cross-references: full decorator catalog → [PATTERNS.md](./PATTERNS.md). Phasing & MVP scope → [MVP.md](./MVP.md). Original Lombok-only spec → [FEATURES.md](./FEATURES.md).

## How to use this doc

1. Read each ADR in order — most early ADRs (01-07) gate implementation work
2. Discuss the **Options** and **Trade-offs**
3. Either accept the **Recommendation** or pick a different option in the **Decision** line
4. Update **Status** from `Open` to `Decided` and fill in **Date decided**
5. The decision becomes binding for downstream phases; revisiting requires a new ADR

## Index

**Original 11 (architectural):**

- [ADR-01: Decorator standard](#adr-01-decorator-standard)
- [ADR-02: Metadata strategy](#adr-02-metadata-strategy)
- [ADR-03: Runtime vs codegen split rules](#adr-03-runtime-vs-codegen-split-rules)
- [ADR-04: Codegen execution model](#adr-04-codegen-execution-model)
- [ADR-05: Generated-code consumption](#adr-05-generated-code-consumption)
- [ADR-06: Field detection under useDefineForClassFields](#adr-06-field-detection-under-usedefineforclassfields)
- [ADR-07: Decorator composition rules](#adr-07-decorator-composition-rules)
- [ADR-08: MVP / release scope](#adr-08-mvp--release-scope)
- [ADR-09: Logger backend dependency strategy](#adr-09-logger-backend-dependency-strategy)
- [ADR-10: Validation library coupling](#adr-10-validation-library-coupling)
- [ADR-11: CLI surface and config loader](#adr-11-cli-surface-and-config-loader)

**New 6 (vision-driven):**

- [ADR-12: Library positioning](#adr-12-library-positioning)
- [ADR-13: GoF coverage strategy](#adr-13-gof-coverage-strategy)
- [ADR-14: NestJS compatibility strategy](#adr-14-nestjs-compatibility-strategy)
- [ADR-15: GoF Decorator pattern naming](#adr-15-gof-decorator-pattern-naming)
- [ADR-16: 23 vs 24 GoF patterns](#adr-16-23-vs-24-gof-patterns)
- [ADR-17: Open-source governance](#adr-17-open-source-governance)

**Appendix:** [Repo hygiene checklist](#repo-hygiene-checklist)

---

## ADR-01: Decorator standard

- **Status:** Open
- **Context:** TypeScript supports two decorator standards. The current [tsconfig.json](../tsconfig.json) uses legacy `experimentalDecorators: true` + `emitDecoratorMetadata: true`. TypeScript 5.0+ also ships **Stage 3 ECMAScript decorators** with a different signature and a different metadata story (no `emitDecoratorMetadata`). The two are NOT interoperable — a decorator written for one standard does not work with the other.
- **Options:**
  1. **Stay legacy (`experimentalDecorators`)** — matches NestJS, TypeORM, class-validator ecosystem
  2. **Migrate to Stage 3** — future-proof, aligns with the JS standard track
  3. **Dual API** — ship both, let user pick via config or sub-package
- **Trade-offs:**

  | Option | Ecosystem fit | Future-proof | Implementation cost |
  |---|---|---|---|
  | Legacy | High (NestJS/TypeORM) | Low (eventually deprecated) | Low |
  | Stage 3 | Low currently | High | Medium |
  | Dual | Best of both | High | High (2x maintenance) |

- **Recommendation:** Option 1 (legacy) for v0.1-v0.5. Design internal infra so a Stage 3 backend can be plugged in later. Plan migration as a v2.0 milestone with a deprecation cycle. NestJS interop is a primary persona — legacy keeps that frictionless.
- **Decision:** _<blank>_
- **Date decided:** _<blank>_

---

## ADR-02: Metadata strategy

- **Status:** Open
- **Context:** Legacy decorators rely on `reflect-metadata` (a polyfill of the now-stalled Stage 1 metadata proposal). Stage 3 decorators have a different metadata system (`Symbol.metadata`). A custom `WeakMap`-based store is also viable. This decision pairs with ADR-01.
- **Options:**
  1. **`reflect-metadata`** — what the current package.json already declares
  2. **Stage 3 `Symbol.metadata`** — pairs with ADR-01 Option 2
  3. **Custom `WeakMap` store** — avoids both polyfills, full control
- **Trade-offs:**

  | Option | Ergonomics | Bundle cost | Compat with NestJS |
  |---|---|---|---|
  | reflect-metadata | High (familiar) | ~3 KB polyfill | Native |
  | Symbol.metadata | High (no polyfill) | 0 KB | Requires Stage 3 |
  | Custom WeakMap | Medium (verbose) | Tiny | Manual interop |

- **Recommendation:** Option 1, paired with ADR-01 Option 1. Already declared as a dependency. Wrap access behind an internal `MetadataStore` abstraction so swapping to `Symbol.metadata` or `WeakMap` later is a single-file change.
- **Decision:** _<blank>_
- **Date decided:** _<blank>_

---

## ADR-03: Runtime vs codegen split rules

- **Status:** Open
- **Context:** [README.md](../README.md) declares a "hybrid approach" but doesn't say which decorators belong on which side. Without rules, every new decorator becomes a fresh argument.
- **Options:**
  1. **Runtime-first** — use codegen only when a decorator literally cannot work at runtime
  2. **Codegen-first** — use runtime only for cross-cutting concerns (`@Memoize`, `@Retry`, etc.)
  3. **Per-decorator decision with documented rules**
- **Trade-offs:**
  - Runtime decorators are simpler to author and test, but are limited by the `useDefineForClassFields` issue (see ADR-06) and by the fact that bare class field declarations don't emit at runtime
  - Codegen decorators can shape the class fully but require a build step and have a harder onboarding story
- **Recommendation:** Option 3 with these rules:
  - **Class shape changes** (adding methods, generating companion classes): **Codegen** — `@Builder`, `@Data`, `@Value`, `@With`, `@ToString`, `@Equals`, `@Getter/@Setter`, `@Accessors`, `@FieldDefaults`, `@Delegate`, `@TemplateMethod`
  - **Class instance lifecycle** (controlling `new`, identity, cloning): **Runtime** — `@Singleton`, `@Prototype`, `@Flyweight`, `@DeepFreeze`
  - **Method wrapping** (intercepting calls): **Runtime** — `@Memoize`, `@Retry`, `@Debounce/@Throttle`, `@Trace`, `@Wraps`
  - **Field validation/transform**: **Runtime** — `@NonNull`, `@Validate` (on assignment hooks)
  - **Registry-based**: **Hybrid** — `@Factory`, `@Strategy` (runtime registry, codegen-typed lookup)
  - **Pattern marker**: **No code** — `@Adapter`, `@Bridge`, `@Facade`, `@Mediator`, `@Interpreter`
- **Decision:** _<blank>_
- **Date decided:** _<blank>_

---

## ADR-04: Codegen execution model

- **Status:** Open
- **Context:** Once codegen decorators exist, when does ts-morph actually run? The [src/codegen/transformer.ts](../src/codegen/transformer.ts) shell hints at a TS compiler transformer, but those require ts-patch/ttypescript and are notoriously fragile.
- **Options:**
  1. **Standalone CLI** — `lombok-ts generate` runs before `tsc`/`tsup`
  2. **TS compiler transformer** — uses ts-patch/ttypescript
  3. **Tsup/Vite plugin** — integrates with the bundler
  4. **Watch mode writing `.lombok/` companion files** — opt-in for dev
- **Trade-offs:**

  | Option | DX | Tool fragility | Cross-bundler compat |
  |---|---|---|---|
  | CLI | Two-step but explicit | None | Universal |
  | TS transformer | One-step | High (patches `tsc`) | tsc-only |
  | Bundler plugin | One-step | Medium | Per-bundler |
  | Watch mode | Live | Medium | Universal |

- **Recommendation:** Standalone CLI in v0.1 (`lombok-ts generate` writes to `.lombok/`). Add watch mode (`lombok-ts watch`) in Phase 2. Add tsup plugin in Phase 5+. Avoid the TS transformer route entirely — too brittle for an OSS library.
- **Decision:** _<blank>_
- **Date decided:** _<blank>_

---

## ADR-05: Generated-code consumption

- **Status:** Open
- **Context:** If codegen produces a `UserBuilder` class in `.lombok/`, how does `User.builder()` become typed in the consumer's IDE without them importing anything?
- **Options:**
  1. **Declaration merging** — codegen emits `.d.ts` files with `declare module` augmentation
  2. **Explicit re-import** — user adds `import './lombok-generated';` once
  3. **Class extension at codegen time** — codegen modifies the source class in place (or alongside)
- **Trade-offs:**
  - Declaration merging is invisible to the user but harder to debug when types go wrong
  - Explicit import is debuggable but adds boilerplate that defeats the "Lombok magic" feel
  - Class extension is most Lombok-faithful but requires either source rewriting (intrusive) or alongside-class generation
- **Recommendation:** Option 1 — declaration merging via auto-generated `.d.ts` files. Each generated module emits `declare module './<source>'` augmentation. User imports nothing extra. Add a `lombok-typescript/types-shim` file the user references in their `tsconfig.json` `include`.
- **Decision:** _<blank>_
- **Date decided:** _<blank>_

---

## ADR-06: Field detection under useDefineForClassFields

- **Status:** Open
- **Context:** [tsconfig.json](../tsconfig.json) has `useDefineForClassFields: true` (matches modern TS defaults). Under this setting, bare field declarations like `name: string;` produce no runtime emit — they're purely type-level. This breaks runtime decorators that try to introspect the class shape (e.g. runtime `@NonNull` on `@NonNull name: string;`).
- **Options:**
  1. **Document the limitation** — codegen handles class-shape introspection; runtime decorators only operate on assignments / initialized fields
  2. **Require initializers** for decorated fields (`@NonNull name: string = ''`)
  3. **Disable the flag** in user's tsconfig (regress to old behavior)
- **Trade-offs:**
  - Option 1 keeps user code clean but pushes more work to codegen
  - Option 2 is intrusive (forces awkward defaults like `''` for required fields)
  - Option 3 fights the language; not viable
- **Recommendation:** Option 1. Codegen-mode decorators (per ADR-03) handle field introspection at compile-time, sidestepping the issue. Runtime field decorators (`@NonNull`, `@Validate`) operate via property accessor injection on assignment — they don't need to know the field exists at construction time.
- **Decision:** _<blank>_
- **Date decided:** _<blank>_

---

## ADR-07: Decorator composition rules

- **Status:** Open
- **Context:** Decorators stack. `@Data + @Value` conflict semantically (mutable vs immutable). `@Builder + @Data` need a defined codegen ordering. `@Data` already produces `toString()`, so stacking `@ToString` on top is redundant or contradictory. Without rules, behavior is undefined.
- **Options:**
  1. **Fail loudly** — codegen analyzer detects conflicts and emits compile-time errors
  2. **Last decorator wins** — silent merge with documented precedence
  3. **Precedence table** — explicit, layered application order
- **Recommendation:** Option 1 + Option 3 combined:
  - **Conflicts → error** (`@Data + @Value`, `@UtilityClass + anything-data-related`)
  - **Composition order (when compatible)** — apply in this sequence regardless of source order:
    1. `@FieldDefaults` (sets baseline modifiers)
    2. `@Data` / `@Value` (generates accessors, ctor, toString, equals)
    3. Field decorators (`@NonNull`, `@Getter`, `@Setter`, `@With`)
    4. `@Builder` (consumes ctor + fields)
    5. `@Log` (independent — adds `this.log`)
    6. Runtime wrappers (`@Memoize`, `@Trace`, `@Singleton`, `@Prototype`)
- **Decision:** _<blank>_
- **Date decided:** _<blank>_

---

## ADR-08: MVP / release scope

- **Status:** Open
- **Context:** The recommended v0.1 set in [MVP.md §5 Phase 1](./MVP.md#phase-1--public-preview-mvp-v01) is 8 decorators (`@NonNull`, `@ToString`, `@Builder`, `@Data`, `@Singleton`, `@Prototype`, `@Factory`, `@Memoize`). Is that the right cut?
- **Options:**
  1. **8 cross-cutting** — recommended in MVP.md
  2. **4 minimal** — `@NonNull`, `@ToString`, `@Singleton`, `@Memoize` (one per archetype)
  3. **Full Tier 1 + Creational** — all 7 Lombok Tier 1 + all 5 GoF Creational = 12
- **Trade-offs:**

  | Option | Time-to-preview | Vision proof | User impression |
  |---|---|---|---|
  | 8 | Medium | Strong (dual-purpose evident) | Polished |
  | 4 | Fast | Weak (looks like a toy) | Skeletal |
  | 12 | Slow | Very strong | Comprehensive but delayed |

- **Recommendation:** Option 1 (8). Smaller doesn't prove the dual-purpose vision; larger delays the public preview unnecessarily. The 8 chosen each fit a distinct archetype slot (runtime-field, codegen-class, runtime-class, runtime-method, GoF-Creational variations, Lombok-composite).
- **Decision:** _<blank>_
- **Date decided:** _<blank>_

---

## ADR-09: Logger backend dependency strategy

- **Status:** Open
- **Context:** `@Log` claims to support `console`, `winston`, `pino`, `bunyan`. How are these distributed?
- **Options:**
  1. **Hard peer deps** — user must install the library they use
  2. **Optional peer deps** — `peerDependenciesMeta: { optional: true }`
  3. **Dynamic resolution** — `await import('winston')` at runtime
  4. **BYOL (bring your own logger)** — user passes the logger instance, no built-in adapters
- **Trade-offs:**
  - Hard peer deps cause `npm install` warnings for users on `console` only
  - Optional peer deps are clean but require Node 16+ (already required) and pnpm/npm 7+
  - Dynamic resolution is brittle and bundler-unfriendly
  - BYOL is most flexible but pushes adapter writing to the user
- **Recommendation:** Option 2 + Option 4 combined. Built-in adapters for `console` (default), `winston`, `pino`, `bunyan` declared as optional peer deps. BYOL escape hatch via `@Log({ logger: customInstance })` for anything else (NestJS Logger, log4js, Sentry breadcrumb logger, etc.).
- **Decision:** _<blank>_
- **Date decided:** _<blank>_

---

## ADR-10: Validation library coupling

- **Status:** Open
- **Context:** `@Validate(z.string().email())` — Zod is the obvious target, but Yup and class-validator are entrenched (NestJS uses class-validator officially).
- **Options:**
  1. **Zod-only** — pick the strongest schema library, ship one path
  2. **Generic adapter contract** — define `ValidatorAdapter<TSchema, TValue>` interface; ship `ZodAdapter`, `YupAdapter`, `ClassValidatorAdapter`
  3. **Bring-your-own-validator** — `@Validate(customValidatorFn)` only
- **Trade-offs:**

  | Option | Effort | NestJS interop | User flexibility |
  |---|---|---|---|
  | Zod-only | Low | Friction | Locked in |
  | Adapter contract | Medium | Native (class-validator adapter) | High |
  | BYOV | Low | Native | High but boilerplate |

- **Recommendation:** Option 2. Define `ValidatorAdapter` interface; ship `ZodAdapter` (default), `YupAdapter`, `ClassValidatorAdapter` as separate exports under `lombok-typescript/validators/*`. User opts into one via [src/config.ts](../src/config.ts). Each adapter is an optional peer dep (per ADR-09 pattern).
- **Decision:** _<blank>_
- **Date decided:** _<blank>_

---

## ADR-11: CLI surface and config loader

- **Status:** Open
- **Context:** [package.json](../package.json) has no `bin` field. `defineConfig()` exists in [src/config.ts](../src/config.ts) but nothing reads `lombok.config.ts` from disk yet.
- **Options for CLI name:**
  1. **`lombok-ts`** — matches package name, unambiguous
  2. **`lt`** — short, but conflicts with shell aliases for many devs
  3. **`lombok-typescript`** — verbose but unmistakable
- **Options for subcommands:**
  1. `generate` (one-shot), `watch`, `init` (scaffold `lombok.config.ts`), `clean`
  2. Single command with flags: `lombok-ts --watch`, `lombok-ts --init`
- **Options for config loader:**
  1. **`tsx`** — runs TS directly
  2. **`jiti`** — lighter, esbuild-based
  3. **`bundle-require`** — what `tsup` uses internally (already a transitive dep)
- **Recommendation:**
  - CLI name: `lombok-ts`
  - Subcommands: `generate`, `watch`, `init`, `clean` (explicit beats flag-soup)
  - Config loader: `bundle-require` (already in dep tree, zero net cost)
- **Decision:** _<blank>_
- **Date decided:** _<blank>_

---

## ADR-12: Library positioning

- **Status:** Open
- **Context:** With ~42 decorators (Lombok + GoF + TS-unique) the library is broader than Lombok alone. Should it ship as one package or split?
- **Options:**
  1. **Single unified package** `lombok-typescript` with namespaced sub-paths (`lombok-typescript/lombok`, `lombok-typescript/patterns`, `lombok-typescript/utils`)
  2. **Core + satellites:** `lombok-typescript` (Lombok features only) + `@lombok-typescript/patterns` (GoF) + `@lombok-typescript/nestjs`
  3. **Three peer packages from day one** — fully separated
- **Trade-offs:**

  | Option | Discoverability | Bundle size | Maintenance |
  |---|---|---|---|
  | Single | High (one install) | All-or-nothing | Simplest |
  | Core + satellites | Medium | Pay-for-what-you-use | 2-3x |
  | Three peers | Low (which one?) | Tightest | 3x + version coordination |

- **Recommendation:** Option 1 for v0.1 → v1.0. Single unified package with sub-path exports for tree-shaking. Split into satellites only if package size exceeds ~50 KB minified or if features develop independent release cadences. Keep `@lombok-typescript/nestjs` as a satellite from Phase 7 onward (per ADR-14).
- **Decision:** _<blank>_
- **Date decided:** _<blank>_

---

## ADR-13: GoF coverage strategy

- **Status:** Open
- **Context:** Of the 23 GoF patterns, ~17 translate to "Real" decorators, 1 is a "Helper", and 5 are "Marker-only" (Adapter, Bridge, Facade, Mediator, Interpreter). See [PATTERNS.md](./PATTERNS.md).
- **Options:**
  1. **Ship all 23** — Real where possible, Helper/Marker honestly labeled
  2. **Ship only the ~17 Real ones** — document the rest as "out of scope for decorator implementation"
  3. **Opt-in expansion pack** — Real ones in core, marker decorators in `@lombok-typescript/patterns/markers`
- **Trade-offs:**
  - Option 1 supports the "all 23 GoF patterns" tagline but ships some low-utility decorators
  - Option 2 is honest but loses the marketing/educational story
  - Option 3 is a middle ground but adds package surface complexity
- **Recommendation:** Option 1. Ship all 23 with viability ratings prominent in JSDoc, the docs site, and PATTERNS.md. Educational value of complete GoF coverage outweighs the cost. Marker-only decorators provide TypeScript typing aids (e.g. `@Adapter({ adapts: X, target: Y })` validates structural compatibility) which is non-zero value.
- **Decision:** _<blank>_
- **Date decided:** _<blank>_

---

## ADR-14: NestJS compatibility strategy

- **Status:** Open
- **Context:** NestJS is a primary persona ([MVP.md §3](./MVP.md#3-personas)). How tightly do we couple to it?
- **Options:**
  1. **Framework-agnostic core only** — NestJS users wire integrations themselves
  2. **Built-in NestJS layer** — core package depends on `@nestjs/common` types
  3. **Framework-agnostic core + satellite `@lombok-typescript/nestjs`** — core has no Nest dep; satellite ships Nest-specific helpers
- **Trade-offs:**

  | Option | Plain-TS UX | NestJS UX | Coupling risk |
  |---|---|---|---|
  | Agnostic only | Clean | DIY | None |
  | Built-in Nest | Bloated (unused Nest types) | Best | Tight |
  | Core + satellite | Clean | Best (opt-in) | Looose |

- **Recommendation:** Option 3. Core stays framework-agnostic — no Nest in the core dep tree. Ship `@lombok-typescript/nestjs` from Phase 7 with: `LombokModule.forRoot()`, NestJS-Logger-compatible `@Log` adapter, interceptor-aware `@Memoize`/`@Retry` variants, request-scope-safe overrides. Plain-TS users never see NestJS imports.
- **Decision:** _<blank>_
- **Date decided:** _<blank>_

---

## ADR-15: GoF Decorator pattern naming

- **Status:** Open
- **Context:** TypeScript uses `@decorator` syntax for ALL decorators. The GoF "Decorator" pattern is a specific structural OOP pattern (wrapping classes to add behavior). Naming a TypeScript decorator `@Decorator` would create severe vocabulary collision.
- **Options:**
  1. **`@DecoratorPattern`** — explicit but verbose
  2. **`@Wraps`** — concise, verb form, semantically accurate
  3. **`@Decorate`** — verb form but still echoes "decorator"
  4. **`@Wrapper`** — noun form
  5. **`@Compose`** — emphasizes the pattern's compositional nature
- **Trade-offs:**

  | Option | Readability | Discoverability | Vocabulary clash |
  |---|---|---|---|
  | `@DecoratorPattern` | Low (verbose) | High (literal) | Some |
  | `@Wraps` | High | Medium | None |
  | `@Decorate` | Medium | Medium | High |
  | `@Wrapper` | High | Medium | None |
  | `@Compose` | Medium | Low | Some (FP overload) |

- **Recommendation:** Option 2 (`@Wraps`). Reads naturally — `@Wraps(Coffee)` means "this class wraps Coffee". Concise. No clash with TS decorator vocabulary or FP `compose`. Always document under "GoF Decorator Pattern" with a `@see` JSDoc cross-reference for searchability.
- **Decision:** _<blank>_
- **Date decided:** _<blank>_

---

## ADR-16: 23 vs 24 GoF patterns

- **Status:** Open
- **Context:** The user mentioned "24 GoF patterns" but the canonical 1994 GoF book lists 23. Common candidates for an unofficial 24th: Object Pool, Null Object, Multiton.
- **Options:**
  1. **Ship 23 canonical only** — strict adherence to the book
  2. **Ship 23 + Object Pool as 24th** — pool is the most commonly cited "missing" pattern
  3. **Ship 23 + Null Object** — useful complement to `@NonNull`
  4. **Ship 23 + ALL three (Object Pool, Null Object, Multiton)** = 26 patterns
- **Trade-offs:**
  - Strict 23 keeps marketing honest ("23 GoF patterns")
  - Adding Object Pool earns the "24" tagline cleanly with a high-utility pattern
  - Adding all three is overcommitment; Multiton is essentially `@Singleton` + `@Flyweight` composition
- **Recommendation:** Option 1 for v0.1 → v1.0. Ship 23 canonical. Document Object Pool as the most common "24th" candidate and ship it as `@Pool` in Phase 7+ (post v1.0). Marketing tagline: "23 GoF patterns + Lombok ergonomics + TypeScript-unique utilities".
- **Decision:** _<blank>_
- **Date decided:** _<blank>_

---

## ADR-17: Open-source governance

- **Status:** Open
- **Context:** Public OSS project needs npm name, semver discipline, contribution model, license clarity, security posture. Currently [package.json](../package.json) has empty `author` and `repository.url`, no LICENSE file, and the package name `lombok-typescript` is unverified on npm.
- **Sub-decisions:**

### A. npm package name

- **Options:**
  1. Unscoped `lombok-typescript` (if available)
  2. Scoped `@a-dev-kit/lombok-typescript` (matches existing GitHub org `A-Dev-Kit`)
  3. Brand-new name (`tsbok`, `lomboid`, `tsx-lombok`, etc.)
- **Recommendation:** Try unscoped `lombok-typescript` first (run `npm view lombok-typescript`). If taken, fall back to `@a-dev-kit/lombok-typescript`. Avoid invented names — discoverability matters.

### B. Semver pre-1.0 strategy

- **Options:**
  1. Aggressive 0.x — break freely until v1.0
  2. Conservative — minor bumps only with deprecation warnings
- **Recommendation:** Option 1. v0.x is for iterating; document breaking changes in CHANGELOG; lock down at v1.0. Communicate "0.x = breaking changes possible" prominently in README.

### C. License

- **Options:** MIT / Apache 2.0 / dual-licensed
- **Recommendation:** MIT (already declared). Add a `LICENSE` file containing the MIT text.

### D. Contribution model

- **Recommendation:**
  - `CONTRIBUTING.md` with PR workflow, commit message conventions (Conventional Commits)
  - `CODE_OF_CONDUCT.md` using the [Contributor Covenant v2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/)
  - `SECURITY.md` with vulnerability disclosure email
  - GitHub issue templates for bug / feature / pattern proposal
  - `.github/PULL_REQUEST_TEMPLATE.md` with checklist (tests, docs, CHANGELOG)

### E. Release process

- **Recommendation:**
  - Automated publish on git tag via GitHub Actions
  - Require npm 2FA on the publishing account
  - Use `provenance: true` in `npm publish` (npm 9.5+) for supply-chain trust
  - Dependabot or Renovate for dependency updates

- **Decision:** _<blank>_
- **Date decided:** _<blank>_

---

## Repo hygiene checklist

Non-architectural blockers — must be addressed before any public release. None of these change architecture but all of them gate v0.1 publishing.

### Build & code

- [ ] Fix broken re-exports in [src/decorators/index.ts](../src/decorators/index.ts) — currently imports 21 decorators from non-existent files; `pnpm build` fails
- [ ] Implement [src/codegen/analyzer.ts](../src/codegen/analyzer.ts), [src/codegen/generator.ts](../src/codegen/generator.ts), [src/codegen/transformer.ts](../src/codegen/transformer.ts) (currently `throw new Error('Not implemented yet')`)
- [ ] Add at least one passing Vitest test before publishing
- [ ] Type tests via `tsd` or `expect-type` for public decorator APIs

### package.json

- [ ] Populate `author` field
- [ ] Populate `repository.url` (e.g. `https://github.com/A-Dev-Kit/lombok-typescript`)
- [ ] Add `bugs.url` (`https://github.com/A-Dev-Kit/lombok-typescript/issues`)
- [ ] Add `homepage` field
- [ ] Add `bin` field for `lombok-ts` CLI (per ADR-11)
- [ ] Confirm package name available: `npm view lombok-typescript`

### OSS files

- [ ] Add `LICENSE` file (MIT text — README/package.json say MIT)
- [ ] Add `CHANGELOG.md` (Keep-a-Changelog format)
- [ ] Add `CONTRIBUTING.md`
- [ ] Add `CODE_OF_CONDUCT.md` (Contributor Covenant v2.1)
- [ ] Add `SECURITY.md`
- [ ] Add `.github/ISSUE_TEMPLATE/` (bug, feature, pattern proposal)
- [ ] Add `.github/PULL_REQUEST_TEMPLATE.md`

### CI / release

- [ ] GitHub Actions workflow: `typecheck` + `lint` + `test` + `build` matrix on Node 18 / 20 / 22
- [ ] Publish workflow on git tag with provenance + 2FA
- [ ] Dependabot or Renovate config

### Examples & docs

- [ ] `examples/plain-ts/` runnable example app
- [ ] `examples/nestjs/` runnable example app (from Phase 1)
- [ ] Docs site skeleton (Astro Starlight or VitePress)
- [ ] Rewrite [README.md](../README.md) reflecting Lombok + GoF positioning

---

## Decision log meta

- This doc is the source of truth for architectural questions. Implementation work should not start on a feature without its blocking ADRs `Decided`.
- New questions become new ADRs (ADR-18, ADR-19, ...). Do not retroactively renumber.
- Reversing a decision creates a new ADR that supersedes the old (mark old `Status: Superseded by ADR-NN`).