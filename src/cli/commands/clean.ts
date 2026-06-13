import { existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

export interface CleanCommandOptions {
  cwd?: string;
  /** Directories (relative to cwd) to remove. Default `['.lombok', 'dist', 'coverage']`. */
  paths?: string[];
  log?: (message: string) => void;
}

/** `lombok-ts clean`: remove generated and build artifacts. */
export async function runClean(opts: CleanCommandOptions = {}): Promise<{
  removed: string[];
  skipped: string[];
}> {
  const cwd = opts.cwd ?? process.cwd();
  const paths = opts.paths ?? ['.lombok', 'dist', 'coverage'];
  const log = opts.log ?? ((msg) => console.info(msg));

  const removed: string[] = [];
  const skipped: string[] = [];

  for (const rel of paths) {
    const abs = resolve(cwd, rel);
    if (existsSync(abs)) {
      rmSync(abs, { recursive: true, force: true });
      removed.push(rel);
      log(`Removed ${rel}/`);
    } else {
      skipped.push(rel);
    }
  }

  if (removed.length === 0) {
    log('Nothing to clean.');
  }

  return { removed, skipped };
}
