import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runClean } from './clean.js';

describe('runClean', () => {
  let tmpDir: string;
  const logs: string[] = [];

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'lombok-clean-'));
    logs.length = 0;
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('removes default directories when present', async () => {
    mkdirSync(join(tmpDir, '.lombok'), { recursive: true });
    mkdirSync(join(tmpDir, 'dist'), { recursive: true });
    writeFileSync(join(tmpDir, '.lombok', 'a.ts'), '');
    writeFileSync(join(tmpDir, 'dist', 'b.js'), '');

    const result = await runClean({ cwd: tmpDir, log: (m) => logs.push(m) });

    expect(result.removed).toContain('.lombok');
    expect(result.removed).toContain('dist');
    expect(existsSync(join(tmpDir, '.lombok'))).toBe(false);
    expect(existsSync(join(tmpDir, 'dist'))).toBe(false);
  });

  it('skips directories that do not exist', async () => {
    const result = await runClean({ cwd: tmpDir, log: (m) => logs.push(m) });
    expect(result.removed).toEqual([]);
    expect(result.skipped).toContain('.lombok');
    expect(logs).toContainEqual(expect.stringContaining('Nothing to clean'));
  });

  it('uses default paths and console logger when options are omitted', async () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const result = await runClean({ cwd: tmpDir });
    expect(result.skipped.length).toBeGreaterThan(0);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('removes custom paths when supplied', async () => {
    mkdirSync(join(tmpDir, 'tmp-build'), { recursive: true });
    const result = await runClean({
      cwd: tmpDir,
      paths: ['tmp-build'],
      log: (m) => logs.push(m),
    });
    expect(result.removed).toEqual(['tmp-build']);
    expect(existsSync(join(tmpDir, 'tmp-build'))).toBe(false);
  });
});
