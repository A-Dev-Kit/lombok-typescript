import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { Project } from 'ts-morph';
import { analyzeFile } from './analyzer.js';
import { emitCompanionFile } from './emitters/index.js';
import type { ClassInfo, GeneratedFile, GeneratorOptions } from './types.js';

const DEFAULT_OPTIONS: GeneratorOptions = {
  outputDir: '.lombok',
  watch: false,
  include: ['src/**/*.ts'],
  exclude: ['node_modules', '**/*.test.ts', '**/*.spec.ts', 'dist', '.lombok'],
  tsConfigPath: 'tsconfig.json',
};

/**
 * Codegen entry point.
 *
 * Walks the user's source files, finds decorated classes, and writes a
 * companion stub file per source. The stub today is just a comment-form
 * summary of each class. Once real decorators land, this is where their
 * generated TypeScript output will go.
 */
export class CodeGenerator {
  readonly options: GeneratorOptions;

  constructor(options: Partial<GeneratorOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Run codegen against all matching source files.
   *
   * Uses the project's `tsConfigPath` if it exists, otherwise an in-memory
   * project that processes the configured globs. For each file with at least
   * one class, writes a companion stub to `<outputDir>/<rel-path>.lombok.ts`.
   */
  async generate(): Promise<GeneratedFile[]> {
    const project = this.createProject();
    const sourceFiles = project.getSourceFiles();
    const generated: GeneratedFile[] = [];

    for (const sourceFile of sourceFiles) {
      if (!this.shouldProcess(sourceFile.getFilePath())) continue;

      const classes = analyzeFile(sourceFile);
      if (classes.length === 0) continue;

      const sourcePath = sourceFile.getFilePath();
      const outputPath = this.computeOutputPath(sourcePath);
      const { ts, dts } = emitCompanionFile(sourcePath, outputPath, classes, process.cwd());
      const content = ts;

      this.writeOutput(outputPath, content);
      this.writeOutput(outputPath.replace(/\.lombok\.ts$/u, '.lombok.d.ts'), dts);

      generated.push({
        sourcePath,
        outputPath,
        content,
        processedClasses: classes.map((c) => c.name),
      });
    }

    return generated;
  }

  /** Generate code for a single source file path. */
  async generateForFile(filePath: string): Promise<GeneratedFile | null> {
    const project = new Project({
      useInMemoryFileSystem: false,
      compilerOptions: { allowJs: false },
    });
    const sourceFile = project.addSourceFileAtPath(filePath);
    const classes = analyzeFile(sourceFile);
    if (classes.length === 0) return null;

    const outputPath = this.computeOutputPath(filePath);
    const { ts, dts } = emitCompanionFile(filePath, outputPath, classes, process.cwd());
    const content = ts;
    this.writeOutput(outputPath, content);
    this.writeOutput(outputPath.replace(/\.lombok\.ts$/u, '.lombok.d.ts'), dts);

    return {
      sourcePath: filePath,
      outputPath,
      content,
      processedClasses: classes.map((c) => c.name),
    };
  }

  /** Watch mode is not implemented yet. Re-run `lombok-ts generate` for now. */
  async watch(): Promise<void> {
    throw new Error(
      'Watch mode is not implemented yet. Re-run `lombok-ts generate` after changes.',
    );
  }

  // Internal helpers

  protected createProject(): Project {
    const tsConfig = resolve(this.options.tsConfigPath);
    if (existsSync(tsConfig)) {
      return new Project({ tsConfigFilePath: tsConfig });
    }
    const project = new Project({
      compilerOptions: { allowJs: false, target: 99 /* ESNext */ },
    });
    if (this.options.include.length > 0) {
      project.addSourceFilesAtPaths(this.options.include);
    }
    return project;
  }

  protected shouldProcess(filePath: string): boolean {
    const abs = filePath.replace(/\\/g, '/');
    const rel = relative(process.cwd(), filePath).replace(/\\/g, '/');

    const excluded = this.options.exclude.some(
      (pat) => matchesGlob(rel, pat) || matchesGlob(abs, pat),
    );
    if (excluded) return false;

    if (this.options.include.length === 0) return true;
    return this.options.include.some((pat) => matchesGlob(rel, pat) || matchesGlob(abs, pat));
  }

  protected computeOutputPath(sourcePath: string): string {
    const cwd = process.cwd();
    const rel = relative(cwd, sourcePath);
    const base = rel.replace(/\.ts$/u, '.lombok.ts');
    return resolve(cwd, this.options.outputDir, base);
  }

  protected renderCompanion(_sourcePath: string, _classes: readonly ClassInfo[]): string {
    return 'export {};\n';
  }

  protected writeOutput(outputPath: string, content: string): void {
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, content, 'utf8');
  }
}

/**
 * Minimal glob match. Handles `**`, `*`, no brace expansion. If we need more
 * we'd pull in `picomatch`, but this keeps the dep tree small.
 */
function matchesGlob(filePath: string, pattern: string): boolean {
  const norm = filePath.replace(/\\/g, '/');
  const regex = new RegExp(
    '^' +
      pattern
        .replace(/[.+^$()|[\]{}]/g, '\\$&')
        .replace(/\*\*\//g, '__GLOBSTAR_SLASH__')
        .replace(/\*\*/g, '__GLOBSTAR__')
        .replace(/\*/g, '[^/]*')
        .replace(/__GLOBSTAR_SLASH__/g, '(?:.*/)?')
        .replace(/__GLOBSTAR__/g, '.*') +
      '$',
    'u',
  );
  return regex.test(norm);
}
