import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { PropertyName } from '../../core/types.js';

export interface CleanupOptions {
  /** Method to call on the field value at dispose. Default `'close'`. */
  method?: string;
}

const DEFAULT_METHOD = 'close';
const CLEANUP_INSTALLED = Symbol.for('lombok-ts:cleanupInstalled');
const CLEANUP_INSTALLED_FN = Symbol.for('lombok-ts:cleanupInstalledFn');

interface CleanupEntry {
  field: PropertyName;
  method: string;
}

/** Per-prototype ordered list of Cleanup-marked fields (declaration order). */
const cleanupRegistry = new WeakMap<object, CleanupEntry[]>();

function entriesFor(proto: object): CleanupEntry[] {
  let list = cleanupRegistry.get(proto);
  if (!list) {
    list = [];
    cleanupRegistry.set(proto, list);
  }
  return list;
}

interface DisposeCarrier {
  [Symbol.dispose]?: () => void;
  [CLEANUP_INSTALLED]?: true;
}

function callCleanup(instance: object, entry: CleanupEntry): void {
  const value = (instance as Record<PropertyKey, unknown>)[entry.field as PropertyKey] as
    { [k: string]: unknown } | null | undefined;
  if (value == null) return;
  const fn = value[entry.method];
  if (typeof fn !== 'function') {
    throw new Error(
      `Cleanup: field '${String(entry.field)}' value has no method '${entry.method}'`,
    );
  }
  (fn as (this: unknown) => unknown).call(value);
}

function installDisposeOn(proto: object): void {
  const carrier = proto as DisposeCarrier;
  if (Object.prototype.hasOwnProperty.call(carrier, CLEANUP_INSTALLED)) return;

  // Preserve any existing dispose (user-defined on this proto or inherited from
  // an ancestor's own Cleanup install). We chain differently for each: user
  // code runs first (matches "class body" semantics), our own ancestor install
  // runs last (LIFO teardown across inheritance).
  const previous = carrier[Symbol.dispose];
  const previousIsOurs =
    typeof previous === 'function' &&
    (previous as unknown as { [k: symbol]: unknown })[CLEANUP_INSTALLED_FN] === true;

  const runFields = (self: object, seedError: unknown): unknown => {
    let firstError = seedError;
    const list = entriesFor(proto);
    for (let i = list.length - 1; i >= 0; i--) {
      const entry = list[i];
      if (!entry) continue;
      try {
        callCleanup(self, entry);
      } catch (err) {
        if (firstError === undefined) firstError = err;
      }
    }
    return firstError;
  };

  const dispose = function dispose(this: object): void {
    let firstError: unknown;
    if (previousIsOurs) {
      // Ancestor Cleanup install — run OUR (more-derived) fields first, then chain.
      firstError = runFields(this, undefined);
      try {
        (previous as () => void).call(this);
      } catch (err) {
        if (firstError === undefined) firstError = err;
      }
    } else {
      // User-defined dispose (or nothing) — run it first, then our fields.
      if (typeof previous === 'function') {
        try {
          previous.call(this);
        } catch (err) {
          firstError = err;
        }
      }
      firstError = runFields(this, firstError);
    }
    if (firstError !== undefined) throw firstError;
  };

  (dispose as unknown as { [k: symbol]: unknown })[CLEANUP_INSTALLED_FN] = true;

  Object.defineProperty(proto, Symbol.dispose, {
    value: dispose,
    configurable: true,
    writable: true,
    enumerable: false,
  });
  Object.defineProperty(proto, CLEANUP_INSTALLED, {
    value: true,
    configurable: true,
    writable: false,
    enumerable: false,
  });
}

function normalize(input: CleanupOptions | undefined): CleanupEntry['method'] {
  return input?.method ?? DEFAULT_METHOD;
}

export function cleanupFieldLegacy(
  backend: Backend,
  proto: object,
  key: PropertyName,
  options: CleanupOptions = {},
): void {
  const method = normalize(options);
  backend.metadata.set(MetadataKeys.CLEANUP, proto, key, { method });
  entriesFor(proto).push({ field: key, method });
  installDisposeOn(proto);
}

export function cleanupFieldStage3(
  backend: Backend,
  context: ClassFieldDecoratorContext,
  options: CleanupOptions = {},
): void {
  const method = normalize(options);
  backend.metadata.set(MetadataKeys.CLEANUP, context.metadata as object, context.name, {
    method,
  });
  context.addInitializer(function (this: unknown) {
    const proto = Object.getPrototypeOf(this as object) as object;
    const list = entriesFor(proto);
    if (!list.some((e) => e.field === context.name)) {
      list.push({ field: context.name, method });
    }
    installDisposeOn(proto);
  });
}
