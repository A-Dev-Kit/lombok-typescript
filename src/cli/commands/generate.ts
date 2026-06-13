import { CodeGenerator } from '../../codegen/generator.js';
import type { GeneratorOptions } from '../../codegen/types.js';
import { loadConfig } from '../config-loader.js';

export interface GenerateCommandOptions {
  /** Where to look for `lombok.config.*`. Default `process.cwd()`. */
  cwd?: string;
  /** Overrides applied on top of the loaded config. */
  overrides?: Partial<GeneratorOptions>;
  /** Replace `console.info` for testability. */
  log?: (message: string) => void;
}

/** `lombok-ts generate`: one-shot codegen against the configured source files. */
export async function runGenerate(opts: GenerateCommandOptions = {}): Promise<{
  generatedCount: number;
  outputDir: string;
}> {
  const log = opts.log ?? ((msg) => console.info(msg));

  const loaded = await loadConfig(opts.cwd);
  const codegenOpts: Partial<GeneratorOptions> = {
    ...(loaded?.config.codegen ?? {}),
    ...opts.overrides,
  };

  if (loaded) {
    log(`Loaded config from ${loaded.filepath}`);
  } else {
    log('No lombok.config.* file found, using defaults.');
  }

  const generator = new CodeGenerator(codegenOpts);
  const generated = await generator.generate();

  log(
    `Generated ${generated.length} companion file${generated.length === 1 ? '' : 's'} ` +
      `under ${generator.options.outputDir}/`,
  );
  for (const entry of generated) {
    log(`  - ${entry.outputPath} (${entry.processedClasses.join(', ')})`);
  }

  return {
    generatedCount: generated.length,
    outputDir: generator.options.outputDir,
  };
}
