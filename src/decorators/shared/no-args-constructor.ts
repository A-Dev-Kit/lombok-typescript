import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { AnyClass } from '../../legacy/decorate.js';

/**
 * Visibility hint for the generated factory. TypeScript has no runtime access
 * modifiers, so this value is recorded in metadata for tooling only; the
 * generated factory is always callable at runtime.
 */
export type NoArgsConstructorAccess = 'public' | 'protected' | 'private';

export interface NoArgsConstructorOptions {
  /**
   * Name of the generated static factory on the class. Defaults to `'noArgs'`.
   * Set to e.g. `'create'` to produce `Class.create()` (matches Java Lombok's
   * `@NoArgsConstructor(staticName = "create")`).
   */
  staticName?: string;
  /**
   * Documented visibility of the factory. Recorded in metadata for tooling;
   * no runtime enforcement (TypeScript has no runtime access control).
   */
  access?: NoArgsConstructorAccess;
  /**
   * When `true`, codegen still emits the factory if a required instance field
   * has no initializer. Those fields stay `undefined` (no Java-style zeroing).
   * Default `false`: codegen fails and names the class and field.
   */
  force?: boolean;
}

/** Default static-factory name when `staticName` is not provided. */
export const DEFAULT_NO_ARGS_STATIC_NAME = 'noArgs';

/** Shape stored under `MetadataKeys.NO_ARGS_CONSTRUCTOR` at class scope. */
export interface NoArgsConstructorMetadata {
  staticName: string;
  access: NoArgsConstructorAccess;
  force: boolean;
}

function normalize(input: NoArgsConstructorOptions | undefined): NoArgsConstructorMetadata {
  const staticName = input?.staticName ?? DEFAULT_NO_ARGS_STATIC_NAME;
  if (typeof staticName !== 'string' || staticName.trim().length === 0) {
    throw new TypeError(
      '@NoArgsConstructor: `staticName` must be a non-empty string when provided',
    );
  }
  if (input?.force !== undefined && typeof input.force !== 'boolean') {
    throw new TypeError('@NoArgsConstructor: `force` must be a boolean when provided');
  }
  return {
    staticName,
    access: input?.access ?? 'public',
    force: input?.force ?? false,
  };
}

/**
 * Legacy backend entry: write class-scope metadata recording the user's
 * options so codegen can emit the static factory. No runtime behavior; the
 * work happens in the codegen emitter (SRP).
 */
export function noArgsConstructorClassLegacy(
  backend: Backend,
  target: AnyClass,
  options: NoArgsConstructorOptions = {},
): void {
  backend.metadata.set(MetadataKeys.NO_ARGS_CONSTRUCTOR, target, undefined, normalize(options));
}

/** Stage 3 backend entry. Mirrors the legacy flow against the context metadata bag. */
export function noArgsConstructorClassStage3(
  backend: Backend,
  _value: AnyClass,
  context: ClassDecoratorContext,
  options: NoArgsConstructorOptions = {},
): void {
  backend.metadata.set(
    MetadataKeys.NO_ARGS_CONSTRUCTOR,
    context.metadata as object,
    undefined,
    normalize(options),
  );
}
