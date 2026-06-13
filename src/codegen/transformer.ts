/**
 * Placeholder for a TypeScript compiler transformer that would run codegen as
 * part of `tsc` itself (via `ts-patch` or `ttypescript`). Decision lives in
 * `docs/adr/0004-codegen-execution-model.md`.
 *
 * For now the standalone `lombok-ts` CLI is the only codegen path. This file
 * exists so importing a transformer gives a clear "not yet" rather than a
 * module-not-found.
 */
export class LombokTransformer {
  constructor() {
    throw new Error(
      'LombokTransformer is not implemented yet. ' +
        'See docs/adr/0004-codegen-execution-model.md. ' +
        'Use `lombok-ts generate` for now.',
    );
  }
}
