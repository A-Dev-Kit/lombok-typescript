/**
 * Placeholder for a TypeScript compiler transformer that would run codegen as
 * part of `tsc` itself (via `ts-patch` or `ttypescript`).
 *
 * For now the standalone `lombok-ts` CLI is the only codegen path. This file
 * exists so importing a transformer gives a clear "not yet" rather than a
 * module-not-found.
 */
export class LombokTransformer {
  constructor() {
    throw new Error('LombokTransformer is not implemented yet. Use `lombok-ts generate` for now.');
  }
}
