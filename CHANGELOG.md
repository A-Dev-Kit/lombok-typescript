# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Expanded VitePress documentation (guides, architecture, decorator reference)
- Codecov configuration and CONTRIBUTING setup notes for coverage badge

## [0.1.0] - 2026-06-15

Code-complete Phase 1 release. **Not published to npm** — batch publish deferred per release queue policy.

### Added

- Phase 1 decorators: `@NonNull`, `@ToString`, `@Builder`, `@Data`, `@Singleton`, `@Prototype`, `@Factory`, `@Memoize`
- Dual backend exports via `lombok-typescript/legacy` and `lombok-typescript/stage3`
- Codegen emitters with `.lombok.ts` companions and `.lombok.d.ts` declaration merging
- Example apps: `examples/plain-ts`, `examples/nestjs`
- VitePress documentation site and GitHub Pages deploy workflow
- Release workflow placeholder (disabled until batch publish queue is full)

[Unreleased]: https://github.com/A-Dev-Kit/lombok-typescript/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/A-Dev-Kit/lombok-typescript/releases/tag/v0.1.0
