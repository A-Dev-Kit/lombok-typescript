import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { AnyClass } from '../../legacy/decorate.js';

export type FieldVisibility = 'public' | 'private' | 'protected';

export interface FieldDefaultsOptions {
  /** Default visibility for generated accessors. Default `'public'`. */
  level?: FieldVisibility;
  /** Treat non-readonly fields as readonly in generated code. Default `false`. */
  makeFinal?: boolean;
}

export function normalizeFieldDefaultsOptions(
  options: FieldDefaultsOptions = {},
): Required<FieldDefaultsOptions> {
  return {
    level: options.level ?? 'public',
    makeFinal: options.makeFinal ?? false,
  };
}

export function fieldDefaultsClassLegacy(
  backend: Backend,
  target: AnyClass,
  options: FieldDefaultsOptions = {},
): void {
  const normalized = normalizeFieldDefaultsOptions(options);
  backend.metadata.set(MetadataKeys.FIELD_DEFAULTS, target, undefined, normalized);
}

export function fieldDefaultsClassStage3(
  backend: Backend,
  _value: AnyClass,
  context: ClassDecoratorContext,
  options: FieldDefaultsOptions = {},
): void {
  const normalized = normalizeFieldDefaultsOptions(options);
  backend.metadata.set(MetadataKeys.FIELD_DEFAULTS, context.metadata as object, undefined, normalized);
}
