# NestJS integration

Phase 7 ships **`@lombok-typescript/nestjs`** — an opt-in satellite (ADR-14 Option 3). The core `lombok-typescript` package has **no** Nest dependency.

## Install

```bash
npm install lombok-typescript @lombok-typescript/nestjs @nestjs/common @nestjs/core reflect-metadata
```

## Bootstrap

```typescript
import { Module } from '@nestjs/common';
import { LombokModule } from '@lombok-typescript/nestjs';

@Module({
  imports: [
    LombokModule.forRoot({
      logAdapter: 'nest',
      defaultProviderScope: 'DEFAULT',
    }),
  ],
})
export class AppModule {}
```

## Decorators

| Export                   | Purpose                                     |
| ------------------------ | ------------------------------------------- |
| `LombokModule.forRoot()` | Global config token (`LOMBOK_NEST_CONFIG`)  |
| `@LogNest`               | `@Log` using Nest `Logger`                  |
| `@MemoizeNest`           | `@Memoize` with REQUEST-scope guidance      |
| `@RetryNest`             | `@Retry` with interceptor composition notes |
| `NEST_SCOPE_GUIDANCE`    | Scope advisory table                        |

Runnable example: [examples/nestjs](https://github.com/A-Dev-Kit/lombok-typescript/tree/main/examples/nestjs).

## Provider scope

| Decorator                   | Recommended `@Injectable` scope | Notes                                         |
| --------------------------- | ------------------------------- | --------------------------------------------- |
| `@Singleton`                | `DEFAULT`                       | One instance per Nest container               |
| `@Memoize` / `@MemoizeNest` | `REQUEST` for per-request cache | Singleton + memoize can leak request data     |
| `@Flyweight`                | `DEFAULT`                       | Pool is process-wide                          |
| `@Retry` / `@RetryNest`     | `DEFAULT`                       | Method-level; use interceptors for HTTP retry |

## Interceptors

`@RetryNest` and `@MemoizeNest` run **inside** the method body. Nest HTTP interceptors wrap the handler pipeline — use both when you need transport-level and business-level policies.

See also: [From Java Lombok](/guide/migration-java-lombok), [From class-validator](/guide/migration-class-validator).
