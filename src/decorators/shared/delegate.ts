import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { PropertyName } from '../../core/types.js';
import { fieldMarkerLegacy, fieldMarkerStage3 } from './markers.js';

export type DelegateMethods = readonly string[];

export function parseDelegateMethods(args: unknown[]): DelegateMethods {
  if (args.length === 0) return [];
  if (args.length === 1 && Array.isArray(args[0])) {
    return args[0] as string[];
  }
  return args.map(String);
}

export function delegateFieldLegacy(
  backend: Backend,
  targetPrototype: object,
  propertyKey: PropertyName,
  methods: DelegateMethods = [],
): void {
  fieldMarkerLegacy(backend, targetPrototype, propertyKey, MetadataKeys.DELEGATE, methods);
}

export function delegateFieldStage3(
  backend: Backend,
  context: ClassFieldDecoratorContext,
  methods: DelegateMethods = [],
): void {
  fieldMarkerStage3(backend, context, MetadataKeys.DELEGATE, methods);
}
