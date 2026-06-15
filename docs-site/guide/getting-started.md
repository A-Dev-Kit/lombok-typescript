# Getting started

## Install (when published)

```bash
npm install lombok-typescript@preview
```

The package is **not on npm yet**. Clone the repository and `pnpm link` for local development.

## Pick a backend

### Legacy (NestJS, TypeORM)

```jsonc
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
  },
}
```

```ts
import { Data, Builder } from 'lombok-typescript/legacy';
```

### Stage 3

```jsonc
{
  "compilerOptions": {
    "experimentalDecorators": false,
  },
}
```

```ts
import { Data, Builder } from 'lombok-typescript/stage3';
```

## Generate companion code

```bash
npx lombok-ts init
npx lombok-ts generate
```

Include `.lombok/**/*.d.ts` in your tsconfig `include` for declaration merging.
