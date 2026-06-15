# Getting started

## Install

The package is **not on npm yet** (v0.1.0 code-complete). Use a local clone:

```bash
git clone https://github.com/A-Dev-Kit/lombok-typescript.git
cd lombok-typescript
pnpm install
pnpm build
pnpm link --global   # optional: use lombok-ts from anywhere
```

When published:

```bash
npm install lombok-typescript@preview
```

## Pick a backend

### Legacy (NestJS, TypeORM, most existing codebases)

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
  },
}
```

```ts
import { Data, Builder, Singleton } from 'lombok-typescript/legacy';
```

### Stage 3 (TS 5.0+ native decorators)

```jsonc
{
  "compilerOptions": {
    "experimentalDecorators": false,
  },
}
```

```ts
import { Data, Builder, Singleton } from 'lombok-typescript/stage3';
```

Do not mix backends in one project.

## Configure codegen

```bash
npx lombok-ts init
```

Or create `lombok.config.ts` manually — see [Configuration](/guide/configuration).

## Minimal workflow

**1. Decorate a class** (`src/user.ts`):

```ts
import 'reflect-metadata';
import { Data, Builder, ToString } from 'lombok-typescript/legacy';

@Data
@Builder
@ToString
export class User {
  name!: string;
  age!: number;
}
```

**2. Generate companions:**

```bash
npx lombok-ts generate
```

**3. TypeScript config** — include generated files (no `rootDir: src` if `.lombok` is a sibling):

```jsonc
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
  },
  "include": ["src/**/*.ts", ".lombok/**/*.ts", ".lombok/**/*.d.ts"],
}
```

**4. Apply generated mixins** (e.g. in `src/main.ts`):

```ts
import { User } from './user.js';
import { applyAllGenerated } from '../.lombok/src/user.lombok.js';

applyAllGenerated({ User });
```

**5. Use the API:**

```ts
const user = User.builder().name('Ada').age(30).build();
console.info(user.toString());
```

## Runtime-only decorators

`@Singleton`, `@Prototype`, `@Memoize`, and `@NonNull` work without codegen. Still run `generate` if the same file also uses `@Data` / `@Builder` / `@ToString`.

## Next steps

- [CLI](/guide/cli) — all commands and flags
- [Examples](/guide/examples) — plain-ts and nestjs sample apps
- [Decorator overview](/decorators/overview) — per-decorator reference
