# Configuration

Create `lombok.config.ts` in your project root (or run `lombok-ts init`).

```ts
import { defineConfig } from 'lombok-typescript';

export default defineConfig({
  backend: 'legacy',
  codegen: {
    outputDir: '.lombok',
    include: ['src/**/*.ts'],
    exclude: ['**/*.test.ts', '**/*.spec.ts'],
    tsConfigPath: 'tsconfig.json',
  },
});
```

`defineConfig` is a typed identity helper — use it for autocomplete in your editor.

## Top-level fields

| Field            | Type                             | Default  | Description                                                       |
| ---------------- | -------------------------------- | -------- | ----------------------------------------------------------------- |
| `backend`        | `'legacy' \| 'stage3' \| 'auto'` | `'auto'` | Which decorator standard to assume                                |
| `log`            | `Partial<LogConfig>`             | —        | Future `@Log` settings (Phase 2+)                                 |
| `builder`        | `Partial<BuilderConfig>`         | —        | Builder naming (`prefix`, `buildMethodName`, `builderMethodName`) |
| `formatToString` | `Partial<ToStringConfig>`        | —        | `@ToString` format (`pretty`, `json`, `compact`)                  |
| `validate`       | `Partial<ValidateConfig>`        | —        | Future `@Validate` settings (Phase 5+)                            |
| `codegen`        | `Partial<CodegenConfig>`         | —        | Code generation options                                           |

## `codegen` fields

| Field          | Default                  | Description                                         |
| -------------- | ------------------------ | --------------------------------------------------- |
| `outputDir`    | `'.lombok'`              | Directory for `.lombok.ts` and `.lombok.d.ts` files |
| `include`      | `['src/**/*.ts']`        | Globs of source files to scan                       |
| `exclude`      | tests, `dist`, `.lombok` | Globs to skip                                       |
| `tsConfigPath` | `'tsconfig.json'`        | Project tsconfig used by the analyzer               |
| `watch`        | `false`                  | **Not implemented** — Phase 2                       |

## CLI overrides

```bash
lombok-ts generate --output-dir custom-out --ts-config tsconfig.build.json
```

CLI flags override values from the config file for that run.

## Backend selection

Set `backend: 'legacy'` or `'stage3'` explicitly in library-heavy monorepos. `'auto'` reads compiler options from `tsConfigPath` when present.

## Related

- [Architecture](/guide/architecture) — what codegen emits
- [CLI](/guide/cli) — `init`, `generate`, `clean`
