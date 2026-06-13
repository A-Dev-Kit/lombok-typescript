# ADR-11: CLI surface and config loader

- **Status:** Open
- **Context:** [package.json](../../package.json) needs a `bin` field. The `defineConfig()` helper in [src/config.ts](../../src/config.ts) needs a runtime loader that reads `lombok.config.ts` from disk.
- **Options for CLI name:**
  1. **`lombok-ts`** — matches package name, unambiguous
  2. **`lt`** — short, but conflicts with shell aliases for many devs
  3. **`lombok-typescript`** — verbose but unmistakable
- **Options for subcommands:**
  1. `generate` (one-shot), `watch`, `init` (scaffold `lombok.config.ts`), `clean`
  2. Single command with flags: `lombok-ts --watch`, `lombok-ts --init`
- **Options for config loader:**
  1. **`tsx`** — runs TS directly
  2. **`jiti`** — lighter, esbuild-based
  3. **`bundle-require`** — what `tsup` uses internally (already a transitive dep)
- **Recommendation:**
  - CLI name: `lombok-ts`
  - Subcommands: `generate`, `watch`, `init`, `clean` (explicit beats flag-soup)
  - Config loader: `bundle-require` (already in dep tree, zero net cost)
- **Phase 0 status:** Recommendation provisionally adopted. [src/cli/](../../src/cli/) ships the four-subcommand layout with `cac` (lighter than commander) and `bundle-require` for the config loader. Bin entry registered in [package.json](../../package.json).
- **Decision:** _<blank>_
- **Date decided:** _<blank>_
