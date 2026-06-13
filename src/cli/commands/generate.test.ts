import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { runGenerate } from './generate.js';

describe('runGenerate', () => {
  let tmpDir: string;
  let prevCwd: string;
  const logs: string[] = [];

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'lombok-cmd-gen-'));
    prevCwd = process.cwd();
    process.chdir(tmpDir);
    logs.length = 0;
  });

  afterEach(() => {
    process.chdir(prevCwd);
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('runs without a config file using defaults', async () => {
    mkdirSync('src', { recursive: true });
    writeFileSync('src/foo.ts', '@A\nclass Foo {}', 'utf8');

    const result = await runGenerate({
      cwd: tmpDir,
      log: (m) => logs.push(m),
      overrides: { tsConfigPath: 'no-such.json' },
    });

    expect(result.generatedCount).toBe(1);
    expect(result.outputDir).toBe('.lombok');
    expect(logs.join('\n')).toContain('No lombok.config');
  });

  it('uses config from disk when present', async () => {
    mkdirSync('src', { recursive: true });
    writeFileSync('src/foo.ts', '@A\nclass Foo {}', 'utf8');
    writeFileSync(
      'lombok.config.mjs',
      `export default { codegen: { outputDir: 'gen-out', include: ['src/**/*.ts'], tsConfigPath: 'no-such.json', exclude: [], watch: false } };`,
      'utf8',
    );

    const result = await runGenerate({ cwd: tmpDir, log: (m) => logs.push(m) });

    expect(result.outputDir).toBe('gen-out');
    expect(result.generatedCount).toBe(1);
    expect(logs.join('\n')).toContain('Loaded config from');
  });

  it('inline overrides win over config file values', async () => {
    mkdirSync('src', { recursive: true });
    writeFileSync('src/foo.ts', '@A\nclass Foo {}', 'utf8');
    writeFileSync(
      'lombok.config.mjs',
      `export default { codegen: { outputDir: 'config-out', include: ['src/**/*.ts'], tsConfigPath: 'no-such.json', exclude: [], watch: false } };`,
      'utf8',
    );

    const result = await runGenerate({
      cwd: tmpDir,
      log: (m) => logs.push(m),
      overrides: { outputDir: 'override-out' },
    });

    expect(result.outputDir).toBe('override-out');
  });

  it('reports zero generated files for an empty src tree', async () => {
    mkdirSync('src', { recursive: true });

    const result = await runGenerate({
      cwd: tmpDir,
      log: (m) => logs.push(m),
      overrides: { tsConfigPath: 'no-such.json' },
    });

    expect(result.generatedCount).toBe(0);
  });
});
