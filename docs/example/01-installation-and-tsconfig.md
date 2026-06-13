# Installation and tsconfig

Getting `lombok-typescript` into your project, then making sure your `tsconfig.json` is set up for the decorator standard you're using.

## Install

Once published, pick whatever package manager your project uses:

```bash
npm install lombok-typescript
```

```bash
pnpm add lombok-typescript
```

```bash
yarn add lombok-typescript
```

```bash
bun add lombok-typescript
```

The library has a couple of runtime dependencies (`reflect-metadata`, `ts-morph`, `cac`, `bundle-require`) that come in automatically. There's a peer dependency on TypeScript `>=5.0`. Node `>=22` is required.

## Sub-path imports

The library is split into sub-paths so you only pull in what you need:

| Import path                 | What's there                                             |
| --------------------------- | -------------------------------------------------------- |
| `lombok-typescript`         | Top-level: types, `defineConfig`, `VERSION`              |
| `lombok-typescript/legacy`  | Decorators in legacy `experimentalDecorators` shape      |
| `lombok-typescript/stage3`  | Decorators in Stage 3 ECMAScript shape                   |
| `lombok-typescript/core`    | Backend-agnostic primitives (`Backend`, `MetadataStore`) |
| `lombok-typescript/codegen` | Programmatic codegen (`CodeGenerator`, `analyzeFile`)    |

For most consumers the only paths you'll touch are `lombok-typescript/legacy` or `lombok-typescript/stage3`, plus the top-level `lombok-typescript` for `defineConfig`.

## Pick a decorator standard

The library ships two backends. Your project's `tsconfig.json` decides which one you can use.

### Legacy `experimentalDecorators`

This is what NestJS, TypeORM, and class-validator use. It's the default for older TS projects.

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strict": true,
  },
}
```

Then your imports come from the `/legacy` sub-path:

```ts
import { Data, Builder, NonNull } from 'lombok-typescript/legacy';
```

### Stage 3 ECMAScript decorators

The modern path, available since TS 5.0. No `reflect-metadata` polyfill required; per-class metadata is stored under `Symbol.metadata`.

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "experimentalDecorators": false,
    "lib": ["ES2023", "ESNext.Decorators"],
    "strict": true,
  },
}
```

Imports come from `/stage3`:

```ts
import { Data, Builder, NonNull } from 'lombok-typescript/stage3';
```

A few things to know about Stage 3:

- No parameter decorators. The spec doesn't include them. If you need parameter-level annotations (e.g. `@NonNull` on a method parameter), use the legacy backend.
- Getter and setter decorators are separate kinds. The library exposes `defineGetterDecorator` and `defineSetterDecorator` for them.
- Metadata is per-class and reachable at runtime via `MyClass[Symbol.metadata]` or the `getClassMetadata` helper exported from `lombok-typescript/stage3`.

### Mixed projects

If you have a monorepo where some packages run legacy and others run Stage 3, you can import from both paths in different files. There's nothing stopping you. Just pick one per package.

## Verify the install

A one-line sanity check:

```ts
import { VERSION } from 'lombok-typescript';
console.log(VERSION); // "0.1.0-pre"
```

If that runs, you're set. Next step: [02-lombok-config.md](./02-lombok-config.md) to drop a `lombok.config.ts` in your project.
