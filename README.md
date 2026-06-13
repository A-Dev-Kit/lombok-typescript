# lombok-typescript

[![CI](https://github.com/A-Dev-Kit/lombok-typescript/actions/workflows/ci.yml/badge.svg)](https://github.com/A-Dev-Kit/lombok-typescript/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![npm version](https://img.shields.io/npm/v/lombok-typescript.svg)](https://www.npmjs.com/package/lombok-typescript)
[![npm downloads](https://img.shields.io/npm/dm/lombok-typescript.svg)](https://www.npmjs.com/package/lombok-typescript)
[![coverage](https://img.shields.io/codecov/c/github/A-Dev-Kit/lombok-typescript/main)](https://codecov.io/gh/A-Dev-Kit/lombok-typescript)
[![Node](https://img.shields.io/badge/node-%E2%89%A522-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-%E2%89%A55.0-blue?logo=typescript)](https://www.typescriptlang.org/)

A TypeScript port of Java's [Project Lombok](https://projectlombok.org/) with a few extras: Gang-of-Four design patterns exposed as decorators. Both the legacy `experimentalDecorators` standard and the modern Stage 3 ECMAScript decorators are supported, side-by-side.

## Status

Current version: `0.1.0-pre`. Not on npm yet.

The plumbing is in place: dual decorator backend, ts-morph powered codegen, the `lombok-ts` CLI, configuration loader. The actual decorators (`@Data`, `@Builder`, `@NonNull`, `@Singleton`, and the rest) ship in v0.1.

## Install

Once published you'll be able to install via any of these:

```bash
npm install lombok-typescript
pnpm add lombok-typescript
yarn add lombok-typescript
bun add lombok-typescript
```

The package isn't on npm yet, so the commands above will fail until v0.1 ships.

## Pick a decorator standard

The library ships two backends. Pick whichever matches your project's tsconfig.

### Legacy `experimentalDecorators`

For NestJS, TypeORM, class-validator, and most existing TypeScript projects.

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "target": "ES2022",
  },
}
```

Imports come from `lombok-typescript/legacy`:

```ts
import { Data, Builder, NonNull } from 'lombok-typescript/legacy';
```

### Stage 3 ECMAScript decorators

For TS 5.0+ projects that have moved off `experimentalDecorators`.

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "experimentalDecorators": false,
    "target": "ES2023",
  },
}
```

Imports come from `lombok-typescript/stage3`:

```ts
import { Data, Builder, NonNull } from 'lombok-typescript/stage3';
```

Stage 3 has no parameter decorators in the spec. Use the legacy backend if you need them.

## Configure

Drop a `lombok.config.ts` at the root of your project. The fastest way:

```bash
npx lombok-ts init
```

That writes a starter file you can trim. Minimal configuration looks like:

```ts
// lombok.config.ts
import { defineConfig } from 'lombok-typescript';

export default defineConfig({
  backend: 'legacy', // or 'stage3', or 'auto' to detect from your tsconfig
  codegen: {
    outputDir: '.lombok',
    include: ['src/**/*.ts'],
    exclude: ['node_modules', '**/*.test.ts', '**/*.spec.ts'],
    tsConfigPath: 'tsconfig.json',
  },
});
```

Every field is documented in [docs/example/02-lombok-config.md](./docs/example/02-lombok-config.md).

## Use the decorators

> **Phase 1+ preview.** The snippets below describe the planned API. None of these decorators are implemented yet; they ship in Phase 1.

### Data classes

```ts
import { Data, Builder, NonNull } from 'lombok-typescript/legacy';

@Data
@Builder
class User {
  @NonNull name: string;
  age: number;
  email?: string;
}

const u = User.builder().name('John').age(25).build();
console.log(u.toString()); // User(name=John, age=25)
console.log(u.equals(User.builder().name('John').age(25).build())); // true
```

More on data classes in [docs/example/04-data-classes.md](./docs/example/04-data-classes.md).

### Creational patterns

```ts
import { Singleton, Factory, Prototype } from 'lombok-typescript/legacy';

@Singleton
class AppConfig {
  dbUrl = 'postgres://localhost/db';
}
new AppConfig() === new AppConfig(); // true

@Factory('email')
class EmailNotifier {}
@Factory('sms')
class SmsNotifier {}
const notifier = Factory.create('email'); // EmailNotifier instance
```

More in [docs/example/06-creational-patterns.md](./docs/example/06-creational-patterns.md).

### Method wrappers

```ts
import { Memoize, Retry } from 'lombok-typescript/legacy';

class Api {
  @Memoize({ ttl: 60_000 })
  async fetchUser(id: string) {
    return await fetch(`/users/${id}`).then((r) => r.json());
  }

  @Retry({ attempts: 3, backoff: 'exponential' })
  async sendEmail(to: string) {
    return await mailer.send(to);
  }
}
```

More in [docs/example/07-method-wrappers.md](./docs/example/07-method-wrappers.md).

## CLI

The `lombok-ts` CLI ships with the package and runs against your project from `node_modules/.bin/lombok-ts` (or via `npx lombok-ts`).

| Command              | What it does                                                  |
| -------------------- | ------------------------------------------------------------- |
| `lombok-ts generate` | Run codegen against your source files                         |
| `lombok-ts watch`    | Re-run on file change. Phase 2, currently a stub.             |
| `lombok-ts init`     | Drop a starter `lombok.config.ts` in the current directory    |
| `lombok-ts clean`    | Remove generated `.lombok/`, `dist/`, `coverage/` directories |

Full walkthrough in [docs/example/03-cli.md](./docs/example/03-cli.md).

## Documentation

- [docs/example/](./docs/example/) walkthroughs grouped by what you're trying to do

## License

[MIT](./LICENSE)
