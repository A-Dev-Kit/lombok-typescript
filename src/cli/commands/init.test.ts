import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { runInit } from './init.js';

describe('runInit', () => {
  let tmpDir: string;
  const logs: string[] = [];

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'lombok-init-'));
    logs.length = 0;
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('writes a starter lombok.config.ts when none exists', async () => {
    const result = await runInit({ cwd: tmpDir, log: (m) => logs.push(m) });

    expect(result.created).toBe(true);
    expect(result.filepath).toBe(join(tmpDir, 'lombok.config.ts'));
    const content = readFileSync(result.filepath, 'utf8');
    expect(content).toContain("import { defineConfig } from 'lombok-typescript'");
    expect(content).toContain('backend');
    expect(content).toContain('codegen');
    expect(logs).toContainEqual(expect.stringContaining('Created'));
  });

  it('refuses to overwrite an existing config without --force', async () => {
    const filepath = join(tmpDir, 'lombok.config.ts');
    writeFileSync(filepath, '// pre-existing');

    const result = await runInit({ cwd: tmpDir, log: (m) => logs.push(m) });

    expect(result.created).toBe(false);
    expect(readFileSync(filepath, 'utf8')).toBe('// pre-existing');
    expect(logs).toContainEqual(expect.stringContaining('already exists'));
  });

  it('overwrites an existing config when force=true', async () => {
    const filepath = join(tmpDir, 'lombok.config.ts');
    writeFileSync(filepath, '// pre-existing');

    const result = await runInit({ cwd: tmpDir, force: true, log: (m) => logs.push(m) });

    expect(result.created).toBe(true);
    expect(readFileSync(filepath, 'utf8')).not.toBe('// pre-existing');
    expect(readFileSync(filepath, 'utf8')).toContain('defineConfig');
  });

  it('respects a custom file name', async () => {
    const result = await runInit({
      cwd: tmpDir,
      fileName: 'lombok.config.mjs',
      log: (m) => logs.push(m),
    });

    expect(result.filepath).toBe(join(tmpDir, 'lombok.config.mjs'));
    expect(result.created).toBe(true);
  });
});
