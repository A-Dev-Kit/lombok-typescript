import type { MetadataKeyList, PropertyName } from './types.js';

/**
 * Storage interface used by both decorator backends. Legacy delegates to
 * `reflect-metadata`; Stage 3 uses the WeakMap implementation below.
 */
export interface MetadataStore {
  /** Store `value` under `key`. Omit `propertyKey` for class-level scope. */
  set<V>(key: string, target: object, propertyKey: PropertyName | undefined, value: V): void;

  /** Read the value stored under `key`, or `undefined`. */
  get<V>(key: string, target: object, propertyKey?: PropertyName): V | undefined;

  /** True if `key` exists at the given scope. */
  has(key: string, target: object, propertyKey?: PropertyName): boolean;

  /** Remove the entry. Returns true if it existed. */
  delete(key: string, target: object, propertyKey?: PropertyName): boolean;

  /** All keys at the given scope. */
  list(target: object, propertyKey?: PropertyName): MetadataKeyList;
}

/**
 * WeakMap-backed `MetadataStore`. Used directly by the Stage 3 backend.
 * Layout: target -> (propertyKey or class-level) -> key -> value.
 */
export class WeakMapMetadataStore implements MetadataStore {
  private readonly classScopes = new WeakMap<object, Map<string, unknown>>();
  private readonly memberScopes = new WeakMap<object, Map<string | symbol, Map<string, unknown>>>();

  set<V>(key: string, target: object, propertyKey: PropertyName | undefined, value: V): void {
    const bucket = this.bucket(target, propertyKey, true)!;
    bucket.set(key, value);
  }

  get<V>(key: string, target: object, propertyKey?: PropertyName): V | undefined {
    const bucket = this.bucket(target, propertyKey, false);
    return bucket?.get(key) as V | undefined;
  }

  has(key: string, target: object, propertyKey?: PropertyName): boolean {
    const bucket = this.bucket(target, propertyKey, false);
    return bucket?.has(key) ?? false;
  }

  delete(key: string, target: object, propertyKey?: PropertyName): boolean {
    const bucket = this.bucket(target, propertyKey, false);
    if (!bucket) return false;
    return bucket.delete(key);
  }

  list(target: object, propertyKey?: PropertyName): MetadataKeyList {
    const bucket = this.bucket(target, propertyKey, false);
    if (!bucket) return [];
    return Array.from(bucket.keys());
  }

  private bucket(
    target: object,
    propertyKey: PropertyName | undefined,
    createIfMissing: boolean,
  ): Map<string, unknown> | undefined {
    if (propertyKey === undefined) {
      let bucket = this.classScopes.get(target);
      if (!bucket && createIfMissing) {
        bucket = new Map();
        this.classScopes.set(target, bucket);
      }
      return bucket;
    }

    let perTarget = this.memberScopes.get(target);
    if (!perTarget) {
      if (!createIfMissing) return undefined;
      perTarget = new Map();
      this.memberScopes.set(target, perTarget);
    }

    let bucket = perTarget.get(propertyKey);
    if (!bucket) {
      if (!createIfMissing) return undefined;
      bucket = new Map();
      perTarget.set(propertyKey, bucket);
    }
    return bucket;
  }
}
