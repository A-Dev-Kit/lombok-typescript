import { existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const TEMPLATE = `import { defineConfig } from 'lombok-typescript';

export default defineConfig({
  // Decorator backend: 'legacy' (experimentalDecorators), 'stage3' (ECMAScript),
  // or 'auto' to pick based on your tsconfig.
  backend: 'auto',

  // Codegen options used by \`lombok-ts generate\`.
  codegen: {
    outputDir: '.lombok',
    include: ['src/**/*.ts'],
    exclude: ['node_modules', '**/*.test.ts', '**/*.spec.ts'],
    tsConfigPath: 'tsconfig.json',
    watch: false,
  },
});
`;

export interface InitCommandOptions {
  cwd?: string;
  fileName?: string;
  /** Overwrite an existing config file. */
  force?: boolean;
  log?: (message: string) => void;
}

/** `lombok-ts init`: drop a starter `lombok.config.ts` in the cwd. */
export async function runInit(opts: InitCommandOptions = {}): Promise<{
  filepath: string;
  created: boolean;
}> {
  const cwd = opts.cwd ?? process.cwd();
  const fileName = opts.fileName ?? 'lombok.config.ts';
  const filepath = resolve(cwd, fileName);
  const log = opts.log ?? ((msg) => console.info(msg));

  if (existsSync(filepath) && !opts.force) {
    log(`${fileName} already exists. Use --force to overwrite.`);
    return { filepath, created: false };
  }

  writeFileSync(filepath, TEMPLATE, 'utf8');
  log(`Created ${fileName}`);
  return { filepath, created: true };
}
