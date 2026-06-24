# lombok-typescript

[![CI](https://github.com/A-Dev-Kit/lombok-typescript/actions/workflows/ci.yml/badge.svg)](https://github.com/A-Dev-Kit/lombok-typescript/actions/workflows/ci.yml)
[![Docs](https://github.com/A-Dev-Kit/lombok-typescript/actions/workflows/docs.yml/badge.svg)](https://a-dev-kit.github.io/lombok-typescript/)
[![Publish GitHub Packages](https://github.com/A-Dev-Kit/lombok-typescript/actions/workflows/publish-github-packages.yml/badge.svg)](https://github.com/A-Dev-Kit/lombok-typescript/actions/workflows/publish-github-packages.yml)
[![GitHub Packages](https://img.shields.io/github/v/tag/A-Dev-Kit/lombok-typescript?label=GitHub%20Packages&logo=github&color=24292f)](https://github.com/A-Dev-Kit/lombok-typescript/pkgs/npm/lombok-typescript)
[![npm](https://img.shields.io/npm/v/lombok-typescript?label=npm&logo=npm&color=CB3837)](https://www.npmjs.com/package/lombok-typescript)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![coverage](https://img.shields.io/codecov/c/github/A-Dev-Kit/lombok-typescript/main?label=coverage)](https://codecov.io/gh/A-Dev-Kit/lombok-typescript)
[![Node](https://img.shields.io/badge/node-%E2%89%A522-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-%E2%89%A56.0-blue?logo=typescript)](https://www.typescriptlang.org/)

**Documentation:** [a-dev-kit.github.io/lombok-typescript](https://a-dev-kit.github.io/lombok-typescript/) — full guides and decorator reference. This README is a quick technical entry point.

A TypeScript port of Java's [Project Lombok](https://projectlombok.org/) with Gang-of-Four design patterns as decorators. Legacy `experimentalDecorators` and Stage 3 ECMAScript decorators are supported side-by-side.

## Status

**Version `0.10.0` — Phase 6 complete.** Latest on [GitHub Packages](https://github.com/A-Dev-Kit/lombok-typescript/pkgs/npm/lombok-typescript) (`@a-dev-kit/lombok-typescript@0.10.0`). **npmjs.org:** daily backfill in progress — `lombok-typescript@preview` advances one version per day (`0.1.0` → `0.10.0`). Git tags do **not** trigger npm publish during backfill. See [CHANGELOG.md](./CHANGELOG.md).

**Phase 1:** `@NonNull`, `@ToString`, `@Builder`, `@Data`, `@Singleton`, `@Prototype`, `@Factory`, `@Memoize`

**Phase 2 (v0.2.0–v0.4.0):** `@Value`, `@With`, `@Equals`, `@Getter`, `@Setter`, `@Log`, `@Accessors`, `@UtilityClass`, `@FieldDefaults`, `@Delegate`, plus CLI `watch` mode.

**Phase 3 (v0.5.0–v0.6.0):** `@Strategy`, `@State`, `@Command`, `@Memento`, `@Observable`, `@ChainOfResponsibility`, `@Iterable`, observer adapters.

**Phase 4a (v0.7.0):** `@Flyweight`, `@Proxy`, `@Composite`.

**Phase 4b (v0.8.0):** `@Wraps`, `@Hook`, `@TemplateMethod`, `@AbstractFactory`, `@Visitor` / `@Visitable`.

**Phase 5 (v0.9.0):** `@Retry`, `@Debounce`, `@Throttle`, `@Trace`, `@DeepFreeze`, `@Validate`, `@Serializable`.

**Phase 6 (v0.10.0):** `@Adapter`, `@Bridge`, `@Facade`, `@Mediator`, `@Interpreter` (marker-only).

## Install

From **GitHub Packages** (active today):

```bash
# .npmrc in your project (or user-level)
echo "@a-dev-kit:registry=https://npm.pkg.github.com" >> .npmrc

# Authenticate — use a GitHub PAT with read:packages (local dev)
# npm login --registry=https://npm.pkg.github.com

pnpm add @a-dev-kit/lombok-typescript@0.10.0
# or: npm install @a-dev-kit/lombok-typescript@0.10.0
```

Pin any released version (`0.1.0` through `0.10.0`). See [CONTRIBUTING.md — Release process](./CONTRIBUTING.md#release-process).

**npmjs.org** (daily backfill — `preview` tag advances through `0.10.0`):

```bash
npm install lombok-typescript@preview
# or pin: npm install lombok-typescript@0.2.0
```

During backfill, one queue version (`0.2.0`–`0.10.0`) publishes per day via `npm-daily-backfill.yml`. After backfill completes, new git tags resume npm publish on `release.yml`.

Local development:

```bash
git clone https://github.com/A-Dev-Kit/lombok-typescript.git
cd lombok-typescript && pnpm install && pnpm build && pnpm link --global
```

## Pick a decorator standard

### Legacy (`@a-dev-kit/lombok-typescript/legacy`)

For NestJS, TypeORM, and most existing decorator-based projects.

```jsonc
{ "compilerOptions": { "experimentalDecorators": true, "emitDecoratorMetadata": true } }
```

### Stage 3 (`@a-dev-kit/lombok-typescript/stage3`)

For TS 6.0+ projects without `experimentalDecorators`.

```jsonc
{ "compilerOptions": { "experimentalDecorators": false } }
```

## Quick start

```bash
npx lombok-ts init
npx lombok-ts generate
```

```ts
import { Data, Builder, NonNull, Memoize, Singleton } from '@a-dev-kit/lombok-typescript/legacy';

@Data
@Builder
class User {
  @NonNull name!: string;
  age!: number;
}

@Singleton
class Cache {
  @Memoize()
  get(key: string) {
    return key;
  }
}
```

After codegen, call `applyAllGenerated` from the `.lombok/` companion file. See the [getting started guide](https://a-dev-kit.github.io/lombok-typescript/guide/getting-started).

## CLI

| Command              | Description                                   |
| -------------------- | --------------------------------------------- |
| `lombok-ts generate` | Emit `.lombok.ts` + `.lombok.d.ts` companions |
| `lombok-ts init`     | Create `lombok.config.ts`                     |
| `lombok-ts clean`    | Remove `.lombok/`, `dist/`, `coverage/`       |
| `lombok-ts watch`    | Watch sources and regenerate on change        |

## Examples

- [examples/plain-ts](./examples/plain-ts/) — legacy backend + codegen
- [examples/nestjs](./examples/nestjs/) — `@Injectable()` with `@Singleton`, `@Factory`, `@Memoize`

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Tests require **95%+** coverage on changed code. Docs: `pnpm --dir docs-site dev`.

## License

[MIT](./LICENSE)
