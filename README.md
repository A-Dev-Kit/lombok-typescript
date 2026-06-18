# lombok-typescript

[![CI](https://github.com/A-Dev-Kit/lombok-typescript/actions/workflows/ci.yml/badge.svg)](https://github.com/A-Dev-Kit/lombok-typescript/actions/workflows/ci.yml)
[![Docs](https://github.com/A-Dev-Kit/lombok-typescript/actions/workflows/docs.yml/badge.svg)](https://a-dev-kit.github.io/lombok-typescript/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![version](<https://img.shields.io/badge/npm-0.4.0%20(not%20published)-lightgrey>)](https://github.com/A-Dev-Kit/lombok-typescript)
[![coverage](https://img.shields.io/codecov/c/github/A-Dev-Kit/lombok-typescript/main?label=coverage)](https://codecov.io/gh/A-Dev-Kit/lombok-typescript)
[![Node](https://img.shields.io/badge/node-%E2%89%A522-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-%E2%89%A55.0-blue?logo=typescript)](https://www.typescriptlang.org/)

**Documentation:** [a-dev-kit.github.io/lombok-typescript](https://a-dev-kit.github.io/lombok-typescript/) — full guides and decorator reference. This README is a quick technical entry point.

A TypeScript port of Java's [Project Lombok](https://projectlombok.org/) with Gang-of-Four design patterns as decorators. Legacy `experimentalDecorators` and Stage 3 ECMAScript decorators are supported side-by-side.

## Status

**Version `0.4.0` — Phase 2 code-complete, not on npm yet.** Batch publish is deferred until the full release queue is ready. See [CHANGELOG.md](./CHANGELOG.md).

**Phase 1:** `@NonNull`, `@ToString`, `@Builder`, `@Data`, `@Singleton`, `@Prototype`, `@Factory`, `@Memoize`

**Phase 2 (v0.2.0–0.4.0):** `@Value`, `@With`, `@Equals`, `@Getter`, `@Setter`, `@Log`, `@Accessors`, `@UtilityClass`, `@FieldDefaults`, `@Delegate`, plus CLI `watch` mode.

## Install

```bash
# Not on npm yet — clone and link locally:
git clone https://github.com/A-Dev-Kit/lombok-typescript.git
cd lombok-typescript && pnpm install && pnpm build && pnpm link --global

# When published (preview tag):
npm install lombok-typescript@preview
```

## Pick a decorator standard

### Legacy (`lombok-typescript/legacy`)

For NestJS, TypeORM, and most existing decorator-based projects.

```jsonc
{ "compilerOptions": { "experimentalDecorators": true, "emitDecoratorMetadata": true } }
```

### Stage 3 (`lombok-typescript/stage3`)

For TS 5.0+ projects without `experimentalDecorators`.

```jsonc
{ "compilerOptions": { "experimentalDecorators": false } }
```

## Quick start

```bash
npx lombok-ts init
npx lombok-ts generate
```

```ts
import { Data, Builder, NonNull, Memoize, Singleton } from 'lombok-typescript/legacy';

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
