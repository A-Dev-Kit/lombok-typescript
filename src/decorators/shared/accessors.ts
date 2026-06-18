import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { AnyClass } from '../../legacy/decorate.js';

export interface AccessorsOptions {
  /** When true, setters return `this` for chaining. Alias: `fluent`. */
  chain?: boolean;
  /** Alias for `chain`. */
  fluent?: boolean;
}

export function normalizeAccessorsOptions(
  options: AccessorsOptions = {},
): Required<Pick<AccessorsOptions, 'chain'>> {
  return { chain: Boolean(options.chain ?? options.fluent) };
}

export function accessorsClassLegacy(
  backend: Backend,
  target: AnyClass,
  options: AccessorsOptions = {},
): void {
  const normalized = normalizeAccessorsOptions(options);
  backend.metadata.set(MetadataKeys.ACCESSORS, target, undefined, normalized);
}

export function accessorsClassStage3(
  backend: Backend,
  value: AnyClass,
  context: ClassDecoratorContext,
  options: AccessorsOptions = {},
): void {
  const normalized = normalizeAccessorsOptions(options);
  backend.metadata.set(MetadataKeys.ACCESSORS, context.metadata as object, undefined, normalized);
  void value;
}
