# ADR-11: CLI surface and config loader

- **Status:** Open
- **Context:** [package.json](../../package.json) needs a `bin` field. The `defineConfig()` helper in [src/config.ts](../../src/config.ts) needs a runtime loader that reads `lombok.config.ts` from disk.

## Sub-decisions

### CLI name

1. `lombok-ts`. Matches the package name, unambiguous.
2. `lt`. Short, but conflicts with shell aliases for many devs.
3. `lombok-typescript`. Verbose but unmistakable.

### Subcommands

1. Separate: `generate`, `watch`, `init`, `clean`.
2. Single command with flags: `lombok-ts --watch`, `lombok-ts --init`.

### Config loader

1. `tsx`: runs TS directly.
2. `jiti`: lighter, esbuild-based.
3. `bundle-require`: what `tsup` uses internally, already a transitive dep.

## Recommendation

- CLI name: `lombok-ts`
- Subcommands: separate (explicit beats flag-soup)
- Config loader: `bundle-require` (already in the dep tree, zero net cost)

## Phase 0 status

Provisionally adopted. [src/cli/](../../src/cli/) ships the four-subcommand layout with `cac` (lighter than commander) and `bundle-require` for the loader. Bin entry registered in package.json.

- **Decision:** _<blank>_
- **Date decided:** _<blank>_
