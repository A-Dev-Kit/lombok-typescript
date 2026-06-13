# lombok-typescript

A TypeScript take on Java's [Project Lombok](https://projectlombok.org/), with a few extras: Gang-of-Four design patterns exposed as decorators, and support for both the legacy `experimentalDecorators` standard and the modern Stage 3 ECMAScript decorators.

It's not on npm yet. Right now what's in is the scaffolding, the codegen pipeline, the `lombok-ts` CLI, and tests. Actual decorator implementations come next.

## What it'll look like

```ts
import { Data, Builder, NonNull } from 'lombok-typescript/legacy';
// or 'lombok-typescript/stage3' if you've moved on

@Data
@Builder
class User {
  @NonNull name: string;
  age: number;
}

const u = User.builder().name('John').age(25).build();
console.log(u.toString()); // User(name=John, age=25)
```

## Docs

- [docs/PATTERNS.md](./docs/PATTERNS.md) for the full decorator catalog (21 from Lombok, 23 GoF patterns, plus a few TS-only extras)
- [docs/MVP.md](./docs/MVP.md) for the roadmap and what ships when
- [docs/adr/](./docs/adr/) for the open architectural decisions (17 of them, mostly still up in the air)
- [docs/FEATURES.md](./docs/FEATURES.md) was the original Lombok-only spec, kept around for history

## Working on it

Needs Node 22+ and pnpm 10. There's an `.nvmrc` pinned to 24.

```bash
pnpm install
pnpm test
pnpm test:coverage
pnpm typecheck
pnpm lint
pnpm build
```

## How it's organized

Two backend implementations live side-by-side under `src/legacy/` (wraps `reflect-metadata`) and `src/stage3/` (uses `Symbol.metadata`). Both implement a common `Backend` interface from `src/core/`, so once the actual decorators land they can be authored once and exposed under both paths. The codegen pipeline in `src/codegen/` uses ts-morph to read decorated classes and write companion files. The `lombok-ts` CLI in `src/cli/` wires it all up.

## License

[MIT](./LICENSE)
