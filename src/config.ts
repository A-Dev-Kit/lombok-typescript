import type { BackendKind } from './core/types.js';

export interface LogConfig {
  /** Logging provider. Default `'console'`. */
  provider: 'console' | 'winston' | 'pino' | 'bunyan';

  /** Default log level. Default `'info'`. */
  defaultLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface BuilderConfig {
  /** Prefix for builder setter methods. Default `''` (so `name()`, not `withName()`). */
  prefix: string;

  /** Name of the build method. Default `'build'`. */
  buildMethodName: string;

  /** Name of the static builder method. Default `'builder'`. */
  builderMethodName: string;
}

export interface ToStringConfig {
  /** Output format. Default `'pretty'`. */
  format: 'pretty' | 'json' | 'compact';

  /** Include the class name in output. Default `true`. */
  includeClassName: boolean;
}

export interface ValidateConfig {
  /** Validation library. Default `'zod'`. */
  provider: 'zod' | 'yup' | 'class-validator';

  /** Throw on validation failure. Default `true`. */
  throwOnError: boolean;
}

export interface CodegenConfig {
  /** Where to write generated companion files. Default `'.lombok'`. */
  outputDir: string;

  /** Glob patterns for files to process. Default `['src/** /*.ts']`. */
  include: string[];

  /** Glob patterns for files to skip. Defaults exclude tests, `dist`, and `.lombok`. */
  exclude: string[];

  /** Path to the project's tsconfig. Default `'tsconfig.json'`. */
  tsConfigPath: string;

  /** Watch for source changes. Not implemented yet. Default `false`. */
  watch: boolean;
}

/**
 * Top-level lombok-typescript config.
 *
 * `backend` chooses which decorator standard to assume:
 * - `'legacy'`: `experimentalDecorators` (NestJS / class-validator ecosystem)
 * - `'stage3'`: Stage 3 ECMAScript decorators (TS 5.0+)
 * - `'auto'`: detect from the project's tsconfig
 *
 * The `@ToString` config field is named `formatToString` (not `toString`) so it
 * doesn't clash with `Object.prototype.toString`.
 */
export interface LombokConfig {
  /** Decorator backend. Default `'auto'`. */
  backend?: BackendKind | 'auto';

  log?: Partial<LogConfig>;
  builder?: Partial<BuilderConfig>;
  /** Settings for the `@ToString` decorator. */
  formatToString?: Partial<ToStringConfig>;
  validate?: Partial<ValidateConfig>;
  codegen?: Partial<CodegenConfig>;
}

/**
 * Identity helper that gives you autocomplete in `lombok.config.ts`.
 *
 * @example
 * import { defineConfig } from 'lombok-typescript';
 *
 * export default defineConfig({
 *   backend: 'legacy',
 *   log: { provider: 'winston' },
 *   builder: { prefix: 'with' },
 * });
 */
export function defineConfig(config: LombokConfig): LombokConfig {
  return config;
}
