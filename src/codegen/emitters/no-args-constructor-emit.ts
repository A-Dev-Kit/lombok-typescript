import type { ClassInfo, FieldInfo } from '../types.js';
import { hasClassDecorator } from './helpers.js';
import { getAllArgsStaticName, hasAllArgsConstructor } from './all-args-constructor-emit.js';

/** Default static-factory name when `@NoArgsConstructor` is used without options. */
export const DEFAULT_NO_ARGS_STATIC_NAME = 'noArgs';

/** True when the class carries `@NoArgsConstructor`. */
export function hasNoArgsConstructor(info: ClassInfo): boolean {
  return hasClassDecorator(info, 'NoArgsConstructor');
}

function decoratorArg(info: ClassInfo): string | undefined {
  const raw = info.decorators.find((d) => d.name === 'NoArgsConstructor')?.arguments[0];
  return typeof raw === 'string' ? raw : undefined;
}

/**
 * Resolve the static-factory name from the first decorator argument.
 * `@NoArgsConstructor()` returns the default; `@NoArgsConstructor({ staticName: 'create' })`
 * returns `'create'`. Any other shape falls back to the default.
 */
export function getNoArgsStaticName(info: ClassInfo): string {
  const raw = decoratorArg(info);
  if (raw === undefined) return DEFAULT_NO_ARGS_STATIC_NAME;
  const match = /staticName\s*:\s*['"]([^'"]+)['"]/u.exec(raw);
  return match?.[1] ?? DEFAULT_NO_ARGS_STATIC_NAME;
}

/** True when the decorator argument sets `force: true`. */
export function getNoArgsForce(info: ClassInfo): boolean {
  const raw = decoratorArg(info);
  if (raw === undefined) return false;
  return /force\s*:\s*true\b/u.test(raw);
}

function instanceFields(info: ClassInfo): FieldInfo[] {
  return info.fields.filter((f) => !f.isStatic);
}

/** Required instance fields with no initializer. Java `force` exists for these. */
function uninitializedRequiredFields(info: ClassInfo): FieldInfo[] {
  return instanceFields(info).filter((f) => !f.isOptional && !f.hasDefault);
}

function hasStaticFactoryShim(info: ClassInfo, staticName: string): boolean {
  return (
    info.fields.some((f) => f.isStatic && f.name === staticName) ||
    info.methods.some((m) => m.isStatic && m.name === staticName)
  );
}

/**
 * Codegen-time guards: identical `staticName` with `@AllArgsConstructor`, and
 * required fields that lack an initializer unless `{ force: true }`.
 */
export function assertNoArgsConstructor(info: ClassInfo): void {
  if (!hasNoArgsConstructor(info)) return;

  const staticName = getNoArgsStaticName(info);
  if (hasAllArgsConstructor(info) && getAllArgsStaticName(info) === staticName) {
    throw new Error(
      `Class "${info.name}": @NoArgsConstructor and @AllArgsConstructor cannot share staticName "${staticName}".`,
    );
  }

  if (getNoArgsForce(info)) return;

  const missing = uninitializedRequiredFields(info);
  if (missing.length === 0) return;
  const names = missing.map((f) => `"${f.name}"`).join(', ');
  const noun = missing.length === 1 ? 'field' : 'fields';
  const verb = missing.length === 1 ? 'has' : 'have';
  throw new Error(
    `Class "${info.name}": @NoArgsConstructor requires { force: true } because ${noun} ${names} ${verb} no initializer.`,
  );
}

/**
 * Emit the free-standing no-args factory. Uses `Object.create` so the user's
 * constructor and field initializers are not invoked. No fields are assigned.
 */
export function emitNoArgsConstructorFn(info: ClassInfo): string {
  if (!hasNoArgsConstructor(info)) return '';
  assertNoArgsConstructor(info);

  return `
function ${info.name}_noArgs(): ${info.name} {
  const instance = Object.create(${info.name}.prototype) as ${info.name};
  return instance;
}`.trim();
}

/**
 * Emit the assignment that installs the factory on the class constructor,
 * for the `apply${Name}Generated(ctor)` block.
 */
export function emitNoArgsConstructorApplyAssignment(info: ClassInfo): string {
  if (!hasNoArgsConstructor(info)) return '';
  assertNoArgsConstructor(info);
  const staticName = getNoArgsStaticName(info);
  return `(ctor as typeof ${info.name} & { ${staticName}(): ${info.name} }).${staticName} = ${info.name}_noArgs;`;
}

/**
 * Declaration-shim lines so `.lombok.augment.d.ts` types `Class.noArgs()`
 * (or the custom `staticName`). Skipped when the source already declares
 * that static member (a type shim), which would be a duplicate identifier.
 */
export function emitNoArgsConstructorNamespaceLines(info: ClassInfo): string[] {
  if (!hasNoArgsConstructor(info)) return [];
  assertNoArgsConstructor(info);
  const staticName = getNoArgsStaticName(info);
  if (hasStaticFactoryShim(info, staticName)) return [];
  return [
    `  namespace ${info.name} {`,
    `    export function ${staticName}(): ${info.name};`,
    `  }`,
    '',
  ];
}
