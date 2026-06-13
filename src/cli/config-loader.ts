import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { bundleRequire } from 'bundle-require';
import type { LombokConfig } from '../config.js';

/** Config file names searched in order; first match wins. */
export const CONFIG_FILE_NAMES = [
  'lombok.config.ts',
  'lombok.config.mts',
  'lombok.config.cts',
  'lombok.config.js',
  'lombok.config.mjs',
  'lombok.config.cjs',
] as const;

/** Find the lombok config file in `searchDir` (or cwd). */
export function findConfigFile(searchDir: string = process.cwd()): string | undefined {
  for (const name of CONFIG_FILE_NAMES) {
    const candidate = resolve(searchDir, name);
    if (existsSync(candidate)) return candidate;
  }
  return undefined;
}

/**
 * Load a lombok config via `bundle-require` (esbuild-powered). `lombok.config.ts`
 * works without any transpile step on the user's side. Returns `undefined` if
 * no config file exists.
 */
export async function loadConfig(searchDir: string = process.cwd()): Promise<
  | {
      filepath: string;
      config: LombokConfig;
    }
  | undefined
> {
  const filepath = findConfigFile(searchDir);
  if (!filepath) return undefined;
  return loadConfigFromFile(filepath);
}

/** Load a config from a specific path. Used by tests and `--config <path>`. */
export async function loadConfigFromFile(filepath: string): Promise<{
  filepath: string;
  config: LombokConfig;
}> {
  if (!existsSync(filepath)) {
    throw new Error(`Config file not found: ${filepath}`);
  }
  const { mod } = await bundleRequire({ filepath });
  const hasDefault = mod !== null && typeof mod === 'object' && 'default' in mod;
  const candidate = hasDefault ? (mod as { default: unknown }).default : mod;

  if (candidate === null || candidate === undefined || typeof candidate !== 'object') {
    throw new Error(
      `Config file ${filepath} did not export a valid config object. ` +
        `Make sure it has a default export of \`defineConfig({...})\`.`,
    );
  }
  return { filepath, config: candidate as LombokConfig };
}
