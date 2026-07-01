# Architecture

## Three decorator mechanisms

| Mechanism   | Examples                                           | When it runs                                                                    |
| ----------- | -------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Runtime** | `@Singleton`, `@Prototype`, `@Memoize`, `@NonNull` | At class/method decoration time; no generate step required                      |
| **Codegen** | `@Data`, `@Builder`, `@ToString`                   | `lombok-ts generate` writes companions; you call `applyAllGenerated` at startup |
| **Hybrid**  | `@Factory`                                         | Runtime registry + optional generated types                                     |

## Codegen pipeline

1. You decorate classes in `src/**/*.ts`.
2. `lombok-ts generate` scans configured globs (see [Configuration](/guide/configuration)).
3. For each file with decorated classes, emit:
   - **`.lombok/.../file.lombok.ts`** — builder classes, getter/setter functions, `apply*Generated` mixins
   - **`.lombok/.../file.lombok.d.ts`** — `declare module` augmentation for IDE types

4. Include generated files in `tsconfig.json`:

```jsonc
{
  "include": ["src/**/*.ts", ".lombok/**/*.ts", ".lombok/**/*.d.ts"],
}
```

5. After imports resolve, call apply helpers once (e.g. in `main.ts`):

```ts
import { User } from './user.js';
import { applyAllGenerated } from '../.lombok/src/user.lombok.js';

applyAllGenerated({ User });
```

::: tip NodeNext imports
Companion files import your sources with `.js` extensions and paths relative to `.lombok/`, matching `moduleResolution: NodeNext`.
:::

## Package layout

| Export                      | Role                         |
| --------------------------- | ---------------------------- |
| `lombok-typescript/legacy`  | Legacy decorator factories   |
| `lombok-typescript/stage3`  | Stage 3 decorator factories  |
| `lombok-typescript/codegen` | Generator types (advanced)   |
| `lombok-typescript`         | `defineConfig`, shared entry |

## NestJS (Phase 7)

| Package                     | Role                                                         |
| --------------------------- | ------------------------------------------------------------ |
| `@lombok-typescript/nestjs` | `LombokModule`, `@LogNest`, scope helpers (opt-in satellite) |

See [NestJS integration](/guide/nestjs-integration).

## v0.1 limitations

- `@Data` does not replace your class constructor; generated getters/setters are mixed onto the prototype via `apply*Generated`.
- `@Builder` builds instances by assigning fields after `new Class()` — your class needs assignable properties.
- `lombok-ts watch` regenerates companions on file changes (Phase 2+).
- NestJS: use `@lombok-typescript/nestjs` for `LombokModule` and `@LogNest` (see [NestJS integration](/guide/nestjs-integration)).

See [Examples](/guide/examples) for end-to-end projects.
