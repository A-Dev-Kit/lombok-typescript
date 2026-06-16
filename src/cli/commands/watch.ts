import { CodeGenerator } from '../../codegen/generator.js';
import type { GeneratorOptions } from '../../codegen/types.js';
import { loadConfig } from '../config-loader.js';

export interface WatchCommandOptions {
  cwd?: string;
  overrides?: Partial<GeneratorOptions>;
  log?: (message: string) => void;
  signal?: AbortSignal;
}

/** `lombok-ts watch` — regenerate companion files when sources change. */
export async function runWatch(opts: WatchCommandOptions = {}): Promise<void> {
  const log = opts.log ?? ((msg) => console.info(msg));
  const loaded = await loadConfig(opts.cwd);
  const codegenOpts: Partial<GeneratorOptions> = {
    ...(loaded?.config.codegen ?? {}),
    ...opts.overrides,
    watch: true,
  };

  if (loaded) {
    log(`Loaded config from ${loaded.filepath}`);
  } else {
    log('No lombok.config.* file found, using defaults.');
  }

  const gen = new CodeGenerator(codegenOpts);
  await gen.watch({ log, signal: opts.signal });
}
