import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { AnyClass } from '../../legacy/decorate.js';

/**
 * Visibility hint for the generated factory. TypeScript has no runtime access
 * modifiers, so this value is recorded in metadata for tooling only; the
 * generated factory is always callable at runtime.
 */
export type AllArgsConstructorAccess = 'public' | 'protected' | 'private';

export interface AllArgsConstructorOptions {
  /**
   * Name of the generated static factory on the class. Defaults to `'allArgs'`.
   * Set to e.g. `'of'` to produce `Class.of(...fields)` (matches Java Lombok's
   * `@AllArgsConstructor(staticName = "of")`).
   */
  staticName?: string;
  /**
   * Documented visibility of the factory. Recorded in metadata for tooling;
   * no runtime enforcement (TypeScript has no runtime access control).
   */
  access?: AllArgsConstructorAccess;
}

/** Default static-factory name when `staticName` is not provided. */
export const DEFAULT_ALL_ARGS_STATIC_NAME = 'allArgs';

/** Shape stored under `MetadataKeys.ALL_ARGS_CONSTRUCTOR` at class scope. */
export interface AllArgsConstructorMetadata {
  staticName: string;
  access: AllArgsConstructorAccess;
}

function normalize(input: AllArgsConstructorOptions | undefined): AllArgsConstructorMetadata {
  const staticName = input?.staticName ?? DEFAULT_ALL_ARGS_STATIC_NAME;
  if (typeof staticName !== 'string' || staticName.trim().length === 0) {
    throw new TypeError(
      "@AllArgsConstructor: `staticName` must be a non-empty string when provided",
    );
  }
  return {
    staticName,
    access: input?.access ?? 'public',
  };
}

/**
 * Legacy backend entry: write class-scope metadata recording the user's
 * options so codegen can emit the static factory. No runtime behavior; the
 * work happens in the codegen emitter (SRP).
 */
export function allArgsConstructorClassLegacy(
  backend: Backend,
  target: AnyClass,
  options: AllArgsConstructorOptions = {},
): void {
  backend.metadata.set(
    MetadataKeys.ALL_ARGS_CONSTRUCTOR,
    target,
    undefined,
    normalize(options),
  );
}

/** Stage 3 backend entry. Mirrors the legacy flow against the context metadata bag. */
export function allArgsConstructorClassStage3(
  backend: Backend,
  _value: AnyClass,
  context: ClassDecoratorContext,
  options: AllArgsConstructorOptions = {},
): void {
  backend.metadata.set(
    MetadataKeys.ALL_ARGS_CONSTRUCTOR,
    context.metadata as object,
    undefined,
    normalize(options),
  );
}
