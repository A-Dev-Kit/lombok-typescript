# `lombok.config.ts`

A config file at the root of your project, read by the `lombok-ts` CLI and (eventually) by the runtime decorators. Drop one with `npx lombok-ts init` or hand-roll it.

## Minimal config

If you just want to point the codegen at the right files and pick a backend, this is all you need:

```ts
// lombok.config.ts
import { defineConfig } from 'lombok-typescript';

export default defineConfig({
  backend: 'legacy',
});
```

`backend` defaults to `'auto'` which inspects your `tsconfig.json` and picks `'legacy'` if `experimentalDecorators: true` is set, otherwise `'stage3'`.

## Full config with every field

```ts
import { defineConfig } from 'lombok-typescript';

export default defineConfig({
  // Decorator backend selection.
  // 'legacy'  uses experimentalDecorators + reflect-metadata
  // 'stage3'  uses Stage 3 ECMAScript decorators + Symbol.metadata
  // 'auto'    inspects your tsconfig and picks for you
  backend: 'auto',

  // Settings consumed by the @Log decorator (Phase 2+).
  log: {
    provider: 'console', // 'console' | 'winston' | 'pino' | 'bunyan'
    defaultLevel: 'info', // 'debug' | 'info' | 'warn' | 'error'
  },

  // Settings consumed by @Builder (Phase 1+).
  builder: {
    prefix: '', // '' for `name()`, 'with' for `withName()`
    buildMethodName: 'build',
    builderMethodName: 'builder',
  },

  // Settings consumed by @ToString (Phase 1+).
  // Field is `formatToString` not `toString` to avoid clashing
  // with Object.prototype.toString.
  formatToString: {
    format: 'pretty', // 'pretty' | 'json' | 'compact'
    includeClassName: true,
  },

  // Settings consumed by @Validate (Phase 5+).
  validate: {
    provider: 'zod', // 'zod' | 'yup' | 'class-validator'
    throwOnError: true,
  },

  // Settings consumed by `lombok-ts generate`. Wired up today.
  codegen: {
    outputDir: '.lombok',
    include: ['src/**/*.ts'],
    exclude: ['node_modules', '**/*.test.ts', '**/*.spec.ts', 'dist', '.lombok'],
    tsConfigPath: 'tsconfig.json',
    watch: false,
  },
});
```

## Which fields take effect when

- `backend` and the `codegen` block: live now. The CLI reads them, runs ts-morph, writes companion files.
- `builder`, `formatToString`: read by Phase 1 decorators (`@Builder`, `@ToString`).
- `log`: read by `@Log` once it ships in Phase 2.
- `validate`: read by `@Validate` once it ships in Phase 5.

You can include all fields today; the unused ones are ignored until their decorator lands.

## NestJS-flavored config

If you're in a NestJS project, this is a reasonable starting point:

```ts
import { defineConfig } from 'lombok-typescript';

export default defineConfig({
  backend: 'legacy',
  log: { provider: 'pino' }, // or 'console' to fall back to NestJS Logger
  validate: { provider: 'class-validator' },
  codegen: {
    outputDir: '.lombok',
    include: ['src/**/*.ts'],
    exclude: ['**/*.spec.ts', '**/*.e2e-spec.ts', 'dist'],
    tsConfigPath: 'tsconfig.json',
  },
});
```

A few NestJS-specific things to know:

- `@Singleton` overlaps with NestJS provider scope (which is singleton by default within a module). Don't stack them; pick one per class.
- The `@Log` adapter for NestJS's built-in `Logger` ships in Phase 7 alongside the `@lombok-typescript/nestjs` satellite package.

## Loading the config programmatically

If you need to read the config from your own scripts:

```ts
import { loadConfig } from 'lombok-typescript/cli';

const result = await loadConfig(process.cwd());
if (result) {
  console.log('Loaded:', result.filepath);
  console.log('Backend:', result.config.backend);
}
```

`loadConfig` searches in this order: `lombok.config.ts`, `.mts`, `.cts`, `.js`, `.mjs`, `.cjs`. First match wins. Returns `undefined` if none exists.

The loader uses `bundle-require` (esbuild under the hood), so `lombok.config.ts` works without you having to set up a TS transpiler.

## Validation

There's no runtime validation of the config object today; if you mistype a field name, TypeScript catches it at compile time via the `LombokConfig` type. Runtime validation lands in Phase 1 alongside the first round of decorators.

Next: [03-cli.md](./03-cli.md) for running `lombok-ts` commands against your project.
