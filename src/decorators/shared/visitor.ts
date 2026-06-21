import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { AnyClass } from '../../legacy/decorate.js';

const visitableRegistry = new Map<string, AnyClass>();

export function registerVisitable(name: string, ctor: AnyClass): void {
  visitableRegistry.set(name, ctor);
}

export function getVisitableRegistry(): ReadonlyMap<string, AnyClass> {
  return visitableRegistry;
}

export interface VisitorOptions {
  visitMethods: Record<string, string>;
}

export interface VisitableOptions {
  acceptMethod?: string;
}

export function visitorClassLegacy(
  backend: Backend,
  target: AnyClass,
  options: VisitorOptions,
): void {
  if (!options?.visitMethods || typeof options.visitMethods !== 'object') {
    throw new Error('@Visitor requires a `visitMethods` map');
  }
  backend.metadata.set(MetadataKeys.VISITOR, target, undefined, options);
}

export function visitorClassStage3(
  backend: Backend,
  _value: AnyClass,
  context: ClassDecoratorContext,
  options: VisitorOptions,
): void {
  if (!options?.visitMethods || typeof options.visitMethods !== 'object') {
    throw new Error('@Visitor requires a `visitMethods` map');
  }
  backend.metadata.set(MetadataKeys.VISITOR, context.metadata as object, undefined, options);
}

export function visitableClassLegacy(
  backend: Backend,
  target: AnyClass,
  options: VisitableOptions = {},
): void {
  backend.metadata.set(MetadataKeys.VISITABLE, target, undefined, options);
  registerVisitable(target.name, target);
}

export function visitableClassStage3(
  backend: Backend,
  value: AnyClass,
  context: ClassDecoratorContext,
  options: VisitableOptions = {},
): void {
  backend.metadata.set(MetadataKeys.VISITABLE, context.metadata as object, undefined, options);
  registerVisitable(value.name, value);
}
