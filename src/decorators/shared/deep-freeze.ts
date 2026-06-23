const OBJECT_TAG = '[object Object]';
const ARRAY_TAG = '[object Array]';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export function deepFreezeValue<T>(value: T, seen = new WeakSet<object>()): T {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (seen.has(value as object)) {
    return value;
  }
  seen.add(value as object);

  if (Array.isArray(value)) {
    for (const item of value) {
      deepFreezeValue(item, seen);
    }
    return Object.freeze(value);
  }

  const tag = Object.prototype.toString.call(value);
  if (tag === OBJECT_TAG || isPlainObject(value)) {
    for (const key of Object.getOwnPropertyNames(value)) {
      const child = (value as Record<string, unknown>)[key];
      deepFreezeValue(child, seen);
    }
    return Object.freeze(value);
  }

  if (tag === ARRAY_TAG) {
    return Object.freeze(value);
  }

  return value;
}

export function deepFreezeInstance<T extends object>(instance: T): T {
  for (const key of Object.getOwnPropertyNames(instance)) {
    const value = (instance as Record<string, unknown>)[key];
    (instance as Record<string, unknown>)[key] = deepFreezeValue(value);
  }
  return Object.freeze(instance);
}
