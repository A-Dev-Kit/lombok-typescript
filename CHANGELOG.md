# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.9.0] - 2026-10-03

### Added

- **`@AllArgsConstructor`** (Phase 15) — codegen a static factory on the decorated class that constructs an instance via `Object.create(Class.prototype)` and assigns every declared field in declaration order. Default factory name is `allArgs`; pass `{ staticName: 'of' }` to generate `Class.of(...)` (Java Lombok parity for `@AllArgsConstructor(staticName = "of")`). An `{ access }` option is accepted and recorded in metadata for tooling; TypeScript has no runtime access modifiers, so the factory is always callable at runtime (documented honestly). Honest divergence from Java: this is a **static factory alongside the user's own constructor**, not a constructor rewrite — TypeScript decorators can't replace an existing class's constructor without wrapping-and-replacing the class reference (breaks `instanceof` identity). Mutually exclusive with `@Data` and `@Value` (which already emit a constructor via `emitDataConstructor`); the composition validator rejects stacking at codegen time with a clear class-name error. Shared infrastructure is reusable for Phase 16 `@NoArgsConstructor` and Phase 17 `@RequiredArgsConstructor` without modification.

### Changed

- Dependency bumps absorbed from Dependabot: `@a-dev-kit` all-actions group (#58, 5 bumps) and all-dependencies group (#59, 16 bumps). TypeScript kept pinned at `^6.0.3` because TS 7 still breaks `pnpm lint` (eslint TS parser plugin) and `pnpm build` (tsup DTS emit).

## [1.8.0] - 2026-08-14

### Added

- **`@ExtensionMethod`** (Phase 14) — a class-level decorator that installs each listed helper class's static methods as instance methods on the decorated class prototype, with `this` forwarded as the first argument. TS equivalent of Java Lombok's `@ExtensionMethod`, with one honest divergence: this is a runtime prototype install scoped to the decorated class, not a compile-time source rewrite (TypeScript decorators can't rewrite arbitrary call sites). Options: `onConflict: 'error' | 'skip' | 'override'` (default `'error'` — fail fast, matching `@BuilderDefault` and `@Singular`), `include` / `exclude` filters. Non-function statics and reserved keys (`name`, `length`, `prototype`) are ignored. Conflict detection ignores `Object.prototype` members but catches methods you defined on the class or a non-`Object` ancestor. Records `{ helperName, methods }[]` under `MetadataKeys.EXTENSION_METHOD` for tooling introspection. Both `legacy` and `stage3` backends supported.

### Removed

- Phase 14 slot previously scheduled for `@SneakyThrows` — retired without shipping. TypeScript has no checked-exception system, so there is nothing to bypass; see [ADR-18](https://github.com/A-Dev-Kit/lombok-typescript-planning/blob/main/adr/0018-sneakythrows-not-shipping.md). The migration guide still documents the mapping. Later phase version numbers are unchanged.

## [1.7.0] - 2026-07-24

### Added

- **`Cleanup`** (Phase 13) — a field decorator that marks resources to be closed at dispose time. The enclosing class automatically implements `[Symbol.dispose]()`, so it works out of the box with TypeScript 5.2 `using`. Options: `Cleanup('methodName')` or `Cleanup({ method: 'end' })`; default is `close`. Fields are torn down in **reverse declaration order** (LIFO, matching Java's block-scope semantics). Null/undefined field values skip silently; a missing method throws a clear error. Best-effort teardown: one throwing field doesn't stop later ones, and the first error is rethrown. A pre-existing `[Symbol.dispose]()` is preserved and chained: user-defined runs first, an ancestor `Cleanup` install runs last (LIFO across inheritance). Sync only; `Symbol.asyncDispose` deferred.

## [1.6.0] - 2026-07-21

### Added

- **`@Synchronized`** (Phase 12) — an async mutex for methods, the TypeScript equivalent of Java Lombok's `@Synchronized`. Overlapping calls queue FIFO and run one at a time, preventing async read-modify-write races. Java parity: all `@Synchronized` methods on an instance share one lock (`'$lock'`) by default; `@Synchronized('name')` uses a separate named lock. Extension: `{ timeout: ms }` rejects a queued call with `SynchronizedTimeoutError` (exported) if the lock isn't acquired in time — a timed-out call never runs and the queue continues in order. Locks are per-instance (WeakMap) and garbage-collected with the instance. The wrapped method always returns a Promise; reentrant calls on the same lock deadlock (documented, with the un-decorated-private-method workaround). Static/class-level locks deferred.

## [1.5.0] - 2026-07-18

### Added

- **`@NullObject`** (Phase 11) — a class-level marker that documents a class is a safe do-nothing implementation of some contract. Takes an `{ of: Class }` option that is type-checked at decoration time (mirroring `@Adapter`'s pattern) and stored in metadata; tools can read it via the existing `getGoFMarkerMetadata(cls, MetadataKeys.NULL_OBJECT)` helper. Marker-only — no runtime behavior beyond one metadata write. Java Lombok has no equivalent; this is a GoF-only addition.

## [1.4.0] - 2026-07-11

### Added

- **`@Pool`** (Phase 10) — a class-level decorator that turns any class into a bounded Object Pool. Adds `Class.acquire()` / `Class.release(x)` statics to check out and return reusable instances. Options: `size` (required), `factory` (defaults to `new Class()`), `reset` (cleanup on release). `acquire()` throws `PoolExhaustedError` (also exported) when the pool is at capacity and all instances are leased; if `reset` throws, the instance is discarded rather than returned to the pool. A `Pooled<T>` type helper is exported for typed access. Object Pool is the [ADR-16](https://github.com/A-Dev-Kit/lombok-typescript-planning/blob/main/adr/0016-23-vs-24-gof-patterns.md) "24th GoF pattern" candidate.

## [1.3.0] - 2026-07-05

### Added

- **`@Singular`** (Phase 9) — mark an array field on a `@Builder` class to generate accumulator methods (`role()` add-one, `roles()` add-all, `clearRoles()`) instead of a single setter, the TypeScript equivalent of Java Lombok's `@Singular`. The add-one name is auto-singularized (`roles` → `role`) with an explicit `@Singular('person')` override for irregulars. Arrays only this release; errors at generate time on non-array fields, underivable names, or when combined with `@BuilderDefault`.

## [1.2.0] - 2026-07-04

### Added

- **`@BuilderDefault`** (Phase 8) — a field marker so `@Builder` keeps a field's initializer as the default when the builder omits it (the TypeScript equivalent of Java Lombok's `@Builder.Default`). Available on both `legacy` and `stage3` backends. The field must have an initializer, otherwise `lombok-ts generate` fails with a clear error.

## [1.1.0] - 2026-07-02

### Added

- **NestJS support built into the core package** via the `lombok-typescript/nestjs` entry point: `LombokModule`, `@LogNest`, `@MemoizeNest`, `@RetryNest`, and scope guidance. `@nestjs/common` and `@nestjs/core` are optional peer dependencies.
- Interop verification: `attw` (Are the Types Wrong) and `publint` gate the package `exports` map across node16 (CJS/ESM) and bundler resolution, in CI and via `pnpm check:exports`.

### Changed

- The NestJS integration is no longer a separate `@lombok-typescript/nestjs` package — it ships inside `lombok-typescript`. Import from `lombok-typescript/nestjs`.
- Docs: expanded the Java Lombok migration guide (constructors, `@SneakyThrows`, `@Cleanup`, `@SuperBuilder`, and previously-unmapped shipped decorators); fixed the public README CI badge; standardized install/import examples on the npm package name.

### Removed

- Standalone `@lombok-typescript/nestjs` package (folded into core).

## [1.0.1] - 2026-07-02

### Fixed

- npm tarball README: remove legacy `preview` dist-tag badge and install instructions (npm page only; no code changes)

## [1.0.0] - 2026-06-18

Phase 7 — NestJS satellite (batch queue slot 11).

### Added

- New package `@lombok-typescript/nestjs`: `LombokModule.forRoot()`, `@LogNest`, `@MemoizeNest`, `@RetryNest`, scope guidance
- Core: `registerLombokPlugin()` in `lombok-typescript/core`
- Docs: NestJS integration + Java Lombok + class-validator migration guides
- Example: `examples/nestjs` uses `LombokModule` and `@LogNest`

## [0.10.0] - 2026-06-24

Phase 6 — GoF marker decorators (batch queue slot 10).

### Added

- `@Adapter` — marker-only; documents API adaptation (`adapts` / `target` metadata)
- `@Bridge` — marker-only; Bridge pattern intent
- `@Facade` — marker-only; optional `subsystems` metadata
- `@Mediator` — marker-only; mediator role
- `@Interpreter` — marker-only; DSL interpreter role
- `getGoFMarkerMetadata()` helper for tooling/tests
- Docs-site Phase 6 pages; plain-ts `markers` example module

## [0.9.0] - 2026-06-18

Phase 5 — TypeScript utility decorators (batch queue slot 9).

### Added

- `@Retry` — async method retry with backoff, `retryIf`, and per-attempt timeout
- `@Debounce` / `@Throttle` — method rate limiting with `cancel()` / `flush()`
- `@Trace` — class/method entry-exit logging with redaction and timing
- `@DeepFreeze` — recursive freeze on construction
- `@Validate` — field/class schema validation via optional adapters
- `@Serializable` / `.Exclude` / `.Alias` / `.Transform` — codegen `toJSON` / `fromJSON`
- Validator subpaths: `lombok-typescript/validators/{zod,yup,class-validator}`
- Builder `build()` emits validation when fields use `@Validate`

## [0.8.0] - 2026-06-18

Phase 4b — published on [GitHub Packages](https://github.com/A-Dev-Kit/lombok-typescript/pkgs/npm/lombok-typescript) (batch queue slot 8).

### Added

- `@Wraps` — GoF Decorator with `protected inner` delegation
- `@TemplateMethod` / `@Hook` — codegen template method with ordered hook steps
- `@AbstractFactory` — Helper scaffold emitting abstract product factory methods
- `@Visitor` / `@Visitable` — hybrid double-dispatch with generated `accept(visitor)`

## [0.7.0] - 2026-06-18

Phase 4a — published on [GitHub Packages](https://github.com/A-Dev-Kit/lombok-typescript/pkgs/npm/lombok-typescript) (batch queue slot 7).

### Added

- `@Flyweight` — shared instance pool keyed by constructor arguments
- `@Proxy` — runtime method interception with before/after hooks
- `@Composite` — tree API with add, remove, traverse, and child iteration

## [0.6.0] - 2026-06-18

Phase 3b — **not published to npm** (batch queue slot 6).

### Added

- `@Memento` / `@Memento.Exclude` — snapshot and restore instance state
- `@Observable` / `@Observer` / `@Observable.Derived` — reactive property subscriptions
- `@ChainOfResponsibility` / `@Handler` — ordered handler dispatch via `handle()`
- `@Iterable` / `@IterateOver` — `Symbol.iterator` over a collection field
- RxJS adapter: `lombok-typescript/observers/rxjs` (`toObservable`)
- MobX adapter: `lombok-typescript/observers/mobx` (`makeLombokObservable`, `toMobxObservable`)

## [0.5.0] - 2026-06-18

Phase 3a — **not published to npm** (batch queue slot 5).

### Added

- `@Strategy` / `StrategyRegistry` — two-level swappable algorithm registry
- `@State` / `@Transition` — finite state machine with runtime transition guards
- `@Command` / `CommandHistory` — command objects with execute/undo/redo stacks

## [0.4.0] - 2026-06-16

Phase 2c — **not published to npm** (batch queue slot 4).

### Added

- `@FieldDefaults` — class-level readonly defaults for codegen
- `@Delegate` — forward explicit method names to a field
- Working `lombok-ts watch` — regenerates companions on file changes

## [0.3.0] - 2026-06-16

Phase 2b — **not published to npm** (batch queue slot 3).

### Added

- `@Log` — runtime method logging (console by default)
- `@Accessors` — fluent/chained setter style for codegen
- `@UtilityClass` — uninstantiable utility holder classes

## [0.2.0] - 2026-06-16

Phase 2a — **not published to npm** (batch queue slot 2).

### Added

- `@Value` — immutable data class (getters, `with*`, `equals`, `toString`)
- `@With` — per-field or class-level copy helpers
- `@Equals` / `@EqualsExclude` — standalone equality generation
- `@Getter` / `@Setter` — field-level accessor codegen
- Composition guard: `@Data` + `@Value` rejected at codegen time

## [0.1.0] - 2026-06-15

Code-complete Phase 1 release. **Not published to npm** — batch publish deferred per release queue policy.

### Added

- Phase 1 decorators: `@NonNull`, `@ToString`, `@Builder`, `@Data`, `@Singleton`, `@Prototype`, `@Factory`, `@Memoize`
- Dual backend exports via `lombok-typescript/legacy` and `lombok-typescript/stage3`
- Codegen emitters with `.lombok.ts` companions and `.lombok.d.ts` declaration merging
- Example apps: `examples/plain-ts`, `examples/nestjs`
- VitePress documentation site and GitHub Pages deploy workflow
- Release workflow placeholder (disabled until batch publish queue is full)

[Unreleased]: https://github.com/A-Dev-Kit/lombok-typescript/compare/v1.9.0...HEAD
[1.9.0]: https://github.com/A-Dev-Kit/lombok-typescript/compare/v1.8.0...v1.9.0
[1.8.0]: https://github.com/A-Dev-Kit/lombok-typescript/compare/v1.7.0...v1.8.0
[1.0.0]: https://github.com/A-Dev-Kit/lombok-typescript/compare/v0.10.0...v1.0.0
[0.10.0]: https://github.com/A-Dev-Kit/lombok-typescript/compare/v0.9.0...v0.10.0
[0.4.0]: https://github.com/A-Dev-Kit/lombok-typescript/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/A-Dev-Kit/lombok-typescript/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/A-Dev-Kit/lombok-typescript/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/A-Dev-Kit/lombok-typescript/releases/tag/v0.1.0
