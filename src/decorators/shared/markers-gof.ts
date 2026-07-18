import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { AnyClass } from '../../legacy/decorate.js';
import { legacyBackend } from '../../legacy/backend.js';
import { stage3Backend } from '../../stage3/backend.js';
import { codegenClassMarkerLegacy, codegenClassMarkerStage3 } from './factory.js';

export interface AdapterOptions {
  adapts: AnyClass;
  target: AnyClass;
}

export interface FacadeOptions {
  subsystems?: AnyClass[];
}

export interface NullObjectOptions {
  /** The class or interface constructor this null implementation stands in for. */
  of: AnyClass;
}

function assertConstructor(value: unknown, label: string): asserts value is AnyClass {
  if (typeof value !== 'function') {
    throw new Error(`${label} must be a constructor function`);
  }
}

export function getGoFMarkerMetadata<T>(target: AnyClass, metadataKey: string): T | undefined {
  const fromLegacy = legacyBackend.metadata.get<T>(metadataKey, target, undefined);
  if (fromLegacy !== undefined) {
    return fromLegacy;
  }
  const meta = (target as { [Symbol.metadata]?: object })[Symbol.metadata];
  if (meta) {
    return stage3Backend.metadata.get<T>(metadataKey, meta, undefined);
  }
  return undefined;
}

export function adapterClassLegacy(
  backend: Backend,
  target: AnyClass,
  options: AdapterOptions,
): void {
  assertConstructor(options.adapts, '@Adapter adapts');
  assertConstructor(options.target, '@Adapter target');
  backend.metadata.set(MetadataKeys.ADAPTER, target, undefined, options);
}

export function adapterClassStage3(
  backend: Backend,
  _value: AnyClass,
  context: ClassDecoratorContext,
  options: AdapterOptions,
): void {
  assertConstructor(options.adapts, '@Adapter adapts');
  assertConstructor(options.target, '@Adapter target');
  backend.metadata.set(MetadataKeys.ADAPTER, context.metadata as object, undefined, options);
}

export function bridgeClassLegacy(backend: Backend, target: AnyClass): void {
  codegenClassMarkerLegacy(backend, target, MetadataKeys.BRIDGE);
}

export function bridgeClassStage3(
  backend: Backend,
  value: AnyClass,
  context: ClassDecoratorContext,
): void {
  codegenClassMarkerStage3(backend, value, context, MetadataKeys.BRIDGE);
}

export function facadeClassLegacy(
  backend: Backend,
  target: AnyClass,
  options: FacadeOptions = {},
): void {
  if (options.subsystems) {
    for (const subsystem of options.subsystems) {
      assertConstructor(subsystem, '@Facade subsystems[]');
    }
  }
  backend.metadata.set(MetadataKeys.FACADE, target, undefined, options);
}

export function facadeClassStage3(
  backend: Backend,
  _value: AnyClass,
  context: ClassDecoratorContext,
  options: FacadeOptions = {},
): void {
  if (options.subsystems) {
    for (const subsystem of options.subsystems) {
      assertConstructor(subsystem, '@Facade subsystems[]');
    }
  }
  backend.metadata.set(MetadataKeys.FACADE, context.metadata as object, undefined, options);
}

export function mediatorClassLegacy(backend: Backend, target: AnyClass): void {
  codegenClassMarkerLegacy(backend, target, MetadataKeys.MEDIATOR);
}

export function mediatorClassStage3(
  backend: Backend,
  value: AnyClass,
  context: ClassDecoratorContext,
): void {
  codegenClassMarkerStage3(backend, value, context, MetadataKeys.MEDIATOR);
}

export function interpreterClassLegacy(backend: Backend, target: AnyClass): void {
  codegenClassMarkerLegacy(backend, target, MetadataKeys.INTERPRETER);
}

export function interpreterClassStage3(
  backend: Backend,
  value: AnyClass,
  context: ClassDecoratorContext,
): void {
  codegenClassMarkerStage3(backend, value, context, MetadataKeys.INTERPRETER);
}

export function nullObjectClassLegacy(
  backend: Backend,
  target: AnyClass,
  options: NullObjectOptions,
): void {
  assertConstructor(options?.of, '@NullObject of');
  backend.metadata.set(MetadataKeys.NULL_OBJECT, target, undefined, options);
}

export function nullObjectClassStage3(
  backend: Backend,
  _value: AnyClass,
  context: ClassDecoratorContext,
  options: NullObjectOptions,
): void {
  assertConstructor(options?.of, '@NullObject of');
  backend.metadata.set(MetadataKeys.NULL_OBJECT, context.metadata as object, undefined, options);
}
