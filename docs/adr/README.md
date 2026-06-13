# Architecture Decision Records

Open and decided architectural questions for `lombok-typescript`. One file per decision, following the standard ADR format: Status, Context, Options, Trade-offs, Recommendation, Decision, Date decided.

How to use these: read in order (the early ones gate everything else), pick an option, fill in the Decision line, flip Status to Decided, and put a date on it. Don't retroactively renumber if you reverse a decision; create a new ADR that supersedes the old one and mark the old one `Status: Superseded by ADR-NN`.

## Index

### Decided

| #   | Title                                              | Decided on |
| --- | -------------------------------------------------- | ---------- |
| 01  | [Decorator standard](./0001-decorator-standard.md) | 2026-06-12 |

### Open, architectural

| #   | Title                                                                                                    |
| --- | -------------------------------------------------------------------------------------------------------- |
| 02  | [Metadata strategy](./0002-metadata-strategy.md)                                                         |
| 03  | [Runtime vs codegen split](./0003-runtime-vs-codegen-split.md)                                           |
| 04  | [Codegen execution model](./0004-codegen-execution-model.md)                                             |
| 05  | [Generated-code consumption](./0005-generated-code-consumption.md)                                       |
| 06  | [Field detection under useDefineForClassFields](./0006-field-detection-under-usedefineforclassfields.md) |
| 07  | [Decorator composition rules](./0007-decorator-composition-rules.md)                                     |
| 08  | [MVP / release scope](./0008-mvp-release-scope.md)                                                       |
| 09  | [Logger backend dependency strategy](./0009-logger-backend-dependency-strategy.md)                       |
| 10  | [Validation library coupling](./0010-validation-library-coupling.md)                                     |
| 11  | [CLI surface and config loader](./0011-cli-surface-and-config-loader.md)                                 |

### Open, vision

| #   | Title                                                                    |
| --- | ------------------------------------------------------------------------ |
| 12  | [Library positioning](./0012-library-positioning.md)                     |
| 13  | [GoF coverage strategy](./0013-gof-coverage-strategy.md)                 |
| 14  | [NestJS compatibility strategy](./0014-nestjs-compatibility-strategy.md) |
| 15  | [GoF Decorator pattern naming](./0015-gof-decorator-pattern-naming.md)   |
| 16  | [23 vs 24 GoF patterns](./0016-23-vs-24-gof-patterns.md)                 |
| 17  | [Open-source governance](./0017-open-source-governance.md)               |

## Related docs

The decorator catalog lives in [PATTERNS.md](../PATTERNS.md). The phasing and roadmap are in [MVP.md](../MVP.md). The original Lombok-only spec is in [FEATURES.md](../FEATURES.md).
