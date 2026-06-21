# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/A-Dev-Kit/lombok-typescript/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/A-Dev-Kit/lombok-typescript/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/A-Dev-Kit/lombok-typescript/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/A-Dev-Kit/lombok-typescript/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/A-Dev-Kit/lombok-typescript/releases/tag/v0.1.0
