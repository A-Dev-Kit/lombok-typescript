/**
 * Configuration
 *
 * Define configuration for lombok-typescript behavior.
 */

export interface LogConfig {
  /**
   * Logging provider to use
   * @default 'console'
   */
  provider: 'console' | 'winston' | 'pino' | 'bunyan';

  /**
   * Default log level
   * @default 'info'
   */
  defaultLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface BuilderConfig {
  /**
   * Prefix for builder setter methods
   * @default '' (no prefix, e.g., name() instead of withName())
   */
  prefix: string;

  /**
   * Name of the build method
   * @default 'build'
   */
  buildMethodName: string;

  /**
   * Name of the static builder method
   * @default 'builder'
   */
  builderMethodName: string;
}

export interface ToStringConfig {
  /**
   * Output format
   * @default 'pretty'
   */
  format: 'pretty' | 'json' | 'compact';

  /**
   * Include class name in output
   * @default true
   */
  includeClassName: boolean;
}

export interface ValidateConfig {
  /**
   * Validation library to use
   * @default 'zod'
   */
  provider: 'zod' | 'yup' | 'class-validator';

  /**
   * Throw error on validation failure
   * @default true
   */
  throwOnError: boolean;
}

export interface CodegenConfig {
  /**
   * Directory for generated files
   * @default '.lombok'
   */
  outputDir: string;

  /**
   * Watch for changes
   * @default false
   */
  watch: boolean;
}

export interface LombokConfig {
  log?: Partial<LogConfig>;
  builder?: Partial<BuilderConfig>;
  toString?: Partial<ToStringConfig>;
  validate?: Partial<ValidateConfig>;
  codegen?: Partial<CodegenConfig>;
}

/**
 * Define lombok-typescript configuration
 *
 * @example
 * // lombok.config.ts
 * import { defineConfig } from 'lombok-typescript';
 *
 * export default defineConfig({
 *   log: { provider: 'winston' },
 *   builder: { prefix: 'with' },
 * });
 */
export function defineConfig(config: LombokConfig): LombokConfig {
  return config;
}

