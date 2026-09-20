import type { ClassInfo } from '../types.js';
import { formatFieldTypeForEmit, hasClassDecorator } from './helpers.js';

/** Default static-factory name when `@AllArgsConstructor` is used without options. */
export const DEFAULT_ALL_ARGS_STATIC_NAME = 'allArgs';

/** True when the class carries `@AllArgsConstructor`. */
export function hasAllArgsConstructor(info: ClassInfo): boolean {
  return hasClassDecorator(info, 'AllArgsConstructor');
}

/**
 * Resolve the static-factory name from the first decorator argument.
 * `@AllArgsConstructor()` returns the default; `@AllArgsConstructor({ staticName: 'of' })`
 * returns `'of'`. Any other shape falls back to the default to keep codegen total.
 */
export function getAllArgsStaticName(info: ClassInfo): string {
  const dec = info.decorators.find((d) => d.name === 'AllArgsConstructor');
  const raw = dec?.arguments[0];
  if (typeof raw !== 'string') return DEFAULT_ALL_ARGS_STATIC_NAME;
  const match = /staticName\s*:\s*['"]([^'"]+)['"]/u.exec(raw);
  return match?.[1] ?? DEFAULT_ALL_ARGS_STATIC_NAME;
}

interface EmittedParam {
  name: string;
  typeAnnotation: string;
}

function emittedParams(info: ClassInfo): EmittedParam[] {
  return info.fields.map((f) => ({
    name: f.name,
    typeAnnotation: `${f.name}${f.isOptional ? '?' : ''}: ${formatFieldTypeForEmit(f.type, f.isOptional)}`,
  }));
}

/**
 * Emit the free-standing factory function for the class.
 * Uses `Object.create(ctor.prototype)` so the user's own constructor (if any)
 * is not invoked and `instanceof` identity is preserved. Fields are assigned
 * in declaration order (Java `@AllArgsConstructor` parity).
 */
export function emitAllArgsConstructorFn(info: ClassInfo): string {
  if (!hasAllArgsConstructor(info)) return '';

  const params = emittedParams(info).map((p) => p.typeAnnotation).join(', ');
  const assigns = info.fields
    .map((f) => `  instance.${f.name} = ${f.name};`)
    .join('\n');
  const body = info.fields.length === 0 ? '' : `\n${assigns}`;

  return `
function ${info.name}_allArgs(${params}): ${info.name} {
  const instance = Object.create(${info.name}.prototype) as ${info.name};${body}
  return instance;
}`.trim();
}

/**
 * Emit the assignment line that installs the factory on the class constructor,
 * for insertion into the `apply${Name}Generated(ctor)` block. The static name
 * (default `allArgs`, or user's `staticName` option) is reflected in both the
 * cast and the assignment.
 */
export function emitAllArgsConstructorApplyAssignment(info: ClassInfo): string {
  if (!hasAllArgsConstructor(info)) return '';
  const staticName = getAllArgsStaticName(info);
  const paramsType = emittedParams(info).map((p) => p.typeAnnotation).join(', ');
  return `(ctor as typeof ${info.name} & { ${staticName}(${paramsType}): ${info.name} }).${staticName} = ${info.name}_allArgs;`;
}

/**
 * Emit the declaration-shim augmentation for the generated static factory,
 * so `.lombok.augment.d.ts` types `Class.allArgs(...)` (or the custom
 * `staticName`) correctly. Lines are emitted inside the per-class
 * `declare module '<source>'` block.
 */
export function emitAllArgsConstructorNamespaceLines(info: ClassInfo): string[] {
  if (!hasAllArgsConstructor(info)) return [];
  const staticName = getAllArgsStaticName(info);
  const paramsType = emittedParams(info).map((p) => p.typeAnnotation).join(', ');
  return [
    `  namespace ${info.name} {`,
    `    export function ${staticName}(${paramsType}): ${info.name};`,
    `  }`,
    '',
  ];
}
