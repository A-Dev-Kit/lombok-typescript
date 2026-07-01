# From Java Lombok

Map common Java Lombok annotations to lombok-typescript equivalents.

| Java Lombok           | lombok-typescript           | Notes                         |
| --------------------- | --------------------------- | ----------------------------- |
| `@Data`               | `@Data`                     | Codegen + `applyAllGenerated` |
| `@Value`              | `@Value`                    | Immutable; readonly fields    |
| `@Builder`            | `@Builder`                  | `Class.builder()` fluent API  |
| `@Builder.Default`    | —                           | **v1.1.0** (Phase 8)          |
| `@Singular`           | —                           | **v1.2.0** (Phase 9)          |
| `@Getter` / `@Setter` | `@Getter` / `@Setter`       | Codegen                       |
| `@Slf4j` / `@Log`     | `@Log` or `@LogNest` (Nest) | BYOL logger adapters          |
| `@NonNull`            | `@NonNull`                  | Runtime checks                |
| `@EqualsAndHashCode`  | `@Equals`                   | `equals()` + `toHash()`       |
| `@With`               | `@With`                     | Immutable `withX()` codegen   |
| `@UtilityClass`       | `@UtilityClass`             | Static-only holder            |
| `@FieldDefaults`      | `@FieldDefaults`            | Default visibility modifiers  |
| `@Synchronized`       | —                           | **v1.5.0** (Phase 12)         |

## Workflow differences

1. Run `lombok-ts generate` for codegen decorators (`@Data`, `@Builder`, …).
2. Call `applyAllGenerated()` at startup (see [Getting started](/guide/getting-started)).
3. Choose **legacy** decorators for NestJS (`experimentalDecorators: true`).

## NestJS users

Install [`@lombok-typescript/nestjs`](/guide/nestjs-integration) for `LombokModule` and `@LogNest`.
