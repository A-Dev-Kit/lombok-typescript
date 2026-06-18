import { describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runWatch } from './watch.js';

function withTempWatchProject(run: (dir: string) => Promise<void>): Promise<void> {
  const dir = mkdtempSync(join(tmpdir(), 'lombok-watch-'));
  const prev = process.cwd();
  process.chdir(dir);
  writeFileSync(
    join(dir, 'lombok.config.ts'),
    `export default { codegen: { outputDir: '.lombok', include: ['src/**/*.ts'], exclude: [], tsConfigPath: 'missing.json', watch: true } };`,
    'utf8',
  );
  mkdirSync(join(dir, 'src'), { recursive: true });
  writeFileSync(join(dir, 'src', 'a.ts'), 'class A {}', 'utf8');
  return run(dir).finally(() => {
    process.chdir(prev);
    rmSync(dir, { recursive: true, force: true });
  });
}

describe('runWatch', () => {
  it('generates once then resolves when aborted', async () => {
    await withTempWatchProject(async () => {
      const logs: string[] = [];
      const controller = new AbortController();
      const promise = runWatch({ log: (m) => logs.push(m), signal: controller.signal });
      controller.abort();
      await promise;
      expect(logs.join('\n')).toMatch(/Watching for changes/i);
    });
  });

  it('logs when config file is loaded', async () => {
    await withTempWatchProject(async () => {
      const logs: string[] = [];
      const controller = new AbortController();
      const promise = runWatch({ log: (m) => logs.push(m), signal: controller.signal });
      controller.abort();
      await promise;
      expect(logs.join('\n')).toMatch(/Loaded config from/);
    });
  });

  it('uses defaults when no config file exists', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'lombok-watch-'));
    const prev = process.cwd();
    process.chdir(dir);
    mkdirSync(join(dir, 'src'), { recursive: true });
    writeFileSync(join(dir, 'src', 'a.ts'), 'class A {}', 'utf8');
    const logs: string[] = [];
    const controller = new AbortController();
    try {
      const promise = runWatch({ log: (m) => logs.push(m), signal: controller.signal });
      controller.abort();
      await promise;
      expect(logs.join('\n')).toMatch(/No lombok.config/);
      expect(logs.join('\n')).toMatch(/Watching for changes/i);
    } finally {
      process.chdir(prev);
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
