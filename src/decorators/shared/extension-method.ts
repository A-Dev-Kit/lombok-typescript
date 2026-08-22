import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { AnyClass } from '../../legacy/decorate.js';

/**
 * A helper class whose static methods are exposed as instance methods on a
 * decorated class. Constructor arguments are irrelevant — only the class
 * itself is used, as a namespace for its statics.
 */
export type ExtensionHelper = Function; // eslint-disable-line @typescript-eslint/no-unsafe-function-type

export type ExtensionConflictPolicy = 'error' | 'skip' | 'override';

export interface ExtensionMethodOptions {
  /**
   * Behavior when a helper method's name already exists on the decorated class
   * (own property or non-`Object.prototype` ancestor). Defaults to `'error'`,
   * matching the fail-fast style of `@BuilderDefault` and `@Singular`.
   */
  onConflict?: ExtensionConflictPolicy;
  /** Only install methods with these names. */
  include?: readonly string[];
  /** Skip methods with these names. */
  exclude?: readonly string[];
}

interface RecordedHelper {
  helperName: string;
  methods: string[];
}

/** Never install these static keys — they exist on every function. */
const RESERVED_STATIC_KEYS: ReadonlySet<string> = new Set(['length', 'name', 'prototype']);

function collectStaticMethods(helper: ExtensionHelper): string[] {
  const names = Object.getOwnPropertyNames(helper);
  const methods: string[] = [];
  for (const name of names) {
    if (RESERVED_STATIC_KEYS.has(name)) continue;
    const value = (helper as unknown as Record<string, unknown>)[name];
    if (typeof value !== 'function') continue;
    methods.push(name);
  }
  return methods;
}

function existsOnUserChain(proto: object, name: string): boolean {
  let cur: object | null = proto;
  while (cur && cur !== Object.prototype) {
    if (Object.prototype.hasOwnProperty.call(cur, name)) return true;
    cur = Object.getPrototypeOf(cur) as object | null;
  }
  return false;
}

function existsOnPrototype(proto: object, name: string): boolean {
  return Object.prototype.hasOwnProperty.call(proto, name);
}

/**
 * Install every non-reserved static method from each helper as an instance
 * method on `proto`. Every installed method forwards `this` as the first
 * argument: `instance.foo(...args)` becomes `Helper.foo(instance, ...args)`.
 *
 * Records `{ helperName, methods }[]` under `MetadataKeys.EXTENSION_METHOD`
 * on `metadataTarget` for tooling introspection.
 */
export function installExtensionMethods(
  backend: Backend,
  metadataTarget: object,
  proto: object,
  className: string,
  helpers: readonly ExtensionHelper[],
  options: ExtensionMethodOptions = {},
): void {
  const onConflict: ExtensionConflictPolicy = options.onConflict ?? 'error';
  const include = options.include ? new Set(options.include) : undefined;
  const exclude = options.exclude ? new Set(options.exclude) : undefined;

  const recorded: RecordedHelper[] = [];

  for (const helper of helpers) {
    if (typeof helper !== 'function') {
      throw new TypeError(
        `@ExtensionMethod on ${className}: every helper must be a class or function; got ${typeof helper}`,
      );
    }
    const helperName = (helper as { name?: string }).name || 'anonymous';
    const installed: string[] = [];

    for (const methodName of collectStaticMethods(helper)) {
      if (include && !include.has(methodName)) continue;
      if (exclude && exclude.has(methodName)) continue;

      const alreadyInstalledByEarlierHelper = existsOnPrototype(proto, methodName);
      const conflictsWithUserCode =
        !alreadyInstalledByEarlierHelper && existsOnUserChain(proto, methodName);

      if (alreadyInstalledByEarlierHelper || conflictsWithUserCode) {
        if (onConflict === 'error') {
          throw new Error(
            `@ExtensionMethod on ${className}: method '${methodName}' from ${helperName} conflicts with an existing member; ` +
              `set onConflict: 'skip' or 'override' to change this`,
          );
        }
        if (onConflict === 'skip') continue;
        // 'override' — fall through and reinstall.
      }

      const helperRef = helper as unknown as Record<string, (...args: unknown[]) => unknown>;
      Object.defineProperty(proto, methodName, {
        value: function extensionMethodForward(this: unknown, ...args: unknown[]): unknown {
          return helperRef[methodName]!.call(helper, this, ...args);
        },
        configurable: true,
        writable: true,
        enumerable: false,
      });
      installed.push(methodName);
    }

    recorded.push({ helperName, methods: installed });
  }

  backend.metadata.set(MetadataKeys.EXTENSION_METHOD, metadataTarget, undefined, recorded);
}

export function extensionMethodClassLegacy(
  backend: Backend,
  target: AnyClass,
  helpers: readonly ExtensionHelper[],
  options: ExtensionMethodOptions = {},
): void {
  installExtensionMethods(
    backend,
    target,
    target.prototype as object,
    target.name || 'anonymous',
    helpers,
    options,
  );
}

export function extensionMethodClassStage3(
  backend: Backend,
  value: AnyClass,
  context: ClassDecoratorContext,
  helpers: readonly ExtensionHelper[],
  options: ExtensionMethodOptions = {},
): void {
  installExtensionMethods(
    backend,
    context.metadata as object,
    value.prototype as object,
    String(context.name ?? value.name ?? 'anonymous'),
    helpers,
    options,
  );
}
