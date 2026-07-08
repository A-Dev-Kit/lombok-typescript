# From Java Lombok

A reference for Java developers moving to Node / TypeScript. Each common Lombok
annotation maps to a lombok-typescript equivalent, a TypeScript-native workaround, or a
clearly-labeled _planned_ feature.

## Annotation map

| Java Lombok                                  | lombok-typescript                 | Notes                                                                            |
| -------------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------- |
| `@Data`                                      | `@Data`                           | Codegen + `applyAllGenerated`                                                    |
| `@Value`                                     | `@Value`                          | Immutable; `readonly` fields. Closest to a Java `record`                         |
| `@Builder`                                   | `@Builder`                        | `Class.builder()` fluent API                                                     |
| `@SuperBuilder`                              | `@Builder`                        | Single-level today; inheritance builders _planned_ (Phase 9)                     |
| `@Builder.Default`                           | `@BuilderDefault`                 | Keeps the field initializer when the builder omits the field                     |
| `@Singular`                                  | `@Singular`                       | Accumulator builder methods (`role()`/`roles()`/`clearRoles()`) for array fields |
| `@Getter` / `@Setter`                        | `@Getter` / `@Setter`             | Codegen                                                                          |
| `@Getter(lazy = true)`                       | `@Memoize`                        | Caches the computed value on first access                                        |
| `@ToString`                                  | `@ToString`                       | Codegen `toString()`                                                             |
| `@EqualsAndHashCode`                         | `@Equals`                         | Generates `equals()` + `toHash()` (TS name for Java's `hashCode()`)              |
| `@With`                                      | `@With`                           | Immutable `withX()` codegen                                                      |
| `@Accessors`                                 | `@Accessors`                      | Fluent / chained accessor style                                                  |
| `@Delegate`                                  | `@Delegate`                       | Forward methods to a delegate field                                              |
| `@FieldDefaults`                             | `@FieldDefaults`                  | Default field visibility / `readonly`                                            |
| `@UtilityClass`                              | `@UtilityClass`                   | Static-only holder                                                               |
| `@Slf4j` / `@Log`                            | `@Log` (or `@LogNest` for NestJS) | BYOL logger adapters                                                             |
| `@NonNull`                                   | `@NonNull`                        | Runtime null checks                                                              |
| `@NoArgsConstructor` / `@AllArgsConstructor` | —                                 | Not needed — use `@Builder`, field initializers, or object literals              |
| `@RequiredArgsConstructor`                   | Nest constructor DI               | In NestJS, `@Injectable()` classes get constructor injection natively            |
| `@SneakyThrows`                              | —                                 | Not needed — TypeScript has no checked exceptions                                |
| `@Cleanup`                                   | —                                 | Use `try/finally` or `using` (TS 5.2 explicit resource management)               |
| `@Synchronized`                              | —                                 | _planned_ (Phase 12); JS is single-threaded, so rarely needed                    |

## Workflow differences

1. Run `lombok-ts generate` for codegen decorators (`@Data`, `@Builder`, `@Getter`, …).
2. Call `applyAllGenerated()` at startup (see [Getting started](/guide/getting-started)).
3. Choose **legacy** decorators for NestJS (`experimentalDecorators: true`), or **stage3**
   for TS 6.0+ without `experimentalDecorators`.

Unlike Java, where annotations are processed at compile time by the Lombok agent,
lombok-typescript splits the work: codegen decorators emit companion files via the CLI,
while runtime decorators (`@Memoize`, `@Retry`, `@Log`, …) wrap behavior directly.

## NestJS users

NestJS support is **built into the core package** — import from
[`lombok-typescript/nestjs`](/guide/nestjs-integration) for `LombokModule`, `@LogNest`,
`@MemoizeNest`, and `@RetryNest`. No separate install; `@nestjs/common` and `@nestjs/core`
are optional peers you already have in a Nest app.
