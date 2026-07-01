# CommonJS and Serverless

Use `lombok-typescript` from **CommonJS** TypeScript projects (Serverless Framework, classic Node `require`, Jest with `module: commonjs`) without converting the whole service to ESM.

## Requirements

| Setting            | Value                                                              |
| ------------------ | ------------------------------------------------------------------ |
| Node.js            | `>=22` (see `engines` in package.json)                             |
| `module`           | `commonjs` or `NodeNext` with `"type": "commonjs"` in package.json |
| `moduleResolution` | **`nodenext`**, **`node16`**, or **`bundler`** (with esbuild)      |
| Decorators         | `experimentalDecorators: true` for `/legacy`                       |
| Import path        | `lombok-typescript/legacy` (not the main entry)                    |

`moduleResolution: node` (classic) is **not supported** — TypeScript cannot resolve the package `exports` map and you will see `TS2307`.

## Minimal tsconfig

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strict": true,
  },
  "include": ["src/**/*.ts", ".lombok/**/*.ts", ".lombok/**/*.d.ts"],
}
```

## Import decorators

```ts
import 'reflect-metadata';
import { Data, Builder } from 'lombok-typescript/legacy';

@Data
@Builder
export class IncidentPayload {
  incidentId!: string;
  priority!: number;
}
```

The main package entry exports configuration helpers only. `@Data`, `@Builder`, and other decorators are on `/legacy` or `/stage3` by design ([ADR-12](https://github.com/A-Dev-Kit/lombok-typescript-planning/blob/main/adr/0012-library-positioning.md)).

## Codegen in CommonJS projects

```bash
npx lombok-ts init
npx lombok-ts generate
```

Include generated companions in `tsconfig.json` `include` (see [Getting started](/guide/getting-started)).

Apply mixins at startup:

```ts
import { IncidentPayload } from './incident.dto.js';
import { applyAllGenerated } from '../.lombok/src/incident.dto.lombok.js';

applyAllGenerated({ IncidentPayload });
```

Use `.js` extensions in imports when `moduleResolution` is `nodenext`, even if source files are `.ts`.

## Serverless Framework + esbuild

When using **serverless-esbuild** (or similar):

- Set `moduleResolution: bundler` in tsconfig if the bundler resolves types; otherwise keep `nodenext`.
- Ensure decorators are **not stripped** — they must survive to runtime for metadata and codegen markers.
- You do **not** need `"type": "module"` in `package.json` or ESM Lambda handlers for this workflow.

## Example in the repo

[`examples/commonjs-serverless/`](https://github.com/A-Dev-Kit/lombok-typescript/tree/main/examples/commonjs-serverless) mirrors a Serverless + CommonJS consumer. CI runs `tsc --noEmit` there on every PR.

## Troubleshooting

| Error                                                    | Fix                                                                                               |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `TS1479` … CommonJS module … ECMAScript module           | Upgrade to `lombok-typescript@1.0.0`+ with dual `require` types; use `moduleResolution: nodenext` |
| `TS2305` … no exported member `Data`                     | Import from `lombok-typescript/legacy`, not `lombok-typescript`                                   |
| `TS2307` … cannot find module `lombok-typescript/legacy` | Switch from `moduleResolution: node` to `nodenext` / `node16` / `bundler`                         |
| Decorators have no effect at runtime                     | Add `import 'reflect-metadata'` before decorator imports                                          |

## See also

- [Getting started](/guide/getting-started)
- [CLI](/guide/cli)
- [NestJS integration](/guide/nestjs-integration) — Nest apps are usually CommonJS-compatible with the same `/legacy` import path
