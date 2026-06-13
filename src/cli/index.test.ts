import { describe, expect, it } from 'vitest';
import { CLI_NAME, CLI_VERSION, buildCli } from './index.js';

describe('CLI metadata', () => {
  it('exports a stable name', () => {
    expect(CLI_NAME).toBe('lombok-ts');
  });

  it('exports a version string', () => {
    expect(typeof CLI_VERSION).toBe('string');
    expect(CLI_VERSION).toMatch(/\d+\.\d+\.\d+/);
  });
});

describe('buildCli', () => {
  it('registers the four expected commands', () => {
    const cli = buildCli();
    const commandNames = cli.commands.map((c) => c.name);
    expect(commandNames).toEqual(expect.arrayContaining(['generate', 'watch', 'init', 'clean']));
  });

  it('parses a known command and dispatches without throwing', () => {
    const cli = buildCli();
    expect(() => cli.parse(['node', 'lombok-ts', '--help'], { run: false })).not.toThrow();
  });

  it('parses generate with --output-dir option', () => {
    const cli = buildCli();
    cli.parse(['node', 'lombok-ts', 'generate', '--output-dir', 'custom'], { run: false });
    expect(cli.options.outputDir).toBe('custom');
  });
});
