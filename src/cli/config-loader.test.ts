import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  CONFIG_FILE_NAMES,
  findConfigFile,
  loadConfig,
  loadConfigFromFile,
} from './config-loader.js';

describe('CONFIG_FILE_NAMES', () => {
  it('includes the standard config file extensions', () => {
    expect(CONFIG_FILE_NAMES).toContain('lombok.config.ts');
    expect(CONFIG_FILE_NAMES).toContain('lombok.config.js');
    expect(CONFIG_FILE_NAMES).toContain('lombok.config.mjs');
  });
});

describe('findConfigFile', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'lombok-cfg-'));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns undefined when no config is present', () => {
    expect(findConfigFile(tmpDir)).toBeUndefined();
  });

  it('finds lombok.config.ts when present', () => {
    const filepath = join(tmpDir, 'lombok.config.ts');
    writeFileSync(filepath, 'export default {};');
    expect(findConfigFile(tmpDir)).toBe(filepath);
  });

  it('finds lombok.config.mjs when only that variant exists', () => {
    const filepath = join(tmpDir, 'lombok.config.mjs');
    writeFileSync(filepath, 'export default {};');
    expect(findConfigFile(tmpDir)).toBe(filepath);
  });

  it('prefers .ts over .js when both exist', () => {
    writeFileSync(join(tmpDir, 'lombok.config.ts'), 'export default {};');
    writeFileSync(join(tmpDir, 'lombok.config.js'), 'module.exports = {};');
    expect(findConfigFile(tmpDir)).toBe(join(tmpDir, 'lombok.config.ts'));
  });
});

describe('loadConfig', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'lombok-cfg-'));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns undefined when no config exists', async () => {
    const result = await loadConfig(tmpDir);
    expect(result).toBeUndefined();
  });

  it('loads a default-export config', async () => {
    const filepath = join(tmpDir, 'lombok.config.mjs');
    writeFileSync(
      filepath,
      `export default { backend: 'legacy', codegen: { outputDir: 'custom-out' } };`,
    );

    const result = await loadConfig(tmpDir);
    expect(result).toBeDefined();
    expect(result!.config.backend).toBe('legacy');
    expect(result!.config.codegen?.outputDir).toBe('custom-out');
  });

  it('loads a CommonJS-style export', async () => {
    const filepath = join(tmpDir, 'lombok.config.cjs');
    writeFileSync(filepath, `module.exports = { backend: 'stage3' };`);

    const result = await loadConfig(tmpDir);
    expect(result).toBeDefined();
    expect(result!.config.backend).toBe('stage3');
  });
});

describe('loadConfigFromFile', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'lombok-cfg-'));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('throws when the path does not exist', async () => {
    await expect(loadConfigFromFile(join(tmpDir, 'missing.ts'))).rejects.toThrow(/not found/);
  });

  it('throws when the file does not export a config object', async () => {
    const filepath = join(tmpDir, 'lombok.config.mjs');
    writeFileSync(filepath, `export default null;`);
    await expect(loadConfigFromFile(filepath)).rejects.toThrow(/valid config object/);
  });
});
