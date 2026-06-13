import 'reflect-metadata';
import type { Backend } from '../core/backend.js';
import type { MetadataStore } from '../core/metadata-store.js';
import type { MetadataKeyList, PropertyName } from '../core/types.js';

/**
 * `MetadataStore` that delegates to the global `Reflect.metadata` registry from
 * `reflect-metadata`. Storage layer for the legacy `experimentalDecorators`
 * standard.
 */
class ReflectMetadataStore implements MetadataStore {
  set<V>(key: string, target: object, propertyKey: PropertyName | undefined, value: V): void {
    if (propertyKey === undefined) {
      Reflect.defineMetadata(key, value, target);
    } else {
      Reflect.defineMetadata(key, value, target, propertyKey);
    }
  }

  get<V>(key: string, target: object, propertyKey?: PropertyName): V | undefined {
    if (propertyKey === undefined) {
      return Reflect.getOwnMetadata(key, target) as V | undefined;
    }
    return Reflect.getOwnMetadata(key, target, propertyKey) as V | undefined;
  }

  has(key: string, target: object, propertyKey?: PropertyName): boolean {
    if (propertyKey === undefined) {
      return Reflect.hasOwnMetadata(key, target);
    }
    return Reflect.hasOwnMetadata(key, target, propertyKey);
  }

  delete(key: string, target: object, propertyKey?: PropertyName): boolean {
    const had = this.has(key, target, propertyKey);
    if (!had) return false;
    if (propertyKey === undefined) {
      Reflect.deleteMetadata(key, target);
    } else {
      Reflect.deleteMetadata(key, target, propertyKey);
    }
    return true;
  }

  list(target: object, propertyKey?: PropertyName): MetadataKeyList {
    if (propertyKey === undefined) {
      return (Reflect.getOwnMetadataKeys(target) as PropertyName[]).map(String);
    }
    return (Reflect.getOwnMetadataKeys(target, propertyKey) as PropertyName[]).map(String);
  }
}

/** Backend for the legacy `experimentalDecorators` standard. Use the singleton `legacyBackend`. */
export class LegacyBackend implements Backend {
  readonly kind = 'legacy' as const;
  readonly metadata: MetadataStore = new ReflectMetadataStore();
}

/** Shared instance. Legacy decorators rely on global metadata storage anyway. */
export const legacyBackend = new LegacyBackend();
