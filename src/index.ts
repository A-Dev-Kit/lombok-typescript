/**
 * `lombok-typescript`: a TypeScript port of Project Lombok plus GoF design
 * patterns as decorators.
 *
 * Decorators such as `@Data` and `@Builder` live on sub-paths (not this entry):
 * - `lombok-typescript/legacy`: legacy `experimentalDecorators` backend
 * - `lombok-typescript/stage3`: Stage 3 ECMAScript decorators backend
 * - `lombok-typescript/core`: backend-agnostic primitives
 * - `lombok-typescript/codegen`: ts-morph powered code generation
 *
 * @see https://github.com/A-Dev-Kit/lombok-typescript
 */

export type {
  Backend,
  MetadataStore,
  BackendKind,
  DecoratorKind,
  PropertyName,
} from './core/index.js';
export { MetadataKeys, METADATA_KEY_PREFIX, WeakMapMetadataStore } from './core/index.js';
export type { MetadataKey } from './core/index.js';

export { defineConfig } from './config.js';
export type {
  LombokConfig,
  LogConfig,
  BuilderConfig,
  ToStringConfig,
  ValidateConfig,
  CodegenConfig,
} from './config.js';

export { VERSION } from './version.js';
