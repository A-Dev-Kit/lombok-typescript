import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { AnyClass } from '../../legacy/decorate.js';

export interface CommandInstance {
  execute(): unknown;
  undo?(): unknown;
}

export function assertCommand(target: AnyClass): void {
  const proto = target.prototype as { execute?: unknown; undo?: unknown };
  if (typeof proto.execute !== 'function') {
    throw new Error(`@Command class ${target.name} must define execute()`);
  }
}

export function commandClassLegacy(backend: Backend, target: AnyClass): void {
  assertCommand(target);
  backend.metadata.set(MetadataKeys.COMMAND, target, undefined, true);
}

export function commandClassStage3(
  backend: Backend,
  value: AnyClass,
  context: ClassDecoratorContext,
): void {
  assertCommand(value);
  backend.metadata.set(MetadataKeys.COMMAND, context.metadata as object, undefined, true);
}
