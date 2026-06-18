# CLI

The `lombok-ts` binary ships with the package (`pnpm build` produces `dist/cli`).

## Commands

| Command              | Alias | Description                                          |
| -------------------- | ----- | ---------------------------------------------------- |
| `lombok-ts generate` | `gen` | Run codegen once against configured sources          |
| `lombok-ts init`     | —     | Create a starter `lombok.config.ts`                  |
| `lombok-ts clean`    | —     | Remove `.lombok`, `dist`, `coverage` (default paths) |
| `lombok-ts watch`    | —     | Watch sources and regenerate companions on change    |

Global flags: `--help`, `--version`.

## `generate`

```bash
lombok-ts generate
lombok-ts generate --output-dir .lombok --ts-config tsconfig.json
```

**Steps:**

1. Load `lombok.config.ts` (or defaults if missing).
2. Scan `include` globs, respecting `exclude`.
3. Write one companion pair per source file that contains decorated classes.
4. Print paths of generated files.

**When to run:** After adding or changing codegen decorators (`@Data`, `@Value`, `@Builder`, `@ToString`, `@Equals`, `@Getter`, `@Setter`, `@With`, `@Delegate`, …). Add to CI before `tsc` (see repository `examples/` jobs).

## `watch`

```bash
lombok-ts watch
```

Runs an initial `generate`, then watches matched source files and regenerates companions on change. Press Ctrl+C to stop (or pass an `AbortSignal` when calling programmatically).

## `init`

```bash
lombok-ts init
lombok-ts init --force   # overwrite existing config
```

Writes a starter `lombok.config.ts` with `backend: 'legacy'` and default codegen paths.

## `clean`

```bash
lombok-ts clean
```

Removes, by default:

- `.lombok/`
- `dist/`
- `coverage/`

Skips paths that do not exist. Does not delete your source.

## Exit codes

| Code | Meaning                                                   |
| ---- | --------------------------------------------------------- |
| `0`  | Success                                                   |
| `1`  | Error (missing config parse failure, unhandled exception) |

## Troubleshooting

| Issue                               | Fix                                                                                    |
| ----------------------------------- | -------------------------------------------------------------------------------------- |
| No files generated                  | Check `include` globs; ensure classes have lombok decorators                           |
| `tsc` cannot find `.lombok` imports | Add `.lombok/**/*.ts` and `.lombok/**/*.d.ts` to `include`; avoid `rootDir: src` alone |
| `TS2834` missing `.js` extension    | Use `moduleResolution: NodeNext` and match import style in companions                  |
| Watch fails                         | Ensure source files are writable; check `include` / `exclude` globs                    |

See [Getting started](/guide/getting-started) and [Examples](/guide/examples).
