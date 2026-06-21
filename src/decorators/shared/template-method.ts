import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { AnyClass } from '../../legacy/decorate.js';

export interface TemplateMethodOptions {
  /** Template method name to generate or assign. Default `execute`. */
  template?: string;
  /** Hook step names in call order. */
  steps: string[];
}

export function templateMethodClassLegacy(
  backend: Backend,
  target: AnyClass,
  options: TemplateMethodOptions,
): void {
  if (!Array.isArray(options?.steps) || options.steps.length === 0) {
    throw new Error('@TemplateMethod requires a non-empty `steps` array');
  }
  backend.metadata.set(MetadataKeys.TEMPLATE_METHOD, target, undefined, options);
}

export function templateMethodClassStage3(
  backend: Backend,
  _value: AnyClass,
  context: ClassDecoratorContext,
  options: TemplateMethodOptions,
): void {
  if (!Array.isArray(options?.steps) || options.steps.length === 0) {
    throw new Error('@TemplateMethod requires a non-empty `steps` array');
  }
  backend.metadata.set(
    MetadataKeys.TEMPLATE_METHOD,
    context.metadata as object,
    undefined,
    options,
  );
}
