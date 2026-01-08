/**
 * Code Generator
 *
 * Main entry point for code generation.
 * Analyzes TypeScript files and generates companion code.
 */

import type { GeneratorOptions, GeneratedFile } from './types';

const DEFAULT_OPTIONS: GeneratorOptions = {
  outputDir: '.lombok',
  watch: false,
  include: ['src/**/*.ts'],
  exclude: ['node_modules', '**/*.test.ts', '**/*.spec.ts'],
  tsConfigPath: 'tsconfig.json',
};

export class CodeGenerator {
  private options: GeneratorOptions;

  constructor(options: Partial<GeneratorOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Generate code for all matching files
   */
  async generate(): Promise<GeneratedFile[]> {
    // TODO: Implement using ts-morph
    // 1. Create Project from tsconfig
    // 2. Find all source files matching include/exclude
    // 3. Analyze each file for lombok decorators
    // 4. Generate companion code
    // 5. Write to output directory
    throw new Error('Not implemented yet');
  }

  /**
   * Watch for file changes and regenerate
   */
  async watch(): Promise<void> {
    // TODO: Implement file watching
    throw new Error('Not implemented yet');
  }

  /**
   * Generate code for a single file
   */
  async generateForFile(_filePath: string): Promise<GeneratedFile | null> {
    // TODO: Implement single file generation
    throw new Error('Not implemented yet');
  }
}

