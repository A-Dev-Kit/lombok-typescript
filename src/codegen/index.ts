/**
 * ts-morph powered code generation. The standalone `lombok-ts generate` CLI
 * is the entry point most users care about; this module exports the building
 * blocks for programmatic use.
 */

export { CodeGenerator } from './generator.js';
export { LombokTransformer } from './transformer.js';
export { analyzeFile, analyzeClassByName, analyzeSourceString, analyzeClass } from './analyzer.js';

export type {
  GeneratorOptions,
  GeneratedFile,
  ClassInfo,
  FieldInfo,
  MethodInfo,
  ParameterInfo,
  DecoratorInfo,
} from './types.js';
