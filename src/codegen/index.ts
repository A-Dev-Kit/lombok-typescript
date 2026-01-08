/**
 * Code Generation Module
 *
 * Uses ts-morph to analyze decorated classes and generate
 * companion code at build time.
 */

export { CodeGenerator } from './generator';
export { LombokTransformer } from './transformer';
export { analyzeClass } from './analyzer';

// Types
export type { GeneratorOptions, GeneratedFile } from './types';

