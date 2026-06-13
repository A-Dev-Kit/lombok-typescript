# Architecture Decision Records (ADRs)

> ADR-lite log of the open and decided architectural questions for `lombok-typescript`.

Each ADR captures one decision with: Status, Context, Options, Trade-offs, Recommendation, and a Decision line for the maintainer to fill in.

## How to use

1. Read each ADR in order — early ADRs (01–07) gate implementation work
2. Discuss the **Options** and **Trade-offs**
3. Either accept the **Recommendation** or pick a different option in the **Decision** line
4. Update **Status** from `Open` to `Decided` and fill in **Date decided**
5. The decision becomes binding for downstream phases; revisiting requires a new ADR (do not retroactively renumber)

## Index

### Decided

| #   | Title                                              | Decided on |
| --- | -------------------------------------------------- | ---------- |
| 01  | [Decorator standard](./0001-decorator-standard.md) | 2026-06-12 |

### Open — architectural

| #   | Title                                                                                                    |
| --- | -------------------------------------------------------------------------------------------------------- |
| 02  | [Metadata strategy](./0002-metadata-strategy.md)                                                         |
| 03  | [Runtime vs codegen split rules](./0003-runtime-vs-codegen-split.md)                                     |
| 04  | [Codegen execution model](./0004-codegen-execution-model.md)                                             |
| 05  | [Generated-code consumption](./0005-generated-code-consumption.md)                                       |
| 06  | [Field detection under useDefineForClassFields](./0006-field-detection-under-usedefineforclassfields.md) |
| 07  | [Decorator composition rules](./0007-decorator-composition-rules.md)                                     |
| 08  | [MVP / release scope](./0008-mvp-release-scope.md)                                                       |
| 09  | [Logger backend dependency strategy](./0009-logger-backend-dependency-strategy.md)                       |
| 10  | [Validation library coupling](./0010-validation-library-coupling.md)                                     |
| 11  | [CLI surface and config loader](./0011-cli-surface-and-config-loader.md)                                 |

### Open — vision-driven

| #   | Title                                                                    |
| --- | ------------------------------------------------------------------------ |
| 12  | [Library positioning](./0012-library-positioning.md)                     |
| 13  | [GoF coverage strategy](./0013-gof-coverage-strategy.md)                 |
| 14  | [NestJS compatibility strategy](./0014-nestjs-compatibility-strategy.md) |
| 15  | [GoF Decorator pattern naming](./0015-gof-decorator-pattern-naming.md)   |
| 16  | [23 vs 24 GoF patterns](./0016-23-vs-24-gof-patterns.md)                 |
| 17  | [Open-source governance](./0017-open-source-governance.md)               |

## Cross-references

- Decorator catalog → [../PATTERNS.md](../PATTERNS.md)
- Phasing & MVP scope → [../MVP.md](../MVP.md)
- Original Lombok-only spec → [../FEATURES.md](../FEATURES.md)

## ADR template

```markdown
# ADR-NN: <title>

- **Status:** Open | Decided | Superseded
- **Context:** <why this matters>
- **Options:** <bulleted list>
- **Trade-offs:** <table or bullets>
- **Recommendation:** <pick + 1-2 line rationale>
- **Decision:** _<blank for user>_
- **Date decided:** _<blank>_
```

Add new questions as ADR-18, ADR-19, etc. Do not retroactively renumber. Reversing a decision creates a new ADR that supersedes the old (mark old `Status: Superseded by ADR-NN`).
