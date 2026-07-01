import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cac } from 'cac';
import { runClean } from './commands/clean.js';
import { runGenerate } from './commands/generate.js';
import { runInit } from './commands/init.js';
import { runWatch } from './commands/watch.js';

import { CLI_VERSION } from '../version.js';

export const CLI_NAME = 'lombok-ts';
export { CLI_VERSION };

/**
 * Build a fresh cac CLI instance. Exposed as a function (rather than a
 * top-level `.parse()`) so tests can construct one without auto-parsing
 * `process.argv`.
 */
export function buildCli() {
  const cli = cac(CLI_NAME);

  cli
    .command('generate', 'Run codegen once against the configured source files')
    .alias('gen')
    .option('--output-dir <dir>', 'Override codegen output directory')
    .option('--ts-config <path>', 'Path to tsconfig.json (default: tsconfig.json)')
    .action(async (options: { outputDir?: string; tsConfig?: string }) => {
      await runGenerate({
        overrides: {
          ...(options.outputDir ? { outputDir: options.outputDir } : {}),
          ...(options.tsConfig ? { tsConfigPath: options.tsConfig } : {}),
        },
      });
    });

  cli.command('watch', 'Watch source files and regenerate on change').action(async () => {
    await runWatch();
  });

  cli
    .command('init', 'Create a starter lombok.config.ts in the current directory')
    .option('--force', 'Overwrite an existing config file')
    .action(async (options: { force?: boolean }) => {
      await runInit({ force: options.force });
    });

  cli.command('clean', 'Remove generated files and build artifacts').action(async () => {
    await runClean();
  });

  cli.help();
  cli.version(CLI_VERSION);

  return cli;
}

/** Run the CLI with the provided argv (defaults to `process.argv`). */
export async function runCli(argv: string[] = process.argv): Promise<void> {
  const cli = buildCli();
  cli.parse(argv, { run: false });
  await cli.runMatchedCommand();
}

// Auto-execute when invoked as the bin entry.
const isMain =
  typeof process !== 'undefined' &&
  typeof import.meta.url === 'string' &&
  process.argv[1] !== undefined &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (isMain) {
  runCli().catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
}
